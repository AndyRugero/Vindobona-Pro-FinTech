import React, { useState, useEffect } from 'react';
import { CreditCard, Snowflake, ShieldCheck, ShieldAlert } from 'lucide-react';
// We import the backend base URL (http://localhost:5001) to talk to the server
import { API_BASE_URL } from '../config';
// We import our CSS styles (which we will create in Step 3)
import '../Styles/CardWidget.css';

interface CardWidgetProps {
    token: string; // The user's secure login token (JWT)
}

const CardWidget: React.FC<CardWidgetProps> = ({ token }) => {
    // 💾 React States: Keep track of card status in the browser memory
    const [isFrozen, setIsFrozen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 📐 3D Rotation States: Store the X and Y degrees of the card tilt
    const [rotateX, setRotateX] = useState<number>(0);
    const [rotateY, setRotateY] = useState<number>(0);

    // 📡 1. Query the backend for the current status when the page first loads
    useEffect(() => {
        const fetchCardStatus = async () => {
            try {
                // Call the read-only check status endpoint we created in Step 1
                const res = await fetch(`${API_BASE_URL}/api/users/card-status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (res.ok) {
                    setIsFrozen(data.isCardFrozen); // Set our screen state to match database
                } else {
                    setError(data.error || 'Failed to read card status');
                }
            } catch (err) {
                console.error(err);
                setError('Server communication failure');
            } finally {
                setLoading(false); // Finished loading
            }
        };

        fetchCardStatus();
    }, [token]);

    // ❄️ 2. Toggle the freeze status in the database when the user clicks the switch
    const handleToggleFreeze = async () => {
        setLoading(true);
        setError(null);
        try {
            // Call our toggle endpoint (POST /api/users/freeze)
            const res = await fetch(`${API_BASE_URL}/api/users/freeze`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                setIsFrozen(data.isCardFrozen); // Update UI state to frozen/active
            } else {
                setError(data.error || 'Failed to toggle card state');
            }
        } catch (err) {
            console.error(err);
            setError('Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    // 🖱️ 3. Track mouse moves over the card to calculate the tilt angle
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect(); // Get physical size/position of the card

        // Find cursor coordinates relative to the card's top-left corner
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find the absolute center of the card
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate tilt degrees (Max tilt is 15 degrees in any direction)
        const tiltX = ((centerY - y) / centerY) * 15;
        const tiltY = ((x - centerX) / centerX) * 15;

        setRotateX(tiltX);
        setRotateY(tiltY);
    };

    // 🧼 4. Reset the card back to flat when the mouse leaves the card
    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    // Decode token or local storage username dynamically
    const getCardHolderName = (): string => {
        if (!token) return 'Card Holder';
        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            return decoded.username || localStorage.getItem('username') || 'Card Holder';
        } catch (e) {
            return localStorage.getItem('username') || 'Card Holder';
        }
    };

    return (
        <div className="card-settings-container">
            <h2 className="card-settings-title">Card Settings</h2>
            <p className="card-settings-subtitle">
                Securely manage your debit cards. Freeze your card instantly if lost to prevent unauthorized payments.
            </p>


            {/* Error banner: Shows up if the server fails */}
            {error && (
                <div style={{ background: '#f8717122', border: '1px solid #f87171', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* 3D Card Area */}
            <div className="card-perspective-container">
                <div
                    className={`debit-card-3d ${isFrozen ? 'frozen' : ''}`}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        // Apply rotation dynamically based on mouse tracking states
                        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
                    }}
                >
                    {/* Frozen Ice Overlay: only visible if card is frozen */}
                    <div className="ice-freeze-overlay">
                        <div className="frozen-badge">
                            <Snowflake size={20} className="ice-spin" />
                            <span>CARD FROZEN</span>
                        </div>
                    </div>

                    {/* Standard Debit Card Layout details */}
                    <div className="card-header-row">
                        <span className="brand-title">VINDOBONA</span>
                        <CreditCard size={28} color="#eab308" />
                    </div>

                    <div className="card-chip"></div>

                    <div className="card-number">
                        •••• •••• •••• 4529
                    </div>

                    <div className="card-footer">
                        <div className="card-holder">
                            <h5>Card Holder</h5>
                            <p>{getCardHolderName()}</p>
                        </div>
                        <div className="card-expiry">
                            <h5>Expires</h5>
                            <p>09 / 28</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Toggle Switch */}
            <div className="card-controls-panel">
                <label className="switch-label">
                    <span>{isFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
                    <input
                        type="checkbox"
                        className="toggle-switch-input"
                        checked={isFrozen}
                        onChange={handleToggleFreeze}
                        disabled={loading}
                    />
                    <div className="toggle-slider"></div>
                </label>

                {/* Security status text below the card */}
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: isFrozen ? '#ef4444' : '#10b981' }}>
                    {isFrozen ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {isFrozen
                            ? 'All standard transactions and transfers are currently BLOCKED'
                            : 'Card is active. Outgoing payments enabled.'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CardWidget;
