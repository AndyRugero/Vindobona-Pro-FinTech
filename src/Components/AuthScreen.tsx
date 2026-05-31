import React, { useState, useEffect } from 'react';
import '../Styles/AuthScreen.css';
import { API_BASE_URL } from '../config';

// 🔌 Props: This tells React what inputs this component receives from its parent (App.tsx)
interface AuthScreenProps {
    onLoginSuccess: (token: string, username: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
    // React States: These store what the user typed or which mode we are in
    const [isLogin, setIsLogin] = useState(true);          // true = Login mode, false = Sign-Up mode
    const [username, setUsername] = useState('');          // Stores the typed username
    const [email, setEmail] = useState('');                // Stores the typed email (Sign-Up mode only)
    const [password, setPassword] = useState('');          // Stores the typed password
    const [verificationCode, setVerificationCode] = useState(''); // Stores the 6-digit verification code
    const [isVerifying, setIsVerifying] = useState(false);  // true = shows email verification OTP screen
    const [verifyingUsername, setVerifyingUsername] = useState(''); // Stores username currently being verified
    const [error, setError] = useState('');                // Stores any error message from the server
    const [successMessage, setSuccessMessage] = useState(''); // Stores any success message to show

    // 🔑 NEW STATES FOR PASSWORD RESET FLOW
    const [isForgotPassword, setIsForgotPassword] = useState(false); // Shows Forgot Password form
    const [isResetMode, setIsResetMode] = useState(false);           // Shows Reset Password form
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState(''); // Email for forgot password form
    const [newPassword, setNewPassword] = useState('');              // New password typed by user
    const [confirmPassword, setConfirmPassword] = useState('');      // Confirm new password
    const [resetToken, setResetToken] = useState('');                // Token from email URL
    const [is2FALogin, setIs2FALogin] = useState(false); //YEs OR nO SWITCH screen to show 2FA prompt
    const [twoFactorCode, setTwoFactorCode] = useState(''); //Memory slot for the 6 digit code user

    // 🕵️‍♂️ URL Detector: Check if the user loaded the page via a reset password link on startup
    useEffect(() => {
        const path = window.location.pathname;
        if (path === '/reset-password') {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');
            if (token) {
                setResetToken(token);
                setIsResetMode(true);
            }
        }
    }, []);

    // This function runs when the user clicks the submit button on Login or Sign-Up forms
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Stops the webpage from reloading when submitting
        setError('');       // Clear any old error message
        setSuccessMessage(''); // Clear any old success message

        // Check: Make sure the user didn't leave boxes blank
        if (!username || !password) {
            setError('Please type in both a username and password.');
            return;
        }

        if (!isLogin && !email) {
            setError('Please enter your email address.');
            return;
        }

        // 🗺️ Choose the API path depending on if we are logging in or signing up
        const endpoint = isLogin ? '/api/auth/login' : '/api/users/register';
        const url = `${API_BASE_URL}${endpoint}`;
        const requestBody = isLogin ? { username, password } : { username, password, email };

        try {
            // 📞 Send the credentials to our backend server
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            // ⚠️ If the server returned a bad status (like 400 or 401), show the error
            if (!response.ok) {
                // If login fails because user is unverified, route them to verification screen
                if (response.status === 403 && data.requiresVerification) {
                    setIsVerifying(true);
                    setVerifyingUsername(data.username || username);
                    setError(data.error);
                    return;
                }
                throw new Error(data.error || 'Something went wrong.');
            }

            // 🎉 If we made it here, the API call succeeded!
            if (isLogin) {
                //check if backend is asking for aFA code bfr issuing a token
                if (data.requires2FA) {
                    setIs2FALogin(true);//toggle Ui into 2FA verification mode
                    setSuccessMessage(data.message || '2FA verification required. Please enter your 6-digit code.');

                }

                else {
                    // If logging in, send the token and username back to App.tsx
                    onLoginSuccess(data.token, data.username);
                }
            } else {
                // If signing up, switch to verification OTP screen
                setSuccessMessage(data.message || 'Registration successful! Verification code sent.');
                setIsVerifying(true);
                setVerifyingUsername(data.username || username);
                setPassword(''); // Clear the password box
            }

        } catch (err: any) {
            // Show the error message if the server failed or connection failed
            setError(err.message || 'Cannot connect to the server.');
        }
    };

    // This function runs when the user submits their 6-digit OTP verification code
    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!verificationCode) {
            setError('Please enter the 6-digit verification code.');
            return;
        }

        const url = `${API_BASE_URL}/api/users/verify`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: verifyingUsername, code: verificationCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed.');
            }

            // Successfully verified! Log in directly using the returned token
            setSuccessMessage(data.message);
            onLoginSuccess(data.token, data.username);
        } catch (err: any) {
            setError(err.message || 'Cannot connect to the server.');
        }
    };
    // 📱 HANDLER: Sends the rolling 6-digit 2FA code to the backend for verification during login
    const handle2FALoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();    // 1. Stop page from reloading
        setError('');          // 2. Clear old errors
        setSuccessMessage(''); // 3. Clear old success messages

        // 4. Validate: If code is not 6 digits, stop here and show error!
        if (!twoFactorCode || twoFactorCode.length !== 6) {
            setError('Please enter a valid 6-digit authenticator code.');
            return; // 'return' stops the function from continuing!
        }

        const url = `${API_BASE_URL}/api/auth/2fa/login`;

        try {
            // 5. Send POST request with the username and the code
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, code: twoFactorCode }),
            });

            // 6. Read the JSON response from server
            const data = await response.json();

            // 7. If status is bad, throw an error to trigger the catch block
            if (!response.ok) {
                throw new Error(data.error || '2FA authentication failed.');
            }

            // 8. Success! Save the session token and log in
            setSuccessMessage('Login successful! 🚀');
            onLoginSuccess(data.token, data.username);
        } catch (err: any) {
            // 9. If server or connection fails, show the error on screen
            setError(err.message || 'Cannot connect to the server.');
        }
    };

    // ✉️ Handler: Sends "Forgot Password" request to backend
    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!forgotPasswordEmail) {
            setError('Please enter your email address.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotPasswordEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong.');
            }

            setSuccessMessage(data.message || 'If registered, a reset link has been sent!');
            setForgotPasswordEmail('');
        } catch (err: any) {
            setError(err.message || 'Cannot connect to the server.');
        }
    };

    // 🔐 Handler: Sends "Reset Password" form data to backend
    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!newPassword || !confirmPassword) {
            setError('Please fill out both password fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetToken, newPassword }),
            });

            const data = await response.json();

            //limiter handler 5th feature(5 times try)

            if (!response.ok) {
                throw new Error(data.error || 'Password reset failed.');
            }

            setSuccessMessage(data.message || 'Password reset successful!');
            setNewPassword('');
            setConfirmPassword('');

            // Redirect back to login after 3 seconds
            setTimeout(() => {
                setIsResetMode(false);
                setSuccessMessage('');
                window.history.replaceState({}, document.title, '/'); // Clean URL
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Cannot connect to the server.');
        }
    };

    // 🏷️ Dynamic title selection
    const getCardTitle = () => {
        if (isResetMode) return 'Reset Password';
        if (isForgotPassword) return 'Forgot Password';
        if (isVerifying) return 'Verify Your Email';
        if (is2FALogin) return 'Two-Factor Verification';
        return isLogin ? 'Welcome Back' : 'Create Account';
    };

    // 🏷️ Dynamic subtitle selection
    const getCardSubtitle = () => {
        if (isResetMode) return 'Enter your new password below';
        if (isForgotPassword) return 'Enter your email to receive a reset link';
        if (isVerifying) return 'Enter the 6-digit code sent to your inbox';
        if (is2FALogin) return 'Enter the 6-digit code from your authenticator app';
        return isLogin ? 'Log in to access your financial dashboard' : 'Sign up to get started';
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Header Title & Subtitle */}
                <h2>{getCardTitle()}</h2>
                <p className="auth-subtitle">{getCardSubtitle()}</p>

                {/* Notification Badges */}
                {error && <div className="auth-error">{error}</div>}
                {successMessage && <div className="auth-success">{successMessage}</div>}

                {/* Conditional Form Render */}
                {isResetMode ? (
                    /* 🔐 Reset Password Form */
                    <form onSubmit={handleResetSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button">
                            Reset Password
                        </button>
                    </form>
                ) : isForgotPassword ? (
                    /* ✉️ Forgot Password Form */
                    <form onSubmit={handleForgotSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="forgotEmail">Email Address</label>
                            <input
                                type="email"
                                id="forgotEmail"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button">
                            Send Reset Link
                        </button>
                    </form>
                ) : isVerifying ? (
                    /* 📧 Verification Code Form */
                    <form onSubmit={handleVerifySubmit} className="auth-form">
                        <div className="form-group">

                            <label htmlFor="verificationCode">Verification Code</label>
                            <input
                                type="text"
                                id="verificationCode"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button">
                            Verify & Login
                        </button>
                    </form>

                    /* 📱 2FA Code Input Form */
                ) : is2FALogin ? (
                    <form onSubmit={handle2FALoginSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="twoFactorCode">Authenticator Code</label>
                            <input
                                type="text"
                                id="twoFactorCode"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button">
                            Verify & Login
                        </button>
                    </form>
                ) : (
                    /* 🚪 Login / Sign Up Form */
                    <form onSubmit={handleSubmit} className="auth-form">
                        {/* Username */}
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                            />
                        </div>

                        {/* Email (Sign-Up mode only) */}
                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        )}

                        {/* Password */}
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {/* Forgot Password Link (Login mode only) */}
                        {isLogin && (
                            <div className="forgot-password-link">
                                <span onClick={() => {
                                    setIsForgotPassword(true);
                                    setError('');
                                    setSuccessMessage('');

                                }}>
                                    Forgot Password?
                                </span>
                            </div>
                        )}

                        {/* Submit button */}
                        <button type="submit" className="auth-button">
                            {isLogin ? 'Log In' : 'Sign Up'}
                        </button>

                        {/* Google button */}
                        <button
                            type="button"
                            className="google-btn"
                            onClick={() => window.location.href = `${API_BASE_URL}/api/auth/google`}
                        >
                            <img src="/google-logo.svg" alt="Google" className="google-icon" />
                            <span>Sign in with Google</span>
                        </button>
                    </form>
                )}

                {/* Bottom Toggle Navigation Links */}
                {isResetMode ? (
                    <p className="auth-toggle">
                        <span onClick={() => {
                            setIsResetMode(false);
                            setError('');
                            setSuccessMessage('');
                            setTwoFactorCode('');
                            window.history.replaceState({}, document.title, '/'); // Clean URL
                        }}>
                            Back to Login
                        </span>
                    </p>
                ) : isForgotPassword ? (
                    <p className="auth-toggle">
                        <span onClick={() => {
                            setIsForgotPassword(false);
                            setError('');
                            setSuccessMessage('');
                            setTwoFactorCode('');
                        }}>
                            Back to Login
                        </span>
                    </p>
                ) : isVerifying ? (
                    <p className="auth-toggle">
                        Need to login or sign up?{' '}
                        <span onClick={() => {
                            setIsVerifying(false);
                            setIsLogin(true);
                            setError('');
                            setSuccessMessage('');
                            setVerificationCode('');
                        }}>
                            Back to Login
                        </span>
                    </p>
                ) : is2FALogin ? (
                    <p className="auth-toggle">
                        <span onClick={() => {
                            setIs2FALogin(false);
                            setIsLogin(true);
                            setError('');
                            setSuccessMessage('');
                            setTwoFactorCode('');
                        }}>
                            Back to Login
                        </span>
                    </p>
                ) : (
                    <p className="auth-toggle">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setSuccessMessage('');
                        }}>
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default AuthScreen;