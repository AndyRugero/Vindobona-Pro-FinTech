import React, { useState, } from 'react';
import '../Styles/AuthScreen.css';

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

    //  This function runs when the user clicks the submit button on Login or Sign-Up forms
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Stops the webpage from reloading when submitting
        setError('');       // Clear any old error message
        setSuccessMessage(''); // Clear any old success message

        //  Check: Make sure the user didn't leave boxes blank
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
        const url = `http://localhost:5001${endpoint}`;
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
                // If logging in, send the token and username back to App.tsx
                onLoginSuccess(data.token, data.username);
            } else {
                // If signing up, switch to verification OTP screen
                setSuccessMessage(data.message || 'Registration successful! Verification code sent.');
                setIsVerifying(true);
                setVerifyingUsername(data.username || username);
                setPassword(''); // Clear the password box
            }
        } catch (err: any) {
            //  Show the error message if the server failed or connection failed
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

        const url = `http://localhost:5001/api/users/verify`;

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

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* The card header changes text based on our state */}
                <h2>
                    {isVerifying
                        ? 'Verify Your Email'
                        : isLogin
                            ? 'Welcome Back'
                            : 'Create Account'}
                </h2>
                <p className="auth-subtitle">
                    {isVerifying
                        ? 'Enter the 6-digit code sent to your inbox'
                        : isLogin
                            ? 'Log in to access your financial dashboard'
                            : 'Sign up to get started'}
                </p>

                {/* Show badges only if we have messages to display */}
                {error && <div className="auth-error">{error}</div>}
                {successMessage && <div className="auth-success">{successMessage}</div>}

                {/* Render the appropriate form envelope */}
                {isVerifying ? (
                    <form onSubmit={handleVerifySubmit} className="auth-form">
                        {/* OTP Verification Code Input Box */}
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

                        {/* Submit Button */}
                        <button type="submit" className="auth-button">
                            Verify & Login
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">

                        {/* Username Input Box */}
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

                        {/* Email Input Box (Sign-Up mode only) */}
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

                        {/* Password Input Box */}
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

                        {/* Submit Button */}
                        <button type="submit" className="auth-button">
                            {isLogin ? 'Log In ' : 'Sign Up '}
                        </button>

                        {/* Branded Google Sign-in Button */}
                        <button
                            type="button"
                            className="google-btn"
                            onClick={() => window.location.href = 'http://localhost:5001/api/auth/google'}
                        >
                            <img src="/google-logo.svg" alt="Google" className="google-icon" />
                            <span>Sign in with Google</span>
                        </button>
                    </form>
                )}

                {/* Switch Link: toggles between Login, Register, and Verify modes */}
                {isVerifying ? (
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