import React, { useState, useEffect } from 'react';
// 📥 Import Lucide icons correctly capitalized
import { PiggyBank, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import '../Styles/BudgetManager.css';

// 📐 TypeScript Interface for budget items
interface BudgetLimit {
    id: string;
    category: string;
    limit: number;
    spent: number;
    remaining: number;
    isExceeded: boolean;
}

const BudgetManager: React.FC<{ token: string | null }> = ({ token }) => {
    // 💾 React Memory State
    const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
    
    // Input Fields States
    const [selectedCategory, setSelectedCategory] = useState('Groceries');
    const [customCategory, setCustomCategory] = useState('');
    const [amount, setAmount] = useState('');
    
    // Status State Channels
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // List of standard categories
    const categoryPresets = [
        'Groceries',
        'Utilities',
        'Leisure & Entertainment',
        'Travel',
        'Healthcare',
        'Shopping',
        'Rent',
        'Other'
    ];

    // 📡 Data Fetching API engine
    const fetchBudgets = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/budgets`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setBudgets(data);
            } else {
                const errData = await response.json().catch(() => ({}));
                setError(errData.error || 'Failed to fetch budget metrics.');
            }
        } catch (err) {
            console.error('Fetch budgets error:', err);
            setError('Connection error to backend server.');
        } finally {
            setLoading(false);
        }
    };

    // Load active limits when the view renders
    useEffect(() => {
        fetchBudgets();
    }, [token]);

    // ✍️ Form submission handler to register or update spending limits
    const handleSetBudget = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevents page reload
        if (!token) return;

        setError(null);
        setSuccess(null);

        // Map final category string
        const finalCategory = selectedCategory === 'Other' ? customCategory.trim() : selectedCategory;
        
        if (!finalCategory) {
            setError('Please specify a category name.');
            return;
        }

        const limitAmount = parseFloat(amount);
        if (isNaN(limitAmount) || limitAmount <= 0) {
            setError('Spending limit must be greater than 0.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/budgets`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category: finalCategory,
                    amount: limitAmount
                })
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(data.message || `Budget limit set for ${finalCategory}!`);
                setAmount('');
                setCustomCategory('');
                fetchBudgets(); // Refresh active list to calculate new percentage widths
            } else {
                const errData = await response.json().catch(() => ({}));
                setError(errData.error || 'Failed to save budget settings.');
            }
        } catch (err) {
            console.error('Save budget network error:', err);
            setError('Network error: Failed to save budget.');
        } finally {
            setSubmitting(false); // Restore button state
        }
    };

    // 🗑️ Remove an existing budget cap limit (any user can do this)
    const handleRemoveBudget = async (budgetId: string) => {
        if (!token) return;
        if (!window.confirm("Are you sure you want to remove this budget?")) return;

        setError(null);
        setSuccess(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/budgets/${budgetId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('Budget removed successfully.');
                fetchBudgets();
            } else {
                setError(data.error || 'Failed to remove budget.');
            }
        } catch (err) {
            console.error('Remove budget error:', err);
            setError('Connection error.');
        }
    };

    // 🎨 5. Main Component Layout render
    return (
        <div className="budget-manager-container">
            {/* Header section with descriptive overview of the feature */}
            <div className="budget-header">
                <h2>Financial Budget Manager</h2>
                <p>Track your spending limits per category and keep your financial health on track.</p>
            </div>

            {/* Split Grid Layout */}
            <div className="budget-grid">
                {/* Active Budget Cards Listing Panel (Left Pane) */}
                <div className="budgets-list-pane">
                    <h3>Active Budget Tracker</h3>
                    
                    {/* Render loader message if budgets are loading */}
                    {loading && <div className="budget-loader">Retrieving budgets...</div>}
                    
                    {/* Empty State Card if no budgets exist */}
                    {!loading && budgets.length === 0 && (
                        <div className="empty-budgets-card">
                            <PiggyBank size={40} className="empty-icon" />
                            <p>No budget limits configured yet.</p>
                            <span>Use the form on the right to set up your first spending cap.</span>
                        </div>
                    )}

                    {/* Loop through budgets array */}
                    {!loading && budgets.map(b => {
                        // Calculate percentage of budget used
                        const percent = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
                        
                        // Select warning color classes depending on percentage threshold
                        let progressColorClass = 'progress-normal'; // Cyan (Under 80%)
                        let badgeClass = 'badge-good';
                        let badgeText = 'On Track';

                        // Threshold evaluation
                        if (percent >= 100) {
                            progressColorClass = 'progress-exceeded'; // Red
                            badgeClass = 'badge-exceeded';
                            badgeText = 'Exceeded';
                        } else if (percent >= 80) {
                            progressColorClass = 'progress-warning'; // Gold
                            badgeClass = 'badge-warning';
                            badgeText = 'Nearing Limit';
                        }

                        return (
                            <div key={b.id} className="budget-card">
                                {/* Header: Category name and status badge */}
                                <div className="budget-card-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="budget-card-category">{b.category}</span>
                                        <span className={`budget-status-badge ${badgeClass}`}>{badgeText}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveBudget(b.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                                        title={`Remove budget for ${b.category}`}
                                    >
                                        Remove
                                    </button>
                                </div>

                                {/* Details: Spent amount of total limit */}
                                <div className="budget-limit-details">
                                    <span className="spent-label">
                                        Spent: <strong>€{b.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> of €{b.limit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className="percentage-label">{percent.toFixed(0)}%</span>
                                </div>

                                {/* Custom Progress Track container */}
                                <div className="budget-progress-track">
                                    <div 
                                        className={`budget-progress-fill ${progressColorClass}`} 
                                        style={{ width: `${Math.min(100, percent)}%` }}
                                    />
                                </div>

                                {/* Footer details */}
                                <div className="budget-card-footer">
                                    {b.isExceeded ? (
                                        <span className="budget-alert-text red">
                                            Over budget by €{Math.abs(b.limit - b.spent).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    ) : (
                                        <span className="budget-alert-text green">
                                            €{b.remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })} remaining limit
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Column: Set Category Limit Form Pane */}
                <div className="budget-form-pane">
                    <h3>Set Spending Threshold</h3>
                    
                    <form onSubmit={handleSetBudget} className="budget-form">
                        {/* Preset Category Dropdown Selector */}
                        <div className="budget-form-group">
                            <label>Category Group</label>
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="budget-select-input"
                            >
                                {categoryPresets.map(preset => (
                                    <option key={preset} value={preset}>{preset}</option>
                                ))}
                            </select>
                        </div>

                        {/* Renders custom text input conditionally only if 'Other' is chosen */}
                        {selectedCategory === 'Other' && (
                            <div className="budget-form-group animate-fade-in">
                                <label>Custom Category Name</label>
                                <input 
                                    type="text" 
                                    value={customCategory} 
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="Enter custom category..."
                                    className="budget-text-input"
                                    required
                                />
                            </div>
                        )}

                        {/* Monthly spending numeric limit input */}
                        <div className="budget-form-group">
                            <label>Monthly Spending Cap (€)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g. 250.00"
                                className="budget-text-input"
                                required
                            />
                        </div>

                        {/* Error warning banner */}
                        {error && (
                            <div className="budget-status-banner error">
                                <AlertCircle size={16} /> <span>{error}</span>
                            </div>
                        )}

                        {/* Success confirmation banner */}
                        {success && (
                            <div className="budget-status-banner success">
                                <CheckCircle size={16} /> <span>{success}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="budget-submit-btn"
                        >
                            {submitting ? 'Registering...' : 'Save Spending Limit'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BudgetManager;
