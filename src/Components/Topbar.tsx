import React from 'react';
import '../Styles/Topbar.css';
import { Sun, Moon, LogOut } from 'lucide-react'; // 📥 Import standard icons

// 🔌 We define that Topbar can receive theme status and toggle function
interface TopbarProps {
    onLogout?: () => void;
    theme?: 'dark' | 'light';
    onToggleTheme?: () => void;
    username?: string | null;
}

const Topbar: React.FC<TopbarProps> = ({ onLogout, theme = 'dark', onToggleTheme, username }) => {
    // 🏷️ Get the username of the logged-in user
    const displayName = username || localStorage.getItem('username') || 'User';

    return (
        <header className="topbar">
            {/* Left side: Breadcrumb path */}
            <div className="breadcrumb">
                <span className="breadcrumb__root">Home</span>
                <span className="breadcrumb__separator">/</span>
                <span className="breadcrumb__current">Overview</span>
            </div>

            {/* Right side: Actions */}
            <div className="topbar__actions">
                {/* Greeting text */}
                <span className="user-welcome">Hello, {displayName}!</span>

                {/* Notification / Mail Icon */}
                <div className="topbar-icon notification">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#94a3b8">
                        <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" />
                    </svg>
                    <span className="notification-badge">3</span>
                </div>

                {/* Theme Toggle */}
                <div className="theme-toggle" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </div>

                {/* Logout Button: Only shows up if we passed the onLogout prop */}
                {onLogout && (
                    <button onClick={onLogout} className="logout-btn" title="Log Out">
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Topbar;