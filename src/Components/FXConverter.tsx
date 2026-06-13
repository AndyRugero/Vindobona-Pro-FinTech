import React, { useState, useEffect } from 'react';
import { RefreshCw, Coins, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
// 📈 Import Recharts components for historical rates graph
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { API_BASE_URL } from '../config';
// 🎨 Import CSS style sheet
import '../Styles/FXConverter.css';

interface FXConverterProps {
    token: string; // Secure JWT login token
}

interface Wallet {
    currency: string;
    balance: number;
}

// shape of data points for Recharts graph
interface ChartDataPoint {
    date: string;
    rate: number;
}

const FXConverter: React.FC<FXConverterProps> = ({ token }) => {
    // 💾 React States
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [fromCurrency, setFromCurrency] = useState<string>('EUR');
    const [toCurrency, setToCurrency] = useState<string>('USD');
    const [amount, setAmount] = useState<string>('');
    const [rate, setRate] = useState<number>(1.09); // Live rate from Frankfurter API
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]); // Historical rate array
    const [loading, setLoading] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 📡 fetchBalances: Reads dynamic wallet balances from SQLite backend
    const fetchBalances = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/transactions/wallets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setWallets(data.wallets || []);
            }
        } catch (err) {
            console.error('Error loading balances:', err);
        }
    };

    // Load balances on boot
    useEffect(() => {
        fetchBalances();
    }, [token]);

    // 📈 2. Fetch live and historical rates whenever the currency pair changes
    useEffect(() => {
        // If currencies are the same, rate is always 1.00 and there is no history to graph
        if (fromCurrency === toCurrency) {
            setRate(1.00);
            setChartData([]);
            return;
        }

        const fetchRatesAndHistory = async () => {
            try {
                // A. Fetch current live market rate dynamically (Worldwide support!)
                const liveRes = await fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`);
                const liveData = await liveRes.json();
                
                if (liveRes.ok && liveData.rates && liveData.rates[toCurrency]) {
                    setRate(liveData.rates[toCurrency]);
                }
                
                // B. Fetch 7-day range history to draw trendline dynamically
                const today = new Date().toISOString().split('T')[0];
                const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const histRes = await fetch(`https://api.frankfurter.app/${oneWeekAgo}..${today}?from=${fromCurrency}&to=${toCurrency}`);
                const histData = await histRes.json();

                if (histRes.ok && histData.rates) {
                    // Map API object to sorted array of points for Recharts
                    const mappedData: ChartDataPoint[] = Object.entries(histData.rates).map(([dateString, rateObj]) => {
                        const rateValue = (rateObj as Record<string, number>)[toCurrency];
                        return {
                            date: dateString.substring(5), // Slice to MM-DD for clean graph labels
                            rate: parseFloat(rateValue.toFixed(4))
                        };
                    });
                    setChartData(mappedData);
                    return; // 🌟 Success! Exit early so we don't trigger the offline simulation below
                }
            } catch (err) {
                console.warn('Failed to fetch rates, using offline simulated fallbacks:', err);
            }

            // 💾 Fallback simulation (used if offline or if Stage 2 fails)
            const fallbacks: { [key: string]: number } = {
                'EUR-USD': 1.09, 'EUR-GBP': 0.85, 'USD-EUR': 0.92,
                'USD-GBP': 0.78, 'GBP-EUR': 1.18, 'GBP-USD': 1.28
            };
            const key = `${fromCurrency}-${toCurrency}`;
            const fallbackRate = fallbacks[key] || 1.00;
            
            setRate(fallbackRate);
            
            setChartData([
                { date: 'Mon', rate: fallbackRate },
                { date: 'Tue', rate: fallbackRate + 0.02 },
                { date: 'Wed', rate: fallbackRate + 0.01 },
                { date: 'Thu', rate: fallbackRate + 0.03 },
                { date: 'Fri', rate: fallbackRate + 0.005 },
                { date: 'Sat', rate: fallbackRate },
                { date: 'Sun', rate: fallbackRate }
            ]);
        };

        fetchRatesAndHistory();
    }, [fromCurrency, toCurrency]);

    // 💱 3. handleExchange: Submits the conversion details to the backend API
    const handleExchange = async (e: React.FormEvent) => {
        // A. Prevent the default HTML form submission behavior (which refreshes the whole page)
        e.preventDefault();
        
        // B. Reset user messages and trigger the loading spinner state
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        // C. Validate that the user entered a valid positive number
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setErrorMsg('Please enter a valid amount to convert.');
            setLoading(false);
            return;
        }

        try {
            // D. Dispatch a secure POST request to the backend API exchange endpoint
            const res = await fetch(`${API_BASE_URL}/api/transactions/exchange`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Pass the secure JSON Web Token (JWT) in the Authorization header
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fromCurrency,  // e.g. "EUR"
                    toCurrency,    // e.g. "USD"
                    amount: parsedAmount, // numeric amount to exchange
                    rate           // current conversion rate used for the calculation
                })
            });

            // E. Parse the response payload from JSON format
            const data = await res.json();

            // F. If the status is 200/201 (success), update states and refresh balances
            if (res.ok) {
                setSuccessMsg(data.message); // Show visual success check
                setAmount(''); // Reset input field to blank
                fetchBalances(); // Pull updated wallet balances from backend database
            } else {
                // Otherwise display the validation or business logic error sent by backend
                setErrorMsg(data.error || 'Failed to complete exchange.');
            }
        } catch (err) {
            console.error('Exchange error:', err);
            setErrorMsg('Server connection failure.');
        } finally {
            // G. Stop the loading spinner state regardless of success or failure
            setLoading(false);
        }
    };

    // 🖥️ 4. Return JSX Layout: Renders the premium UI controls and historical charts
    return (
        <div className="fx-container">
            {/* Header: Title section with premium coins icon */}
            <div className="fx-header">
                <div className="fx-header-icon">
                    <Coins size={24} className="fx-coins" />
                </div>
                <div>
                    <h2 className="fx-title">Vindobona FX Converter</h2>
                    <p className="fx-subtitle">Instant cross-currency wallet settlements</p>
                </div>
            </div>

            {/* Wallet Balances Card: Lists active currency holdings */}
            <div className="fx-balance-section">
                <h4 className="fx-balance-title">Your Active Balances</h4>
                <div className="fx-balance-grid">
                    {wallets.map((w) => (
                        <div key={w.currency} className="fx-balance-item">
                            <span className="fx-currency-code">{w.currency}</span>
                            <span className="fx-balance-amount">
                                {w.currency === 'EUR' ? '€' : w.currency === 'USD' ? '$' : w.currency === 'GBP' ? '£' : ''} {w.balance.toFixed(2)}
                            </span>
                        </div>
                    ))}
                    {wallets.length === 0 && (
                        <span className="fx-empty-wallets">No wallets active. Complete an exchange to open one.</span>
                    )}
                </div>
            </div>

            {/* Alert Notifications: Conditional display of backend messages */}
            {successMsg && (
                <div className="fx-alert-success">
                    <ShieldCheck size={18} />
                    <span>{successMsg}</span>
                </div>
            )}
            {errorMsg && (
                <div className="fx-alert-error">
                    <ShieldAlert size={18} />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Exchange Form */}
            <form onSubmit={handleExchange}>
                <div className="fx-form-row">
                    {/* Source Currency Select Dropdown */}
                    <div className="fx-input-group">
                        <label className="fx-input-label">From Currency</label>
                        <select 
                            className="fx-select"
                            value={fromCurrency} 
                            onChange={(e) => setFromCurrency(e.target.value)}
                        >
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>

                    {/* Swap indicator arrow icon */}
                    <div className="fx-swap-arrow">
                        <ArrowRight size={20} />
                    </div>

                    {/* Target Currency Select Dropdown */}
                    <div className="fx-input-group">
                        <label className="fx-input-label">To Currency</label>
                        <select 
                            className="fx-select"
                            value={toCurrency} 
                            onChange={(e) => setToCurrency(e.target.value)}
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                </div>

                {/* Amount Input Field */}
                <div className="fx-form-group">
                    <label className="fx-input-label">Amount to Exchange</label>
                    <input 
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="fx-input"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                {/* Historical Rate Trendline Area Chart (shown only when currency pair is valid) */}
                {fromCurrency !== toCurrency && chartData.length > 0 && (
                    <div className="fx-chart-box">
                        <h4 className="fx-chart-title">7-Day Rate History ({fromCurrency} to {toCurrency})</h4>
                        <div className="fx-chart-wrapper">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="rateColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" className="fx-gradient-start" />
                                            <stop offset="95%" className="fx-gradient-stop" />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} className="fx-axis" />
                                    <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} className="fx-axis" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="rate" className="fx-area" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Live Preview Display Card (calculates conversion on the fly) */}
                {amount && parseFloat(amount) > 0 && (
                    <div className="fx-preview-box">
                        <div className="fx-preview-row">
                            <span className="fx-preview-label">Exchange Rate:</span>
                            <span className="fx-preview-value">1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</span>
                        </div>
                        <div className="fx-preview-row">
                            <span className="fx-preview-label">You will receive:</span>
                            <span className="fx-preview-result">
                                {toCurrency === 'EUR' ? '€' : toCurrency === 'USD' ? '$' : '£'} {(parseFloat(amount) * rate).toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Submit button with loading state spinner */}
                <button 
                    type="submit" 
                    className="fx-submit-btn"
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                >
                    <RefreshCw size={18} className={loading ? 'ice-spin' : ''} />
                    <span>{loading ? 'Processing Exchange...' : 'Complete Exchange'}</span>
                </button>
            </form>
        </div>
    );
};

export default FXConverter;
