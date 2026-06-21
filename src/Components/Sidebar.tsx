import React from 'react';
// 🎨 Import the styles specifically defined for the Sidebar navigation panel
import '../Styles/Sidebar.css';
// 📥 Import sleek vector outline icons from Lucide-React to visually represent each view
import {
    UserRoundPen,
    LayoutDashboard,
    ArrowRightLeft,
    CreditCard,
    Settings,
    HelpCircle,
    UserPlus,
    Coins,
    PiggyBank,
    Shield,
    Phone,
    Mail
} from 'lucide-react';

// 📐 Define the TypeScript types for the props our Sidebar expects:
// - currentView: The active view name string (e.g. 'dashboard', 'settings', 'cards')
// - onViewChange: A callback function to update the view state in App.tsx
// - token: The JWT authorization token to identify user roles
const Sidebar: React.FC<{
    currentView: string;
    onViewChange: (view: string) => void;
    token: string | null;
    avatarUrl?: string | null;
    username?: string | null;
}> = ({ currentView, onViewChange, token, avatarUrl, username }) => {
    // 🆘 Controls the Help Center contact card popup
    const [showHelp, setShowHelp] = React.useState(false);

    // Decode user role from JWT token payload to conditionally show administrator options
    const getUserRole = (): string => {
        if (!token) return 'user';
        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            return decoded.role || 'user';
        } catch (e) {
            return 'user';
        }
    };
    const role = getUserRole();

    return (
        <aside className="sidebar">
            {/* 🏷️ 1. The Logo / Brand Header */}
            <div className="sidebar-logo">
                VINDOBONA
            </div>

            {/* 👤 2. User Profile Card: Displays status and account levels */}
            <div className="sidebar-profile-card" onClick={() => onViewChange('settings')} title="Go to Profile Settings">
                <div className="profile-avatar">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="profile-avatar-img" />
                    ) : (
                        <UserRoundPen size={32} color="#eab308" strokeWidth={1.5} />
                    )}
                </div>
                <span className="account-tag">Profile</span>
                <div className="profile-info">
                    <h4>{username || 'Andy R.'}</h4>
                    <p>{role === 'admin' ? 'Administrator' : 'Premium Account'}</p>
                    <span className="status-dot">Active</span>
                </div>
            </div>

            {/* 🗺️ 3. Navigation Links Grid */}
            <nav className="sidebar-nav">
                {/* 📊 Dashboard link: Toggles the main financial metrics charts and details */}
                <div
                    className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                    onClick={() => onViewChange('dashboard')}
                >
                    <LayoutDashboard size={18} className="nav-icon" /> Dashboard
                </div>



                {/* 💳 Payment Methods (Freeze Card): Swaps to our new interactive 3D Card Widget */}
                <div
                    className={`nav-item ${currentView === 'cards' ? 'active' : ''}`}
                    onClick={() => onViewChange('cards')}
                >
                    <CreditCard size={18} className="nav-icon" /> Payment Methods
                </div>

                {/* 🔄 Member Transfers: Send funds to other Vindobona members (all users) */}
                <div
                    className={`nav-item ${currentView === 'transfer' ? 'active' : ''}`}
                    onClick={() => onViewChange('transfer')}
                >
                    <ArrowRightLeft size={18} className="nav-icon" /> Member Transfers
                </div>

                {/* 📊 Budgets: Monthly spending caps and tracker */}
                <div className={`nav-item ${currentView === 'budgets' ? 'active' : ''}`}
                    onClick={() => onViewChange('budgets')}>
                    <PiggyBank size={18} className="nav-icon" /> Budgets
                </div>




                {/* 💱 FX Converter: Swaps to our currency conversion and wallets dashboard */}
                <div
                    className={`nav-item ${currentView === 'exchange' ? 'active' : ''}`}
                    onClick={() => onViewChange('exchange')}
                >
                    <Coins size={18} className="nav-icon" /> FX Converter
                </div>

                {/* ⚙️ Settings link: Custom verification, 2FA setup, and configurations */}
                <div
                    className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
                    onClick={() => onViewChange('settings')}
                >
                    <Settings size={18} className="nav-icon" /> Settings
                </div>

                {/* 🛡️ Admin Link: Visible only if the user has an 'admin' role in their JWT token */}
                {role === 'admin' && (
                    <div
                        className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
                        onClick={() => onViewChange('admin')}
                    >
                        <Shield size={18} className="nav-icon" /> Admin Panel
                    </div>
                )}

                {/* ❓ Help Center — click to show contact details */}
                <div
                    className={`nav-item ${showHelp ? 'active' : ''}`}
                    onClick={() => setShowHelp(!showHelp)}
                >
                    <HelpCircle size={18} className="nav-icon" /> Help Center
                </div>

                {/* 📞 Contact card — slides open when Help Center is clicked */}
                {showHelp && (
                    <div className="help-contact-card">
                        <p className="help-contact-title">Support Channel</p>
                        <a href="tel:+436769781869" className="help-contact-item">
                            <Phone size={13} className="help-contact-icon" />
                            +43 676 9781 869
                        </a>
                        <span className="help-contact-sub">Mon–Fri 08:00–20:00 CET</span>
                        <a href="mailto:andrun1@yahoo.com" className="help-contact-item">
                            <Mail size={13} className="help-contact-icon" />
                            andrun1@yahoo.com
                        </a>
                        <span className="help-contact-sub">Reply within 24 hours</span>
                    </div>
                )}
            </nav>

            {/* 🏢 4. Corporate Organization controls (Visible to admins only) */}
            {role === 'admin' && (
                <div className="sidebar-section">
                    <h5 className="section-title">Manage Organization</h5>
                    <div
                        className={`nav-item ${currentView === 'add-team' ? 'active' : ''}`}
                        onClick={() => onViewChange('add-team')}
                    >
                        <UserPlus size={18} className="nav-icon" /> Add Team Member
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;