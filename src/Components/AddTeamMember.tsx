import React, { useState } from 'react';
import { UserPlus, ShieldAlert, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import '../Styles/AddTeamMember.css';

interface AddTeamMemberProps {
    token: string;
}

export default function AddTeamMember({ token }: AddTeamMemberProps) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            // A. Create the account via registration
            const registerRes = await fetch(`${API_BASE_URL}/api/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const registerData = await registerRes.json();
            if (!registerRes.ok) throw new Error(registerData.error || 'Failed to register team member.');

            // B. If Administrator role was selected, promote the user
            if (role === 'admin') {
                const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!usersRes.ok) throw new Error('Account created, but failed to fetch ID for role elevation.');
                const usersData = await usersRes.json();

                const newUser = usersData.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
                if (!newUser) throw new Error('Account created, but user was not found for role elevation.');

                const roleRes = await fetch(`${API_BASE_URL}/api/admin/users/${newUser.id}/role`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ role: 'admin' })
                });

                const roleData = await roleRes.json();
                if (!roleRes.ok) throw new Error(roleData.error || 'Account created, but role elevation failed.');
            }

            setSuccessMessage(`Team member "${username}" registered successfully as ${role.toUpperCase()}! 🎉`);
            setUsername('');
            setEmail('');
            setPassword('');
            setRole('user');
        } catch (err: any) {
            setError(err.message || 'Operation failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="header-title">
                    <UserPlus className="neon-shield" size={28} />
                    <h1>Add Organization Team Member</h1>
                </div>
            </header>

            {error && (
                <div className="feedback-banner error-banner">
                    <ShieldAlert size={16} />
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="feedback-banner success-banner">
                    <CheckCircle size={16} />
                    {successMessage}
                </div>
            )}

            <div className="admin-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2>Create New Member Credentials</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="member-form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            className="member-input"
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="member-form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            className="member-input"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="member@vindobonafintech.com"
                            required
                        />
                    </div>

                    <div className="member-form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            className="member-input"
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                        />
                    </div>

                    <div className="member-form-group">
                        <label>Role Level</label>
                        <select
                            value={role}
                            className="member-input"
                            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                        >
                            <option value="user">User (Standard Access)</option>
                            <option value="admin">Admin (Full Console Access)</option>
                        </select>
                    </div>

                    <button type="submit" disabled={isLoading} className="member-submit-btn">
                        {isLoading ? 'Creating Account...' : 'Create Team Member'}
                    </button>
                </form>
            </div>
        </div>
    );
}
