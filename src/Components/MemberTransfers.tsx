import React, { useState, useEffect } from 'react';
import { User, ArrowRight, Search, AlertCircle, CheckCircle2, X, Send } from 'lucide-react';
import { API_BASE_URL } from '../config';
import '../Styles/MemberTransfers.css';

interface Member {
    id: string;
    username: string;
    email: string;
}

const MemberTransfers: React.FC<{ token: string | null }> = ({ token }) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [amount, setAmount] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            // Fetch registered members list (excluding current user)
            const membersResponse = await fetch(`${API_BASE_URL}/api/users/members`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const membersData = await membersResponse.json();

            // Fetch sender's 2FA status to conditionally render the 2FA input box
            const status2FAResponse = await fetch(`${API_BASE_URL}/api/auth/2fa/status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const status2FAData = await status2FAResponse.json();

            if (membersResponse.ok && status2FAResponse.ok) {
                setMembers(membersData);
                setIs2FAEnabled(status2FAData.enabled);
            } else {
                setError(membersData.error || status2FAData.error || 'Failed to retrieve directory data');
            }
        } catch (err) {
            console.error('Fetch members error', err);
            setError('Connection error: Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    // Client-Side Search Filtering
    const filteredMembers = members.filter((member) =>
        (member.username && member.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Transfer Execution Handler
    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();

        // Safety checks before sending network requests
        if (!selectedMember || !amount) {
            setError('Please select a recipient and enter a transfer amount.');
            return;
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid positive transfer amount.');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            // Send secure money transfer instruction to the API
            const response = await fetch(`${API_BASE_URL}/api/transactions/transfer`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipientUsername: selectedMember.username,
                    amount: parsedAmount,
                    twoFactorCode: is2FAEnabled ? twoFactorCode : undefined
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(`Successfully transferred €${parsedAmount.toFixed(2)} to ${selectedMember.username}!`);
                setAmount('');
                setTwoFactorCode('');
                setSelectedMember(null); // Close the slide-out modal
                fetchData(); // Refresh directory balance/status
            } else {
                setError(data.error || 'Transfer failed. Check details and try again.');
            }
        } catch (err) {
            console.error('Transfer submission error', err);
            setError('Connection error: Failed to reach transfer server.');
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <div className="member-transfers-container">
            {/* Header Title Section */}
            <div className="transfers-header">
                <h2>Send Money to Registered Members</h2>
                <p>Instantly transfer funds to other users in the Vindobona Pro network.</p>
            </div>

            {/* Success Notification Alert */}
            {success && (
                <div className="alert alert-success">
                    <CheckCircle2 className="alert-icon" />
                    <span>{success}</span>
                </div>
            )}

            {/* Error Notification Alert */}
            {error && (
                <div className="alert alert-danger">
                    <AlertCircle className="alert-icon" />
                    <span>{error}</span>
                </div>
            )}

            {/* Search Input Bar */}
            <div className="search-bar-container">
                <Search className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Dynamic Directory List Grid */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading member directory...</p>
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="empty-state">
                    <p>No members found matching your search.</p>
                </div>
            ) : (
                <div className="members-grid">
                    {filteredMembers.map((member) => (
                        <div
                            key={member.id}
                            className="member-card"
                            onClick={() => setSelectedMember(member)}
                        >
                            <div className="member-avatar">
                                <User className="avatar-icon" />
                            </div>
                            <div className="member-info">
                                <h3>{member.username}</h3>
                                <p>{member.email}</p>
                            </div>
                            <div className="member-action-hint">
                                <span>Transfer</span>
                                <ArrowRight className="arrow-icon" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pop-Up Transfer Modal */}
            {selectedMember && (
                <div className="modal-overlay">
                    <div className="transfer-modal">
                        <div className="modal-header">
                            <h3>Transfer to {selectedMember.username}</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setSelectedMember(null);
                                    setAmount('');
                                    setTwoFactorCode('');
                                    setError(null);
                                }}
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleTransfer} className="transfer-form">
                            <div className="form-group">
                                <label htmlFor="amount">Amount (€)</label>
                                <input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    className="form-input"
                                />
                            </div>

                            {/* PSD2 2FA Signature Input (Only renders if user enabled 2FA) */}
                            {is2FAEnabled && (
                                <div className="form-group 2fa-group">
                                    <label htmlFor="twoFactorCode">
                                        2FA Verification Code (Google Authenticator)
                                    </label>
                                    <input
                                        id="twoFactorCode"
                                        type="text"
                                        maxLength={6}
                                        placeholder="123456"
                                        value={twoFactorCode}
                                        onChange={(e) => setTwoFactorCode(e.target.value)}
                                        required
                                        className="form-input 2fa-input"
                                    />
                                    <small className="help-text">
                                        Enter the 6-digit verification code from your Google Authenticator app.
                                    </small>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setSelectedMember(null);
                                        setAmount('');
                                        setTwoFactorCode('');
                                        setError(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn btn-primary"
                                >
                                    {submitting ? 'Processing...' : 'Confirm & Send'}
                                    <Send className="btn-icon" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberTransfers;
