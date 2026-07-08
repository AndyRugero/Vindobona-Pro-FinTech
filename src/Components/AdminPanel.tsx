import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, UserCheck, Lock, Unlock, Terminal, RefreshCw } from 'lucide-react';
import '../Styles/AdminPanel.css';

// Base API endpoint URL for Azure hosted service
const API_BASE_URL = 'https://vindobona-api-andy-ffapb3end8fwffdm.westeurope-01.azurewebsites.net';

// 📋 Type definition for User record returned from the backend database
interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    balance: number;
    is_card_frozen: number; // 0 = active, 1 = frozen
}

// 📋 Type definition for Audit log security entries
interface AuditLog {
    id: string;
    user_id: string;
    username?: string;
    action: string;
    details: string;
    timestamp: string;
    ip_address: string;
}

// 📋 Type definition for System Transaction records
interface Transaction {
    id: string;
    date: string;
    receiver: string;
    amount: number;
    category: string;
    is_negative: number;
    status: string;
    user_id: string;
    sender_username: string;
}

// 📋 Expected props containing the JWT session authorization token
interface AdminPanelProps {
    token: string;
}

export default function AdminPanel({ token }: AdminPanelProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [newAnnTitle, setNewAnnTitle] = useState('');
    const [newAnnContent, setNewAnnContent] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    // 🔄 Fetch user directory and live security logs from the backend API
    const fetchAdminData = async () => {
        setIsLoading(true);
        setError('');
        try {
            // A. Retrieve registered user directory list
            const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!usersRes.ok) throw new Error('Failed to retrieve user directory.');
            const usersData = await usersRes.json();

            // B. Retrieve security audit log events
            const logsRes = await fetch(`${API_BASE_URL}/api/admin/audit-logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!logsRes.ok) throw new Error('Failed to retrieve audit log records.');
            const logsData = await logsRes.json();

            // C. Retrieve system transactions ledger
            const txsRes = await fetch(`${API_BASE_URL}/api/admin/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!txsRes.ok) throw new Error('Failed to retrieve system transactions.');
            const txsData = await txsRes.json();

            // D. Update state variables with loaded database rows
            setUsers(usersData);
            setLogs(logsData);
            setTransactions(txsData);
        } catch (err: any) {
            setError(err.message || 'Server connection failed.');
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger data load automatically when the component mounts or the token changes
    useEffect(() => {
        fetchAdminData();
    }, [token]);

    // 🔒 Toggle the card freeze/unfreeze state for a user
    const handleToggleFreeze = async (userId: string) => {
        setError('');
        setSuccessMessage('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/freeze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update card status');
            
            setSuccessMessage(data.message || 'Card status updated');
            // Refresh directory grid to display updated card status
            fetchAdminData();
        } catch (err: any) {
            setError(err.message || 'Failed to update card status');
        }
    };

    // 🛡️ Promote a registered user to the 'admin' role
    const handlePromoteUser = async (userId: string) => {
        setError('');
        setSuccessMessage('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role: 'admin' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to promote user');
            
            setSuccessMessage(data.message || 'User promoted successfully');
            // Refresh directory grid to show user's new admin status
            fetchAdminData();
        } catch (err: any) {
            setError(err.message || 'Failed to promote user');
        }
    };

    // 🗑️ Delete user permanently (Admin only)
    const handleDeleteUser = async (userId: string, usernameStr: string) => {
        if (usernameStr === localStorage.getItem('username')) {
            alert("You cannot delete your own admin account.");
            return;
        }
        if (!window.confirm(`Are you sure you want to permanently delete user "${usernameStr}"? All their wallets, transactions, budgets, and logs will be permanently deleted.`)) {
            return;
        }

        setError('');
        setSuccessMessage('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete user');

            setSuccessMessage(data.message || 'User deleted successfully');
            fetchAdminData();
        } catch (err: any) {
            setError(err.message || 'Failed to delete user');
        }
    };

    // 🗑️ Rollback / Delete transaction
    const handleRollbackTransaction = async (txId: string, isTransfer: boolean) => {
        setError('');
        setSuccessMessage('');
        const confirmMessage = isTransfer
            ? 'Are you sure you want to rollback this transfer? This will reverse sender and receiver balances and delete the records.'
            : 'Are you sure you want to delete this transaction?';
            
        if (!window.confirm(confirmMessage)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/transactions/${txId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to rollback transaction');

            setSuccessMessage(data.message || 'Transaction rolled back successfully');
            fetchAdminData();
        } catch (err: any) {
            setError(err.message || 'Failed to rollback transaction');
        }
    };

    // 📢 Publish What's New Announcement
    const handlePublishAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAnnTitle || !newAnnContent) {
            setError('Title and Content are required to publish an update.');
            return;
        }
        setError('');
        setSuccessMessage('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/announcements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ title: newAnnTitle, content: newAnnContent })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to publish announcement');

            setSuccessMessage('Announcement published successfully! All users will receive this in their notification center.');
            setNewAnnTitle('');
            setNewAnnContent('');
            fetchAdminData();
        } catch (err: any) {
            setError(err.message || 'Failed to publish announcement');
        }
    };

    // 🖥️ UI layout structure
    return (
        <div className="admin-container">
            {/* Header Block containing panel title and manual refresh trigger */}
            <header className="admin-header">
                <div className="header-title">
                    <Shield className="neon-shield" size={28} />
                    <h1>Vindobona Admin Dashboard</h1>
                </div>
                <button 
                    onClick={fetchAdminData} 
                    className="refresh-btn" 
                    disabled={isLoading}
                    aria-label="Refresh directory details"
                >
                    <RefreshCw size={16} />
                    {isLoading ? 'Refreshing...' : 'Refresh Directory'}
                </button>
            </header>

            {/* Error and Success status banners */}
            {error && (
                <div className="feedback-banner error-banner">
                    <ShieldAlert size={16} />
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="feedback-banner success-banner">
                    {successMessage}
                </div>
            )}

            {/* Grid display dividing user records from security audit terminal */}
            <div className="admin-grid">
                
                {/* Panel 1: User Directory List & Actions */}
                <div className="admin-panel">
                    <h2>User Directory</h2>
                    {isLoading && users.length === 0 ? (
                        <div className="empty-logs">
                            Retrieving user list...
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Card Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="username-cell">{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge ${user.role.toLowerCase()}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`card-badge ${user.is_card_frozen === 1 ? 'frozen' : 'active'}`}>
                                                    {user.is_card_frozen === 1 ? 'Frozen' : 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {/* Freeze/Unfreeze Button toggler */}
                                                    {user.is_card_frozen === 1 ? (
                                                        <button
                                                            onClick={() => handleToggleFreeze(user.id)}
                                                            className="action-btn unfreeze-btn"
                                                            title="Unlock user card status"
                                                        >
                                                            <Unlock size={14} />
                                                            Unfreeze Card
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleToggleFreeze(user.id)}
                                                            className="action-btn freeze-btn"
                                                            title="Lock user card status"
                                                        >
                                                            <Lock size={14} />
                                                            Freeze Card
                                                        </button>
                                                    )}

                                                    {/* Promotion button: only shows if the target is not already an admin */}
                                                    {user.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handlePromoteUser(user.id)}
                                                            className="action-btn promote-btn"
                                                            title="Promote user to administrator role"
                                                        >
                                                            <UserCheck size={14} />
                                                            Promote
                                                        </button>
                                                    )}

                                                    {/* Permanent Delete Button */}
                                                    {user.username !== localStorage.getItem('username') && (
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                                            className="action-btn delete-btn"
                                                            style={{ background: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                            title="Permanently delete user and all their data"
                                                        >
                                                            Delete User
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Panel 2: Live Security/Audit Logs */}
                <div className="admin-panel">
                    <div className="panel-subheader">
                        <Terminal className="terminal-icon" size={20} />
                        <h2>Live Security Audit Logs</h2>
                    </div>
                    <div className="audit-feed">
                        {logs.length === 0 ? (
                            <div className="empty-logs">No security events found in logs database.</div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="audit-entry">
                                    <span className="log-timestamp">
                                        [{new Date(log.timestamp).toLocaleString()}]
                                    </span>{' '}
                                    <span className="log-ip">[IP: {log.ip_address}]</span>{' '}
                                    <span className="log-action">{log.action}</span>
                                    <p className="log-details">{log.details}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* Announcement / What's New Publisher */}
            <div className="admin-panel full-width-panel" style={{ marginTop: '20px', padding: '20px' }}>
                <h2>Broadcast "What's New" Announcement</h2>
                <form onSubmit={handlePublishAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Announcement Title</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Card Freeze Protection Added!" 
                            value={newAnnTitle}
                            onChange={e => setNewAnnTitle(e.target.value)}
                            style={{ background: '#0c1222', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', color: 'white', fontSize: '13px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Message Content</label>
                        <textarea 
                            placeholder="Describe your update details here..." 
                            rows={3}
                            value={newAnnContent}
                            onChange={e => setNewAnnContent(e.target.value)}
                            style={{ background: '#0c1222', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', color: 'white', fontSize: '13px', resize: 'vertical' }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="action-btn promote-btn"
                        style={{ alignSelf: 'flex-start', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Publish Update
                    </button>
                </form>
            </div>

            {/* System Transactions Ledger & Rollback Section */}
            <div className="admin-panel full-width-panel" style={{ marginTop: '20px' }}>
                <h2>System Transactions Ledger (Admin Controls)</h2>
                {isLoading && transactions.length === 0 ? (
                    <div className="empty-logs">Retrieving system transactions...</div>
                ) : transactions.length === 0 ? (
                    <div className="empty-logs">No transactions found in system database.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Sender</th>
                                    <th>Receiver</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>{tx.date}</td>
                                        <td className="username-cell">{tx.sender_username || 'Unknown'}</td>
                                        <td>{tx.receiver}</td>
                                        <td>{tx.category}</td>
                                        <td className={`amount ${tx.is_negative === 1 ? 'negative' : 'positive'}`} style={{ color: tx.is_negative === 1 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                                            {tx.is_negative === 1 ? '-' : ''}€{Math.abs(tx.amount).toFixed(2)}
                                        </td>
                                        <td>{tx.is_negative === 1 ? 'Expense' : 'Income'}</td>
                                        <td>
                                            <span className="card-badge active" style={{ background: '#1e293b' }}>
                                                {tx.status || 'Complete'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleRollbackTransaction(tx.id, tx.category === 'Transfer')}
                                                className="action-btn delete-btn"
                                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                                title={tx.category === 'Transfer' ? 'Rollback transfer and restore user balances' : 'Delete transaction record'}
                                            >
                                                {tx.category === 'Transfer' ? 'Rollback Transfer' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
