import React from 'react';
import StatCard from './StatCard';

const StatsRow: React.FC = () => {
  return (
    <section className="stats-row">
      <StatCard label="Monthly Income"
        value="4,200.00" />
      <StatCard label="Monthly Expenses"
        value="1,850.00" animationDelay="0.1s" />
      <StatCard label="Net Savings"
        value="2,350.00" animationDelay="0.2s" />
      <StatCard label="Total "
        value="24" animationDelay="0.3s" />
    </section>
  );


};
export default StatsRow;