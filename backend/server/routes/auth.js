const { rateLimit } = require('express-rate-limit'); //import limit
const express = require('express'); // 📥 Import Express
const router = express.Router(); // 🏗️ Initialize the Express Router
const bcrypt = require('bcryptjs'); // 📥 Import security hashing library
const jwt = require('jsonwebtoken'); // 📥 Import JWT library
const passport = require('passport'); // 📥 Import Passport
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Import Google OAuth Strategy
const { sendEmail } = require('../services/emailService'); // 📧 Import our email service!
const { getVerificationEmailHelper, ResetPasswordEmail } = require('../Verifyer/emailTemplates'); // 📧 Import email formatting helper!
const crypto = require('crypto');
const authenticationToken = require('../middleware/authGuard');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
// 📤 We export a function that accepts the database connection 'db'
module.exports = (db) => {

    // 🛡️ 1. CONFIGURE PASSPORT GOOGLE STRATEGY
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5001/api/auth/google/callback" // The callback door
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // A. Search if this Google user already exists in our database
                let user = await db.get('SELECT * FROM users WHERE google_id = ?', profile.id);

                if (!user) {
                    // B. If they don't exist, register them as a new user!
                    const userId = Date.now().toString(); // Generate unique ID

                    await db.run(
                        'INSERT INTO users (id, username, password_hash, google_id, is_verified) VALUES (?, ?, ?, ?, ?)',
                        [userId, profile.displayName, 'OAUTH_USER', profile.id, 1]
                    );
                    user = { id: userId, username: profile.displayName };
                }

                // Pass the user details back to Passport
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }));

    // 🚪 2. THE LOGIN REDIRECT ROUTE: Takes user from React to Google's sign-in page
    // Path: GET http://localhost:5001/api/auth/google
    router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // 🤝 3. THE CALLBACK ROUTE: Where Google sends the user back after signing in
    // Path: GET http://localhost:5001/api/auth/google/callback
    router.get('/auth/google/callback',
        passport.authenticate('google', { session: false, failureRedirect: '/login' }),
        (req, res) => {
            // Google authenticated them successfully! Generate our JWT token for their session:
            const token = jwt.sign(
                { userId: req.user.id, username: req.user.username },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            // Redirect the user back to the React app and pass the token in the URL!
            res.redirect(`http://localhost:5173?token=${token}&username=${req.user.username}`);
        }
    );
    // Limit Login attempts to 5 every 15 minutes
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: { error: 'Too many security attempts! You are locked out for 15 minutes. ⏱️' },
        standardHeaders: true,
        legacyHeaders: false,
    });

    // ✍️ REGISTER: Sign up a new user with email verification
    // Path becomes: POST http://localhost:5001/api/users/register
    router.post('/users/register', async (req, res) => {
        try {
            const { username, password, email } = req.body;

            // 1. Basic validation: Make sure all fields are filled out
            if (!username || !password || !email) {
                return res.status(400).json({ error: 'Username, password, and email are required' });
            }

            const cleanUsername = username.trim();
            if (cleanUsername.length < 3) {
                return res.status(400).json({ error: 'Username must be at least 3 characters long' });
            }

            if (cleanUsername.includes(' ')) {
                return res.status(400).json({ error: 'Username must not contain spaces' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters long' });
            }

            const cleanEmail = email.trim();
            if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
                return res.status(400).json({ error: 'Please enter a valid email address' });
            }

            // 2. Check if the username is already taken in the database
            const existingUser = await db.get('SELECT * FROM users WHERE username = ?', cleanUsername);
            if (existingUser) {
                return res.status(400).json({ error: 'Username is already taken' });
            }

            // Check if the email is already registered
            const existingEmail = await db.get('SELECT * FROM users WHERE email = ?', cleanEmail);
            if (existingEmail) {
                return res.status(400).json({ error: 'Email is already registered' });
            }

            // 3. Hash the password securely using bcryptjs (10 salt rounds)
            const passwordHash = await bcrypt.hash(password, 10);
            const userId = Date.now().toString(); // Generate unique user ID

            // Generate a secure 6-digit code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

            // 4. Save the user to the database as unverified with their code
            await db.run(
                'INSERT INTO users (id, username, email, password_hash, is_verified, verification_code) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, cleanUsername, cleanEmail, passwordHash, 0, verificationCode]
            );

            // 5. Send verification email in the background
            const emailHtml = getVerificationEmailHelper(cleanUsername, verificationCode);

            sendEmail(cleanEmail, 'Verify Your Vindobona Pro Account 🔑', emailHtml)
                .catch(err => console.error('Error sending verification email:', err));

            // 6. Respond with success & signal verification requirement
            res.status(201).json({
                message: 'Registration successful! Verification code sent to your email. 🎉',
                requiresVerification: true,
                username: cleanUsername
            });
        } catch (error) {
            console.error('Registration error:', error);
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                if (error.message.includes('email')) {
                    return res.status(400).json({ error: 'Email is already registered' });
                }
                return res.status(400).json({ error: 'Username is already taken' });
            }
            res.status(500).json({ error: 'Failed to register user' });
        }
    });

    // 🔑 LOGIN: Verify user credentials and generate a JWT token
    // Path becomes: POST http://localhost:5001/api/auth/login
    router.post('/auth/login', authLimiter, async (req, res) => {
        try {
            const { username, password } = req.body;

            // 1. Basic validation: Make sure both fields are filled out
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            // 2. Look up the user in the database
            const user = await db.get('SELECT * FROM users WHERE username = ?', username);
            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            // 3. Compare the entered password with the hashed password stored in the DB
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            // 3b. Verify if user is email-verified
            if (user.is_verified === 0) {
                return res.status(403).json({
                    error: 'Account not verified. Please enter the verification code sent to your email.',
                    requiresVerification: true,
                    username: user.username
                });
            }
            // ask 2FA Check: if user has 2fa enabled..stop here and ask their authentication code
            if (user.two_factor_enabled == 1) {
                return res.status(200).json({
                    message: "2fa authentication required",
                    requires2FA: true,
                    username: user.username
                })
            }


            // 4. Generate a JWT Token signed with a secret key
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '2h' } // Token expires in 2 hours
            );

            // 5. Send the token back to the React frontend
            res.status(200).json({
                message: 'Login successful! 🚀',
                token: token,
                username: user.username
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Failed to login user' });
        }
    });

    // ✉️ VERIFY: Enter the 6-digit code to activate account and log in directly
    // Path becomes: POST http://localhost:5001/api/users/verify
    router.post('/users/verify', async (req, res) => {
        try {
            const { username, code } = req.body;

            if (!username || !code) {
                return res.status(400).json({ error: 'Username and verification code are required' });
            }

            const cleanUsername = username.trim();
            const cleanCode = code.trim();

            // Find the user
            const user = await db.get('SELECT * FROM users WHERE username = ?', cleanUsername);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Check if already verified
            if (user.is_verified === 1) {
                // Generate token and login immediately anyway
                const token = jwt.sign(
                    { userId: user.id, username: user.username },
                    process.env.JWT_SECRET,
                    { expiresIn: '2h' }
                );
                return res.status(200).json({
                    message: 'Account is already verified! 🚀',
                    token,
                    username: user.username
                });
            }

            // Check the verification code
            if (user.verification_code !== cleanCode) {
                return res.status(400).json({ error: 'Invalid verification code. Please check your email.' });
            }

            // Update database: set verified and clear code
            await db.run(
                'UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?',
                user.id
            );

            // Log them in immediately: generate a JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            res.status(200).json({
                message: 'Email verified successfully! Welcome to your dashboard! 🚀',
                token,
                username: user.username
            });
        } catch (error) {
            console.error('Verification error:', error);
            res.status(500).json({ error: 'Failed to verify user account' });
        }
    });
    // ✉️ FORGOT PASSWORD: Send a secure link to reset password
    // Path: POST http://localhost:5001/api/auth/forgot-password
    router.post('/auth/forgot-password', authLimiter, async (req, res) => {
        try {
            const { email } = req.body;

            // 1. Basic validation: Make sure email was submitted
            if (!email) {
                return res.status(400).json({ error: 'Email address is required' });
            }

            const cleanEmail = email.trim().toLowerCase();

            // 2. Find the user in the database
            const user = await db.get('SELECT * FROM users WHERE email = ?', cleanEmail);

            // 🔒 SECURITY BEST PRACTICE (User Enumeration Prevention):
            // If the email is not in our database, we do NOT tell the client "Email not found".
            // That would let hackers check which emails are registered. We return the same success message!
            if (!user) {
                return res.status(200).json({
                    message: 'If that email is registered, a password reset link has been sent. ✉️'
                });
            }

            // 3. Generate a secure random token (keycard)
            const resetToken = crypto.randomBytes(32).toString('hex');

            // 4. Set token lifespan (15 minutes from now)
            const resetTokenExpiry = Date.now() + 15 * 60 * 1000;

            // 5. Store the token and expiry inside the user's database row
            await db.run(
                'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
                [resetToken, resetTokenExpiry, user.id]
            );

            // 6. Build the reset link pointing to our React frontend
            const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

            // 7. Render the template we created in Part A
            const emailHtml = ResetPasswordEmail(user.username, resetLink);

            // 8. Send the email in the background
            sendEmail(cleanEmail, 'Reset your Vindobona Pro password 🔑', emailHtml)
                .catch(err => console.error('Error sending reset email:', err));

            // 9. Respond with a successful message
            res.status(200).json({
                message: 'If that email is registered, a password reset link has been sent. ✉️'
            });



        } catch (error) {
            console.error('Forgot password error:', error);
            res.status
                (500).json({ error: 'Failed to request password reset' });
        }
    });

    router.post('/auth/reset-password', authLimiter, async (req, res) => {
        try {
            const { token, newPassword } = req.body;

            // 1. Basic validation: Make sure both token and new password are submitted
            if (!token || !newPassword) {
                return res.status(400).json({ error: 'Token and new password are required' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters long' });
            }

            // 2. Find the user with this token
            const user = await db.get('SELECT * FROM users WHERE reset_token = ?', token);

            // 3. If no user has this token, it is invalid
            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired password reset token.' });
            }

            // 4. Check if the token has expired
            const currentTime = Date.now();
            if (currentTime > user.reset_token_expiry) {
                // Clean up the expired token fields from database
                await db.run(
                    'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
                    user.id
                );
                return res.status(400).json({ error: 'Your reset link has expired (15-minute limit reached).' });
            }

            // 5. Hash the new password securely (10 salt rounds)
            const newPasswordHash = await bcrypt.hash(newPassword, 10);

            // 6. Update user's password and clear the reset fields
            await db.run(
                'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
                [newPasswordHash, user.id]
            );

            // 7. Respond with a success message!
            res.status(200).json({
                message: 'Password reset successfully! You can now log in with your new password. 🚀'
            });



        } catch (error) {
            console.error('Password Reset Error:', error);
            res.status(500).json({ error: 'Failed to reset password' });
        }
    });

    // 📱 2FA STATUS: Check if 2FA is enabled for the logged-in user
    // Path: GET http://localhost:5001/api/auth/2fa/status
    router.get('/auth/2fa/status', authenticationToken, async (req, res) => {
        try {
            const user = await db.get('SELECT two_factor_enabled FROM users WHERE id = ?', req.user.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            res.status(200).json({ enabled: user.two_factor_enabled === 1 });
        } catch (error) {
            console.error('2FA status check error:', error);
            res.status(500).json({ error: 'Failed to retrieve 2FA status.' });
        }
    });

    // 📱 2FA SETUP: Generate a new secret and return a QR code
    // Path: POST http://localhost:5001/api/auth/2fa/setup
    router.post('/auth/2fa/setup', authenticationToken, async (req, res) => {
        try {
            // 1. Generate a random secret key (e.g., KVKFK...)
            const secret = authenticator.generateSecret();

            // 2. Generate a secure OTP authentication URL
            const otpauth = authenticator.keyuri(
                req.user.username,
                'Vindobona Pro',
                secret
            );

            // 3. Convert the OTP Auth URL into a scanable Base64 QR Code image
            const qrCodeUrl = await qrcode.toDataURL(otpauth);

            // 4. Temporarily save the secret to the user's database row
            await db.run(
                'UPDATE users SET two_factor_secret = ? WHERE id = ?',
                [secret, req.user.userId]
            );

            // 5. Send the QR Code image and the plaintext secret back to the React frontend
            res.status(200).json({
                qrCodeUrl,
                secret
            });
        } catch (error) {
            console.error('2FA setup error:', error);
            res.status(500).json({ error: 'Failed to generate 2FA setup QR Code.' });
        }
    });

    // 📱 2FA VERIFY & ENABLE: Check code and activate 2FA permanently
    // Path: POST http://localhost:5001/api/auth/2fa/verify
    router.post('/auth/2fa/verify', authenticationToken, async (req, res) => {
        try {
            const { code } = req.body;

            if (!code) {
                return res.status(400).json({ error: 'Verification code is required.' });
            }

            // 1. Fetch the user's temporary secret from the database
            const user = await db.get('SELECT two_factor_secret FROM users WHERE id = ?', req.user.userId);
            if (!user || !user.two_factor_secret) {
                return res.status(400).json({ error: '2FA setup was not initiated. Please start setup again.' });
            }

            // 2. Verify the 6-digit code against the secret using otplib authenticator
            const isValid = authenticator.verify({
                token: code,
                secret: user.two_factor_secret
            });

            if (!isValid) {
                return res.status(400).json({ error: 'Invalid authentication code. Please try again.' });
            }

            // 3. Mark 2FA as fully enabled in the database
            await db.run(
                'UPDATE users SET two_factor_enabled = 1 WHERE id = ?',
                req.user.userId
            );

            res.status(200).json({ message: 'Two-Factor Authentication enabled successfully! 🎉' });
        } catch (error) {
            console.error('2FA verification error:', error);
            res.status(500).json({ error: 'Failed to verify 2FA code.' });
        }
    });

    // 📱 2FA LOGIN: Verify the authenticator code and return the JWT token
    // Path: POST http://localhost:5001/api/auth/2fa/login
    router.post('/auth/2fa/login', authLimiter, async (req, res) => {
        try {
            const { username, code } = req.body;

            // 1. Validate input
            if (!username || !code) {
                return res.status(400).json({ error: 'Username and authenticator code are required.' });
            }

            // 2. Find the user in the database
            const user = await db.get('SELECT * FROM users WHERE username = ?', username);
            if (!user) {
                return res.status(401).json({ error: 'Invalid login request.' });
            }

            // 3. Double check that 2FA is actually enabled for this user
            if (user.two_factor_enabled !== 1 || !user.two_factor_secret) {
                return res.status(400).json({ error: '2FA is not enabled for this account.' });
            }

            // 4. Verify the 6-digit code against their secret
            const isValid = authenticator.verify({
                token: code,
                secret: user.two_factor_secret
            });

            if (!isValid) {
                return res.status(401).json({ error: 'Invalid authenticator code. Please try again.' });
            }

            // 5. Code is valid! Generate the final JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            // 6. Return the success message and token to frontend
            res.status(200).json({
                message: 'Login successful! 🚀',
                token,
                username: user.username
            });
        } catch (error) {
            console.error('2FA login error:', error);
            res.status(500).json({ error: 'Failed to verify 2FA login.' });
        }
    });
    return router; // 📤 Return the router back to server.js
};
