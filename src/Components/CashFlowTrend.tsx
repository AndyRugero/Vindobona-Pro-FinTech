import React from 'react';
import { AreaChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Area, Tooltip, Legend } from 'recharts';
import { useTransactionContext } from '../Context/TransactionContext';
import '../Styles/Analytics.css';

const CashFlowTrend: React.FC = () => {
    // 1. Pull the computed trend data from the context file
    const { trendData } = useTransactionContext();

    return (
        <div className="analytics-card hologram-card">
            {/* Header section with clean HTML markup */}
            <div className="card-header">
                <div>
                    <h3>Income, Expenses and savings</h3>
                    <p>Financial Pulse</p>
                </div>
                <select className="time-range-select">
                    <option>Last 7 Days</option>
                    <option>Last 3 Months</option>
                    <option>Last 2 years</option>
                </select>
            </div>

            {/* Chart canvas wrapper */}
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                    {/* The AreaChart wraps grid, axes, and paths! */}
                    <AreaChart data={trendData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>

                        {/* Define our Hologram Gradient Colors */}
                        <defs>
                            {/* Green Gradient (Income) */}
                            <linearGradient id="solidGreen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                            </linearGradient>

                            {/* Red Gradient (Expenses) */}
                            <linearGradient id="solidRed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01} />
                            </linearGradient>

                            {/* Blue Gradient (Savings) */}
                            <linearGradient id="solidSavings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                            </linearGradient>
                        </defs>

                        {/* A. Grid lines */}
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        {/* B. X-Axis */}
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                        />

                        {/* C. Y-Axis */}
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            width={60}
                        />

                        {/* D. Tooltip for premium interactive values on hover */}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#1e293b',
                                borderRadius: '8px',
                                color: 'white'
                            }}
                        />

                        {/* E. Drawing our 3 Hologram Area Layers */}

                        {/* Layer 1: Income (Solid GREEN Wave) */}
                        <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#10b981"
                            name="income"
                            className="chart-area--income"
                            fill="url(#solidGreen)"
                        />

                        {/* Layer 2: Expenses (Dashed RED Wave) */}
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            name="expenses"
                            stroke="#ef4444"
                            className="chart-area--expenses"
                            fill="url(#solidRed)"
                        />

                        {/* Layer 3: Net Savings (Solid BLUE Wave) */}
                        <Area
                            type="monotone"
                            dataKey="savings"
                            name="savings"
                            stroke="#3b82f6"
                            className="chart-area--savings"
                            fill="url(#solidSavings)"
                        />

                        <Legend verticalAlign="bottom"
                            iconType="plainline"
                            height={36}>
                        </Legend>


                    </AreaChart>
                </ResponsiveContainer>
            </div>



        </div>
    );
};

export default CashFlowTrend;
