
import { useTransactionContext } from '../Context/TransactionContext';

const DashboardHeader = () => {
  // 1. Grab Balance and Search state directly from the Cloud
  const { totalBalance, searchTerm, setSearchTerm } = useTransactionContext();

  return (
    <div className="dashboard-header">
      <div className="header-info">
        <h1>Dashboard</h1>
        <p>Professional FinTech transaction management dashboard</p>
      </div>
      <div className="header-actions">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="balance-card">
          <div className="balance-card__label">Total Balance</div>
          <div className="balance-card__amount">${totalBalance.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;