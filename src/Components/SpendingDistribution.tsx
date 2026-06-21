import React from 'react';
// 📈 Import Recharts elements to build our visual donut chart
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
// 📥 Import context to read active user transactions
import { useTransactionContext } from '../Context/TransactionContext';
import '../Styles/Analytics.css';

// 🎨 Vivid neon color palette — each slice gets its own distinct color + label
const COLORS = [
    '#eab308', // 🟡 Amber Gold     → Food & Dining
    '#3b82f6', // 🔵 Electric Blue  → Shopping
    '#8b5cf6', // 🟣 Neon Purple    → Utilities
    '#ec4899', // 🩷 Ruby Pink      → Entertainment
    '#10b981', // 🟢 Emerald Green  → Health & Sport
    '#f97316', // 🟠 Vivid Orange   → Travel
    '#06b6d4', // 🩵 Cyan Laser     → Tech & Subscriptions
    '#ef4444', // 🔴 Hot Red        → Rent & Housing
    '#a3e635', // 🟩 Lime Green     → Groceries
    '#f43f5e', // 🌹 Rose Red       → Personal Care
];

const SpendingDistribution: React.FC = () => {
    // 🔍 Extract calculated pieData array from our context
    const { pieData } = useTransactionContext();

    // 💰 Sum up all category amounts to show a total in the middle
    const totalSpent = pieData.reduce((acc, entry) => acc + entry.value, 0);

    return (
        <div className="analytics-card hologram-card spending-pie-card">
            {/* Title Section */}
            <div className="card-header">
                <div>
                    <h3>Spending Distribution</h3>
                    <p>Expenses by Category</p>
                </div>
            </div>

            {/* If there are no expenses yet, show a clean fallback message */}
            {pieData.length === 0 ? (
                <div className="empty-chart-state">
                    <p>No expense transactions logged yet.</p>
                </div>
            ) : (
                <div className="pie-chart-layout">
                    {/* 🍩 The Donut Chart Container */}
                    <div className="pie-chart-container">
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60} // Creates the empty hole in the middle
                                    outerRadius={80} // Width of the colored ring
                                    paddingAngle={4}  // Gap size between colored slices
                                    dataKey="value"
                                >
                                    {/* Map each category slice to its matching neon color */}
                                    {pieData.map((_entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="#050a18"      /* Dark gap between slices */
                                            strokeWidth={2}       /* Width of the gap line */
                                        />
                                    ))}
                                </Pie>
                                {/* Tooltip that pops up on hover */}
                                <Tooltip
                                    formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Spent']}
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderColor: '#1e293b',
                                        borderRadius: '8px',
                                        color: 'white',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* 💰 The Label overlay positioned directly inside the donut hole */}
                        <div className="pie-center-label">
                            <span className="center-title">Total Spent</span>
                            <span className="center-amount">€{totalSpent.toFixed(0)}</span>
                        </div>
                    </div>

                    {/* 🔑 Custom Legend / Key List */}
                    <div className="pie-legend-container">
                        {pieData.map((entry, index) => {
                            const percent = ((entry.value / totalSpent) * 100).toFixed(1);
                            const color = COLORS[index % COLORS.length];
                            return (
                                <div
                                    key={entry.name}
                                    className="pie-legend-item"
                                    style={{ borderLeft: `3px solid ${color}` }} /* 🎨 Colored left stripe */
                                >
                                    {/* Left side: colored dot + category name */}
                                    <div className="legend-indicator">
                                        <span
                                            className="legend-dot"
                                            style={{
                                                backgroundColor: color,
                                                boxShadow: `0 0 8px ${color}`,  /* Neon glow on dot */
                                            }}
                                        />
                                        <span className="legend-name">{entry.name}</span>
                                    </div>
                                    {/* Right side: percentage + euro amount */}
                                    <div className="legend-values">
                                        <span className="legend-percentage">{percent}%</span>
                                        <span className="legend-amount" style={{ color }}>
                                            €{entry.value.toFixed(0)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpendingDistribution;