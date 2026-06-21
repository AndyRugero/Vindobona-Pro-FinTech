import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, QrCode, Key, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import '../Styles/SettingsView.css';
import { API_BASE_URL } from '../config'; //imports production/development API

interface SettingsViewProps {
    token: string | null;
    username: string | null;
    avatarUrl?: string | null;
    onAvatarUpdate?: (newUrl: string | null) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ token, username, avatarUrl, onAvatarUpdate }) => {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Setup States
    const [showSetup, setShowSetup] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (PNG/JPEG/GIF, etc.).');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('Image file is too large. Please choose an image smaller than 2MB.');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;

                try {
                    const response = await fetch(`${API_BASE_URL}/api/users/avatar`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ avatar_url: base64String })
                    });

                    const data = await response.json();
                    if (response.ok) {
                        if (onAvatarUpdate) {
                            onAvatarUpdate(base64String);
                        }
                        setSuccess('Profile picture updated successfully! 👤');
                    } else {
                        setError(data.error || 'Failed to upload profile picture.');
                    }
                } catch (err) {
                    setError('Failed to connect to the server to upload profile picture.');
                } finally {
                    setUploading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setError('Error reading file.');
            setUploading(false);
        }
    };

    // Fetch the 2FA Status when the component mounts
    useEffect(() => {
        const check2FAStatus = async () => {
            if (!token) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/2fa/status`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    setTwoFactorEnabled(data.enabled);
                } else {
                    setError(data.error || 'Failed to retrieve 2FA status.');
                }
            } catch (err) {
                setError('Cannot connect to the server to check 2FA status.');
            } finally {
                setLoading(false);
            }
        };

        check2FAStatus();
    }, [token]);

    // Handler to initiate 2FA Setup
    const handleStartSetup = async () => {
        if (!token) return;
        setError('');
        setSuccess('');
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/2fa/setup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok) {
                setQrCodeUrl(data.qrCodeUrl);
                setSecret(data.secret);
                setShowSetup(true);
            } else {
                setError(data.error || 'Failed to initiate 2FA setup.');
            }
        } catch (err) {
            setError('Cannot connect to the server to start 2FA setup.');
        } finally {
            setActionLoading(false);
        }
    };

    // Handler to verify and activate 2FA
    const handleVerifySetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setError('');
        setSuccess('');

        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit verification code.');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/2fa/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: verificationCode })
            });

            const data = await response.json();
            if (response.ok) {
                setTwoFactorEnabled(true);
                setShowSetup(false);
                setSuccess('Two-Factor Authentication (2FA) is now enabled successfully! 🚀');
                setVerificationCode('');
            } else {
                setError(data.error || 'Failed to verify code.');
            }
        } catch (err) {
            setError('Cannot connect to the server to verify code.');
        } finally {
            setActionLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!secret) return;
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="settings-loading">
                <div className="spinner"></div>
                <p>Loading settings dashboard...</p>
            </div>
        );
    }

    return (
        <div className="settings-view">
            <header className="settings-header">
                <h2>Account Settings</h2>
                <p className="settings-subtitle">Manage your profile, security options, and multi-factor credentials.</p>
            </header>

            <div className="settings-grid">
                {/* Profile Card */}
                <section className="settings-card profile-section">
                    <h3>User Profile</h3>
                    <div className="profile-details">
                        <div className="avatar-large-container">
                            <div 
                                className="avatar-large" 
                                onClick={() => document.getElementById('avatar-file-input')?.click()}
                                style={{ cursor: 'pointer' }}
                                title="Click to upload profile picture"
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="avatar-large-img" />
                                ) : (
                                    username ? username.substring(0, 2).toUpperCase() : 'UR'
                                )}
                            </div>
                            <label htmlFor="avatar-file-input" className="avatar-upload-label">
                                {uploading ? 'Uploading...' : 'Change Picture'}
                            </label>
                            <input
                                type="file"
                                id="avatar-file-input"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                disabled={uploading}
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className="details-info">
                            <div className="detail-row">
                                <span className="detail-label">Username</span>
                                <span className="detail-value">{username || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Account Tier</span>
                                <span className="detail-value tier-badge">Premium account</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Status</span>
                                <span className="detail-value status-badge">Active</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security (2FA) Card */}
                <section className="settings-card security-section">
                    <div className="card-header-icon">
                        {twoFactorEnabled ? (
                            <ShieldCheck className="security-icon enabled" size={32} />
                        ) : (
                            <Shield className="security-icon disabled" size={32} />
                        )}
                        <h3>Two-Factor Authentication (2FA)</h3>
                    </div>

                    {error && (
                        <div className="settings-alert error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="settings-alert success">
                            <CheckCircle2 size={18} />
                            <span>{success}</span>
                        </div>
                    )}

                    {!twoFactorEnabled && !showSetup && (
                        <div className="security-status-inactive">
                            <p>
                                Two-Factor Authentication is currently <strong>Disabled</strong>. We highly recommend activating 2FA to protect your transactions and account details with a rolling secondary credential.
                            </p>
                            <button
                                className="settings-btn primary-btn"
                                onClick={handleStartSetup}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Connecting...' : 'Set Up 2FA'}
                            </button>
                        </div>
                    )}

                    {twoFactorEnabled && (
                        <div className="security-status-active">
                            <div className="status-banner">
                                <CheckCircle2 size={20} className="success-icon" />
                                <span>2FA Protection is Enabled & Active 🛡️</span>
                            </div>
                            <p>
                                Your account is secure. You will be prompted to enter a 6-digit authenticator code each time you log in to your dashboard.
                            </p>
                        </div>
                    )}

                    {/* Setup Panel (only shows when setup is active) */}
                    {showSetup && (
                        <div className="setup-container">
                            <div className="setup-steps">
                                <div className="step-item">
                                    <span className="step-num">1</span>
                                    <p>Scan this QR code using Google Authenticator, Microsoft Authenticator, or Authy on your mobile device.</p>
                                </div>

                                <div className="qr-container">
                                    {qrCodeUrl ? (
                                        <img src={qrCodeUrl} alt="2FA Setup QR Code" className="qr-image" />
                                    ) : (
                                        <div className="qr-placeholder">
                                            <QrCode size={64} />
                                        </div>
                                    )}
                                </div>

                                <div className="step-item">
                                    <span className="step-num">2</span>
                                    <p>Or manually enter this secret key if scanning is unavailable:</p>
                                </div>

                                <div className="secret-display">
                                    <Key size={16} className="secret-icon" />
                                    <code>{secret}</code>
                                    <button className="copy-btn" onClick={copyToClipboard} title="Copy secret key">
                                        {copied ? <Check size={16} className="copy-success" /> : <Copy size={16} />}
                                    </button>
                                </div>

                                <div className="step-item">
                                    <span className="step-num">3</span>
                                    <p>Enter the 6-digit rolling code generated by your app to verify configuration:</p>
                                </div>

                                <form onSubmit={handleVerifySetup} className="setup-verify-form">
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000 000"
                                        maxLength={6}
                                        required
                                        className="verify-input"
                                    />
                                    <div className="setup-actions">
                                        <button
                                            type="button"
                                            className="settings-btn secondary-btn"
                                            onClick={() => setShowSetup(false)}
                                            disabled={actionLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="settings-btn primary-btn"
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Verifying...' : 'Verify & Enable'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default SettingsView;
