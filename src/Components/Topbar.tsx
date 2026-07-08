import React, { useState, useEffect } from 'react';
import '../Styles/Topbar.css';
import { Sun, Moon, LogOut, X, Mail } from 'lucide-react'; // 📥 Import standard icons

// Base API URL
const API_BASE_URL = 'https://vindobona-api-andy-ffapb3end8fwffdm.westeurope-01.azurewebsites.net';

// 🔌 We define that Topbar can receive theme status and toggle function
interface TopbarProps {
    onLogout?: () => void;
    theme?: 'dark' | 'light';
    onToggleTheme?: () => void;
    username?: string | null;
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    created_at: number;
}

const Topbar: React.FC<TopbarProps> = ({ onLogout, theme = 'dark', onToggleTheme, username }) => {
    // 🏷️ Get the username of the logged-in user
    const displayName = username || localStorage.getItem('username') || 'User';

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [readIds, setReadIds] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    // Fetch announcements and load read state
    const fetchAnnouncements = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/announcements`);
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data);
            }
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
        }
    };

    useEffect(() => {
        fetchAnnouncements();

        // Load read IDs from localStorage
        const stored = localStorage.getItem('read_announcements');
        if (stored) {
            try {
                setReadIds(JSON.parse(stored));
            } catch (e) {
                setReadIds([]);
            }
        }

        // Set up polling for new announcements
        const interval = setInterval(fetchAnnouncements, 10000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = announcements.filter(a => !readIds.includes(a.id)).length;

    const handleOpenAnnouncement = (ann: Announcement) => {
        setSelectedAnnouncement(ann);
        setIsDropdownOpen(false);

        // Mark as read if not already read
        if (!readIds.includes(ann.id)) {
            const updated = [...readIds, ann.id];
            setReadIds(updated);
            localStorage.setItem('read_announcements', JSON.stringify(updated));
        }
    };

    const handleMarkAllRead = () => {
        const allIds = announcements.map(a => a.id);
        setReadIds(allIds);
        localStorage.setItem('read_announcements', JSON.stringify(allIds));
    };

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

                {/* Notification / Mail Icon with Dropdown */}
                <div className="notification-container">
                    <div 
                        className="topbar-icon notification" 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        title="View Announcements & Updates"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#94a3b8">
                            <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </div>

                    {isDropdownOpen && (
                        <div className="notification-dropdown">
                            <div className="notification-dropdown-header">
                                <h3>Updates & News</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead}>Mark all read</button>
                                )}
                            </div>
                            {announcements.length === 0 ? (
                                <div className="empty-logs" style={{ padding: '16px', textAlign: 'center', fontSize: '12px' }}>
                                    No updates found.
                                </div>
                            ) : (
                                announcements.map(ann => {
                                    const isUnread = !readIds.includes(ann.id);
                                    return (
                                        <div 
                                            key={ann.id} 
                                            className={`notification-item ${isUnread ? 'unread' : ''}`}
                                            onClick={() => handleOpenAnnouncement(ann)}
                                        >
                                            <div className="notification-item-title">
                                                <span>{ann.title}</span>
                                                {isUnread && <span className="notification-item-dot"></span>}
                                            </div>
                                            <span className="notification-item-date">
                                                {new Date(ann.created_at).toLocaleDateString()}
                                            </span>
                                            <p className="notification-item-snippet">{ann.content}</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
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

            {/* Detailed Email / Announcement Viewer Modal */}
            {selectedAnnouncement && (
                <div className="modal-overlay" onClick={() => setSelectedAnnouncement(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setSelectedAnnouncement(null)}>
                            <X size={18} />
                        </button>
                        <div className="modal-header-block">
                            <h2>{selectedAnnouncement.title}</h2>
                            <span className="modal-header-date">
                                {new Date(selectedAnnouncement.created_at).toLocaleString()}
                            </span>
                        </div>
                        <p className="modal-body-text">{selectedAnnouncement.content}</p>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Topbar;