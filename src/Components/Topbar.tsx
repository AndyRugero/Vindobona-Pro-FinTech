import React from 'react';

const Topbar: React.FC = () => {
    return (
        <header className="topbar">
            <div className="breadcrumb">
                <span className="breadcrumb__root">Home</span>
                <span className="breadcrumb__separator">/</span>
                <span className="breadcrumb__current">Overview</span>
            </div>

            <div className="topbar__actions">
                {/* Notification / Mail Icon */}
                <div className="topbar-icon notification">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#94a3b8"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" /></svg>
                    <span className="notification-badge">3</span>
                </div>

                {/* Theme Toggle */}
                <div className="theme-toggle">🌗</div>
            </div>
        </header>
    );
};

export default Topbar;