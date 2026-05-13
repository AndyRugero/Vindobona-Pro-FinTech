import React from 'react';
import {
    UserRoundPen,
    LayoutDashboard,
    BookOpen,
    ArrowRightLeft,
    CreditCard,
    Settings,
    HelpCircle,
    UserPlus,
    RefreshCw
} from 'lucide-react';

const Sidebar: React.FC<{ 
    currentView: string; 
    onViewChange: (view: string) => void;
}> = ({ currentView, onViewChange }) => {
    return (
        <aside className="sidebar">
            {/* The Logo Area */}
            <div className="sidebar-logo">
                VINDOBONA
            </div>

            {/* User Profile Card from Mockup */}
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

            {/* The Navigation Links */}
            <nav className="sidebar-nav">
                <div 
                    className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                    onClick={() => onViewChange('dashboard')}
                >
                    <LayoutDashboard size={18} className="nav-icon" /> Dashboard
                </div>
                <div 
                    className={`nav-item ${currentView === 'ledger' ? 'active' : ''}`}
                    onClick={() => onViewChange('ledger')}
                >
                    <BookOpen size={18} className="nav-icon" /> Ledger
                </div>
                <div 
                    className={`nav-item ${currentView === 'import' ? 'active' : ''}`}
                    onClick={() => onViewChange('import')}
                >
                    <RefreshCw size={18} className="nav-icon" /> Import CSV
                </div>
                <div className="nav-item"><ArrowRightLeft size={18} className="nav-icon" /> Transfers</div>
                <div className="nav-item"><CreditCard size={18} className="nav-icon" /> Payment Methods</div>
                <div className="nav-item"><Settings size={18} className="nav-icon" /> Settings</div>
                <div className="nav-item"><HelpCircle size={18} className="nav-icon" /> Help Center</div>
            </nav>

            <div className="sidebar-section">
                <h5 className="section-title">Manage Organization</h5>
                <div className="nav-item"><UserPlus size={18} className="nav-icon" /> Add Team Member</div>
                <div className="nav-item"><RefreshCw size={18} className="nav-icon" /> Switch Entity</div>
            </div>
        </aside>
    );
};

export default Sidebar;