import React, { useState, useEffect } from 'react';
import '../Styles/AuthScreen.css';
import {
    Landmark,
    Info,
    HelpCircle,
    Lock,
    RefreshCw,
    BarChart3,
    Globe,
    Bot,
    Zap,
    Phone,
    Mail,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

import { API_BASE_URL } from '../config';


// 🔌 Props: This tells React what inputs this component receives from its parent (App.tsx)
interface AuthScreenProps {
    onLoginSuccess: (token: string, username: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
    // 🗂️ Top nav tab: 'portal' = login/signup, 'about' = About Us, 'faq' = FAQ
    const [activeTab, setActiveTab] = useState<'portal' | 'about' | 'faq' | 'whatsnew'>('portal');
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/announcements`);
                if (res.ok) {
                    const data = await res.json();
                    setAnnouncements(data);
                }
            } catch (err) {
                console.error('Failed to fetch announcements:', err);
            }
        };
        fetchAnnouncements();
    }, []);

    // React States: These store what the user typed or which mode we are in
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyingUsername, setVerifyingUsername] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // 🔑 PASSWORD RESET FLOW STATES
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [is2FALogin, setIs2FALogin] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');

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
            setSuccessMessage('Login successful! ');
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
        <div className="auth-page">

            {/* ══ TOP NAVIGATION BAR ══ */}
            <header className="auth-topnav">
                <div className="auth-topnav-brand">
                    <span className="auth-topnav-logo">VINDOBONA</span>
                    <span className="auth-topnav-tagline">Pro FinTech</span>
                </div>
                <nav className="auth-topnav-links">
                    <button
                        className={`auth-nav-btn ${activeTab === 'portal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('portal')}
                    ><Landmark size={18}
                        className="auth-btn-icon"></Landmark> Portal</button>
                    <button
                        className={`auth-nav-btn ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    ><Info size={18}
                        className="auth-btn-icon"></Info> About Us</button>
                    <button
                        className={`auth-nav-btn ${activeTab === 'faq' ? 'active' : ''}`}
                        onClick={() => setActiveTab('faq')}
                    ><HelpCircle size={18}></HelpCircle> FAQ</button>
                    <button
                        className={`auth-nav-btn ${activeTab === 'whatsnew' ? 'active' : ''}`}
                        onClick={() => setActiveTab('whatsnew')}
                    ><Mail size={18} className="auth-btn-icon" /> What's New</button>
                </nav>
            </header>

            {/* ══ ABOUT US PAGE ══ */}
            {activeTab === 'about' && (
                <div className="auth-info-page">
                    <div className="info-hero">
                        <h1 className="info-hero-title">About Vindobona Pro</h1>
                        <p className="info-hero-sub">Premium FinTech Banking — Built for the modern world</p>
                    </div>
                    <div className="info-values-grid">
                        {[
                            { icon: <Lock size={24} />, title: 'Bank-Grade Security', desc: '256-bit encryption, 2FA authentication, and real-time fraud detection keep your money safe 24/7.' },
                            { icon: <RefreshCw size={24} />, title: 'Multi-Currency Wallets', desc: 'Hold, convert, and manage EUR, USD, GBP, CHF and more  all in one place with live exchange rates.' },
                            { icon: <BarChart3 size={24} />, title: 'Smart Analytics', desc: 'Visual spending charts, budget managers, and cash flow trends help you stay in control of your finances.' },
                            { icon: <Globe size={24} />, title: 'Vienna-Based & EU Licensed', desc: 'Regulated under FMA Austria and fully compliant with PSD2, GDPR, and EU financial standards.' },
                            { icon: <Bot size={24} />, title: 'AI Financial Assistant', desc: 'Andy, your personal AI, answers questions about your balance, spending and account  instantly.' },
                            { icon: <Zap size={24} />, title: 'Instant Transactions', desc: 'Send and receive money in seconds. Freeze your card instantly if you ever feel unsafe.' },
                        ].map((card) => (
                            <div key={card.title} className="info-value-card">
                                <span className="value-icon">{card.icon}</span>
                                <h3>{card.title}</h3>
                                <p>{card.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="info-contact-strip">
                        <p>
                            <Phone size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            <strong>+43 6769781869</strong> &nbsp;·&nbsp;
                            <Mail size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            <strong>andrun1@yahoo.com</strong> &nbsp;·&nbsp;
                            <Globe size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            <strong>vindobonapro.at</strong>
                        </p>
                        <button className="auth-nav-btn active" onClick={() => setActiveTab('portal')}>→ Go to Portal</button>
                    </div>
                </div>
            )}

            {/* ══ FAQ PAGE ══ */}
            {activeTab === 'faq' && (
                <div className="auth-info-page">
                    <div className="info-hero">
                        <h1 className="info-hero-title">Frequently Asked Questions</h1>
                        <p className="info-hero-sub">Everything you need to know about Vindobona Pro</p>
                    </div>
                    <div className="faq-list">
                        {[
                            { q: 'Is my money safe with Vindobona Pro?', a: 'Yes. All accounts are protected by 256-bit AES encryption and 2FA. We are licensed under FMA Austria and your deposits are covered up to €100,000 under EU protection schemes.' },
                            { q: 'How do I open an account?', a: 'Click "Portal" at the top, then "Sign Up". Enter your username, email and password. A 6-digit verification code will be sent to your email to activate your account.' },
                            { q: 'What currencies can I hold?', a: 'You can hold and convert EUR, USD, GBP, CHF, JPY and more using the FX Converter. Live exchange rates are applied automatically.' },
                            { q: 'How do I freeze my card?', a: 'Go to Payment Methods in the sidebar after logging in, then click the Freeze Card toggle. Your card is instantly frozen toggle again to unfreeze.' },
                            { q: 'Where can I find ATMs?', a: 'Log in and scroll to the ATM Map at the bottom of your dashboard. It shows your nearest Vindobona Pro ATMs on an interactive live map.' },
                            { q: 'What is the FX Converter?', a: 'The FX Converter lets you exchange money between your currency wallets at live market rates. Access it from the FX Converter menu in the sidebar.' },
                            { q: 'How do I contact support?', a: 'Call us at +43 676 9781 869 (Mon–Fri, 08:00–20:00 CET) or email andrun1@yahoo.com. You can also chat with Andy, our AI assistant, after logging in.' },
                            { q: 'Can I set spending budgets?', a: 'Yes! Go to Budgets in the sidebar. Set monthly limits per category (Food, Shopping, Travel etc.) and a visual progress bar tracks your spending.' },
                            { q: 'Is there a mobile app?', a: 'Our web app is fully mobile-responsive. A dedicated iOS and Android app is coming soon!' },
                        ].map((item, i) => (
                            <FaqItem key={i} question={item.q} answer={item.a} />
                        ))}
                    </div>
                    <div className="info-contact-strip">
                        <p>
                            Still have questions? &nbsp;
                            <Phone size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            <strong>+43 6769781869</strong> &nbsp;·&nbsp;
                            <Mail size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            <strong>andrun1@yahoo.com</strong>
                        </p>
                        <button className="auth-nav-btn active" onClick={() => setActiveTab('portal')}>→ Go to Portal</button>
                    </div>
                </div>
            )}

            {/* ══ LOGIN / SIGNUP PORTAL ══ */}
            {activeTab === 'portal' && (
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
                                    <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 characters" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required />
                                </div>
                                <button type="submit" className="auth-button">Reset Password</button>
                            </form>
                        ) : isForgotPassword ? (
                            /* ✉️ Forgot Password Form */
                            <form onSubmit={handleForgotSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="forgotEmail">Email Address</label>
                                    <input type="email" id="forgotEmail" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} placeholder="Enter your email" required />
                                </div>
                                <button type="submit" className="auth-button">Send Reset Link</button>
                            </form>
                        ) : isVerifying ? (
                            /* 📧 Verification Code Form */
                            <form onSubmit={handleVerifySubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="verificationCode">Verification Code</label>
                                    <input type="text" id="verificationCode" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit code" maxLength={6} required />
                                </div>
                                <button type="submit" className="auth-button">Verify & Login</button>
                            </form>
                        ) : is2FALogin ? (
                            /* 📱 2FA Code Input Form */
                            <form onSubmit={handle2FALoginSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="twoFactorCode">Authenticator Code</label>
                                    <input type="text" id="twoFactorCode" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit code" maxLength={6} required />
                                </div>
                                <button type="submit" className="auth-button">Verify & Login</button>
                            </form>
                        ) : (
                            /* 🚪 Login / Sign Up Form */
                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" required />
                                </div>
                                {!isLogin && (
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                                </div>
                                {isLogin && (
                                    <div className="forgot-password-link">
                                        <span onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMessage(''); }}>Forgot Password?</span>
                                    </div>
                                )}
                                <button type="submit" className="auth-button">{isLogin ? 'Log In' : 'Sign Up'}</button>
                                <button type="button" className="google-btn" onClick={() => window.location.href = `${API_BASE_URL}/api/auth/google`}>
                                    <img src="/google-logo.svg" alt="Google" className="google-icon" />
                                    <span>Sign in with Google</span>
                                </button>
                            </form>
                        )}

                        {/* Bottom Toggle Navigation Links */}
                        {isResetMode ? (
                            <p className="auth-toggle"><span onClick={() => { setIsResetMode(false); setError(''); setSuccessMessage(''); setTwoFactorCode(''); window.history.replaceState({}, document.title, '/'); }}>Back to Login</span></p>
                        ) : isForgotPassword ? (
                            <p className="auth-toggle"><span onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMessage(''); setTwoFactorCode(''); }}>Back to Login</span></p>
                        ) : isVerifying ? (
                            <p className="auth-toggle">Need to login or sign up?{' '}<span onClick={() => { setIsVerifying(false); setIsLogin(true); setError(''); setSuccessMessage(''); setVerificationCode(''); }}>Back to Login</span></p>
                        ) : is2FALogin ? (
                            <p className="auth-toggle"><span onClick={() => { setIs2FALogin(false); setIsLogin(true); setError(''); setSuccessMessage(''); setTwoFactorCode(''); }}>Back to Login</span></p>
                        ) : (
                            <p className="auth-toggle">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <span onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); }}>{isLogin ? 'Sign Up' : 'Log In'}</span>
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ══ WHAT'S NEW / ANNOUNCEMENTS PAGE ══ */}
            {activeTab === 'whatsnew' && (
                <div className="auth-info-page">
                    <div className="info-hero">
                        <h1 className="info-hero-title">What's New at Vindobona Pro</h1>
                        <p className="info-hero-sub">Read our latest feature releases and security updates</p>
                    </div>
                    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
                        {announcements.length === 0 ? (
                            <div className="empty-logs" style={{ textAlign: 'center', padding: '40px', background: '#0c1222', borderRadius: '12px', border: '1px solid #1e293b' }}>
                                No new updates published yet. Check back soon!
                            </div>
                        ) : (
                            announcements.map((ann) => (
                                <div key={ann.id} style={{ background: '#0c1222', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', position: 'relative' }}>
                                    <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>{ann.title}</h2>
                                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '14px' }}>
                                        Published on {new Date(ann.created_at).toLocaleString()}
                                    </span>
                                    <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {ann.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="info-contact-strip">
                        <p>Want to check your balance or make a transfer?</p>
                        <button className="auth-nav-btn active" onClick={() => setActiveTab('portal')}>→ Login / Sign Up</button>
                    </div>
                </div>
            )}

            {/* ══ FOOTER ══ */}
            <footer className="auth-footer">
                <p>© 2026 Vindobona Pro FinTech &nbsp;·&nbsp; Developed by Eng, Andy Rugero. Austria - Vienna &nbsp;·&nbsp; PSD2 &nbsp;·&nbsp; GDPR</p>
                <p>
                    <Phone size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    <strong>+43 6769781869</strong> &nbsp;·&nbsp;
                    <Mail size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    <strong>andrun1@yahoo.com</strong>
                </p>
            </footer>
        </div>
    );
};

// ── Collapsible FAQ accordion item component ──
const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`faq-item ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
            <div className="faq-question">
                <span>{question}</span>
                <span className="faq-chevron">{open ? <ChevronUp size={18} />
                    : <ChevronDown size={18} />}</span>
            </div>
            {open && <div className="faq-answer">{answer}</div>}
        </div>
    );
};

export default AuthScreen;