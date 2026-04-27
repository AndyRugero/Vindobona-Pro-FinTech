import React from 'react';
import StatCard from './StatCard';

const StatsRow: React.FC<{
  income: number,
  expenses: number, totalCount: number
}> = ({ income, expenses, totalCount }) => {
  return (
    <section className="stats-row">
      <StatCard label="Monthly Income"
        value={income.toLocaleString()} />
      <StatCard label="Monthly Expenses"
        value={(expenses.toLocaleString())} animationDelay="0.1s" />
      <StatCard label="Net Savings"
        value={(income - expenses).toLocaleString()} animationDelay="0.2s" />
      <StatCard label="Total "
        value={totalCount.toString()} animationDelay="0.3s" />
    </section>
  );


};
export default StatsRow;