import React from 'react';

const Sidebar: React.FC = () => {
    return (
        <aside className="sidebar">
            {/* The Logo Area */}
            <div className="sidebar-logo">
                VINDOBONA
            </div>

            {/* User Profile Card from Mockup */}
            <div className="sidebar-profile-card">
                <div className="profile-avatar">👨‍💼</div>
                <div className="profile-info">
                    <h4>Andy V.</h4>
                    <p>Premium Account</p>
                    <span className="status-dot">🟢 Active</span>
                </div>
            </div>

            {/* The Navigation Links */}
            <nav className="sidebar-nav">
                <div className="nav-item active"><span className="nav-icon">🏠</span> Dashboard</div>
                <div className="nav-item"><span className="nav-icon">📖</span> Ledger</div>
                <div className="nav-item"><span className="nav-icon">💸</span> Transfers</div>
                <div className="nav-item"><span className="nav-icon">💳</span> Payment Methods</div>
                <div className="nav-item"><span className="nav-icon">⚙️</span> Settings</div>
                <div className="nav-item"><span className="nav-icon">❓</span> Help Center</div>
            </nav>

            <div className="sidebar-section">
                <h5 className="section-title">Manage Organization</h5>
                <div className="nav-item"><span className="nav-icon">➕</span> Add Team Member</div>
                <div className="nav-item"><span className="nav-icon">🔄</span> Switch Entity</div>
            </div>
        </aside>
    );
};

export default Sidebar;