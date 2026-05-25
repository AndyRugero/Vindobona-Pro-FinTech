const express = require('express'); // 📥 Import Express
const router = express.Router(); // 🏗️ Initialize the Express Router
const bcrypt = require('bcryptjs'); // 📥 Import security hashing library
const jwt = require('jsonwebtoken'); // 📥 Import JWT library
const passport = require('passport'); // 📥 Import Passport
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Import Google OAuth Strategy
const { sendEmail } = require('../services/emailService'); // 📧 Import our email service!
const { getVerificationEmailHelper } = require('../Verifyer/emailTemplates'); // 📧 Import email formatting helper!

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
    router.post('/auth/login', async (req, res) => {
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

    return router; // 📤 Return the router back to server.js
};
