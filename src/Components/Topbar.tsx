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
                <div className="search-box">🔍 Search transactions...</div>
                <div className="user-profile">AR</div>
            </div>
        </header>
    );
};

export default Topbar;