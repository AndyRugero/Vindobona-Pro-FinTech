import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      {/* Updated logo name */}
      <div className="sidebar-logo">VINDOBONA PRO</div>

      <nav className="sidebar-nav">
        <div className="nav-item">📊 Dashboard</div>
        <div className="nav-item">📈 Analytics</div>
        <div className="nav-item">⚙️ Settings</div>
      </nav>
    </aside>
  );
};

export default Sidebar;