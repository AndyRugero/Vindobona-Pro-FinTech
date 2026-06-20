import React from 'react';
// 🎨 Import the styles specifically defined for the Sidebar navigation panel
import '../Styles/Sidebar.css';
// 📥 Import sleek vector outline icons from Lucide-React to visually represent each view
import {
    UserRoundPen,
    LayoutDashboard,
    BookOpen,
    ArrowRightLeft,
    CreditCard,
    Settings,
    HelpCircle,
    UserPlus,
    RefreshCw,
    Coins,
    PiggyBank,
    Shield
} from 'lucide-react';

// 📐 Define the TypeScript types for the props our Sidebar expects:
// - currentView: The active view name string (e.g. 'dashboard', 'settings', 'cards')
// - onViewChange: A callback function to update the view state in App.tsx
// - token: The JWT authorization token to identify user roles
const Sidebar: React.FC<{
    currentView: string;
    onViewChange: (view: string) => void;
    token: string | null;
}> = ({ currentView, onViewChange, token }) => {
    // Decode user role from JWT token payload to conditionally show administrator options
    //user role
    const getUserRole = (): string => {
        if (!token) return 'user';

        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            return decoded.role || 'user';
        }
        catch (e) {
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
            <div className="sidebar-profile-card">
                <div className="profile-avatar">
                    <UserRoundPen size={32} color="#eab308" strokeWidth={1.5} />
                </div>
                <span className="account-tag">Profile</span>
                <div className="profile-info">
                    <h4>Andy R.</h4>
                    <p>Premium Account</p>
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

                {/* 📖 Ledger link: Shows transactions log */}
                <div
                    className={`nav-item ${currentView === 'ledger' ? 'active' : ''}`}
                    onClick={() => onViewChange('ledger')}
                >
                    <BookOpen size={18} className="nav-icon" /> Ledger
                </div>

                {/* 🔄 Import CSV link: Swaps to the spreadsheet parser interface */}
                <div
                    className={`nav-item ${currentView === 'import' ? 'active' : ''}`}
                    onClick={() => onViewChange('import')}
                >
                    <RefreshCw size={18} className="nav-icon" /> Import CSV
                </div>

                {/* 🔄 Transfers link: Swaps to Member Transfers dashboard */}
                <div
                    className={`nav-item ${currentView === 'transfer' ? 'active' : ''}`}
                    onClick={() => onViewChange('transfer')}
                >
                    <ArrowRightLeft size={18} className="nav-icon" /> Member Transfer
                </div>


                {/* 🔄 Transfers link (Static Placeholder) */}
                <div className="nav-item">
                    <ArrowRightLeft size={18} className="nav-icon" /> Transfers
                </div>

                {/* 💳 Payment Methods (Freeze Card): Swaps to our new interactive 3D Card Widget */}
                <div
                    className={`nav-item ${currentView === 'cards' ? 'active' : ''}`}
                    onClick={() => onViewChange('cards')}
                >
                    <CreditCard size={18} className="nav-icon" /> Payment Methods
                </div>




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

                {/* ❓ Help Center (Static Placeholder) */}
                <div className="nav-item">
                    <HelpCircle size={18} className="nav-icon" /> Help Center
                </div>
            </nav>

            {/* 🏢 4. Corporate Organization controls */}
            <div className="sidebar-section">
                <h5 className="section-title">Manage Organization</h5>
                <div className="nav-item">
                    <UserPlus size={18} className="nav-icon" /> Add Team Member
                </div>
                <div className="nav-item">
                    <RefreshCw size={18} className="nav-icon" /> Switch Entity
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;