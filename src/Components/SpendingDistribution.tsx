import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTransactionContext } from '../Context/TransactionContext';

function SpendingDistribution() {
  // Grab the data directly from the Cloud!
  const { pieData } = useTransactionContext();

  return (
    <div className="analytics-card">
      <div className="card-header">
        <h3>Spending Distribution</h3>
        <p>Expenses breakdown by category</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            stroke="none"
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} className={`pie-slice-${index}`} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingDistribution;