import StatCard from './StatCard';
import { useTransactionContext } from '../Context/TransactionContext';
import { TrendingUp, Wallet, ArrowDownCircle, BarChart3 } from 'lucide-react';
import '../Styles/StatsRow.css';

const StatsRow = () => {
  const { income, expenses, filteredData } = useTransactionContext();

  const getMiniTrend = (type: 'income' | 'expenses') => {
    return filteredData
      .slice(0, 8)
      .reverse()
      .map((tx, index) => {
        const amount = Math.abs(parseFloat(tx.amount.replace(/[^\d.-]/g, '')) || 0);
        const value = (type === 'income' && !tx.isNegative) || (type === 'expenses' && tx.isNegative)
          ? amount
          : 5;
        return { name: index, value };
      });
  };

  return (
    <section className="stats-row">
      <StatCard
        label="Monthly Income"
        value={`€${income.toLocaleString()}`}
        icon={<TrendingUp size={20} />}
        type="savings"
        chartData={getMiniTrend('income')}
      />

      <StatCard
        label="Monthly Expenses"
        value={`€${Math.abs(expenses).toLocaleString()}`}
        icon={<ArrowDownCircle size={20} />}
        type="expenses"
        chartData={getMiniTrend('expenses')}
      />

      <StatCard
        label="Net Savings"
        value={`€${(income - Math.abs(expenses)).toLocaleString()}`}
        icon={<Wallet size={20} />}
        type="income"
        chartData={getMiniTrend('income')}
      />

      <StatCard
        label="Data Points"
        value={filteredData.length.toString()}
        icon={<BarChart3 size={20} />}
        type="warning"
        chartData={[{ value: 2 }, { value: 5 }, { value: 3 }, { value: 8 }, { value: 6 }, { value: 10 }]}
      />
    </section>
  );
};

export default StatsRow;