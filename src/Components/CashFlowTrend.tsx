import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTransactionContext } from '../Context/TransactionContext';

const CashFlowTrend: React.FC = () => {
    // Grab the Trend Data directly from the Cloud!
    const { trendData } = useTransactionContext();

    return (
        <div className="analytics-card">
            <div className="card-header">
                <h3>Cash Flow Trend</h3>
                <p>Monthly income vs expenses performance</p>
            </div>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Legend />
                        {/* INCOME AREA */}
                        <Area type="monotone"
                            dataKey="income"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.1}
                            strokeWidth={3} 
                        />
                        
                        {/* EXPENSES AREA */}
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#ef4444"
                            fill="#ef4444"
                            fillOpacity={0.1}
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CashFlowTrend;
