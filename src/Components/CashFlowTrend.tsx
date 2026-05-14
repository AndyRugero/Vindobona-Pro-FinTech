import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend }
    from 'recharts';

interface Props {
    data: any[];//data
}

const CashFlowTrend: React.FC<Props> = ({ data }) => {
    return (
        <div className="analytics-card">
            <div className="card-header">
                <h3>Cash Flow Trend</h3>
                <p>Monthly income vs expenses performance</p>
            </div>
            <div className="chart-wrapper">
                    {/* ResponsiveContainer makes sure the chart resizes
              if you move the window  */}
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data}>
                            {/* We hide the axes to keep the design
                   "Modern" and clean */}
                            <XAxis dataKey="date" hide />
                            <YAxis hide />
                            {/* Tooltip shows the numbers
                     when you hover your mouse over the graph */}
                            <Tooltip />
                            <Legend />
                            <Area type="monotone"
                                dataKey="income"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.1}
                                strokeWidth={3} />
                            
                            {/* EXPENSES AREA: We use a red color (#ef4444) */}
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
    )
}
export default CashFlowTrend;
