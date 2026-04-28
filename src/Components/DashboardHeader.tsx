import React from 'react';

const DashboardHeader: React.FC<{ balance: number }> = ({ balance }) => {
  return (
    <div className="dashboard-header">
      <div className="dashboard-header__title">

        <h2>Vindobona Pro Fintech</h2>
        <p>Professional FinTech transaction management dashboard</p>
      </div>
      <div className="balance-card">
        <div className="balance-card__label">Total Balance</div>
        <div className="balance-card__amount">{balance.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default DashboardHeader;