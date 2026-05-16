import React from 'react';
import StatCard from './StatCard';
import { useTransactionContext } from '../Context/TransactionContext';

const StatsRow = () => {
  // 1. Grab the live numbers from the Cloud
  const { income, expenses, filteredData } = useTransactionContext();

  return (
    <section className="stats-row">
      <StatCard 
        label="Monthly Income" 
        value={income.toLocaleString()} 
      />
      <StatCard 
        label="Monthly Expenses" 
        value={expenses.toLocaleString()} 
        animationDelay="0.1s" 
      />
      {/* We calculate Net Savings right here using the global values! */}
      <StatCard 
        label="Net Savings" 
        value={(income - Math.abs(expenses)).toLocaleString()} 
        animationDelay="0.2s" 
      />
      <StatCard 
        label="Total Transactions" 
        value={filteredData.length.toString()} 
        animationDelay="0.3s" 
      />
    </section>
  );
};

export default StatsRow;