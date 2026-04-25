import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <div className="dashboard-header">
      <div className="dashboard-header__title">
        {/* Updated project name */}
        <h2>Vindobona Pro Fintech</h2>
        <p>Professional FinTech transaction management dashboard</p>
      </div>
      <div className="balance-card">
        <div className="balance-card__label">Total Balance</div>
        <div className="balance-card__amount">€5,430.00</div>
      </div>
    </div>
  );
};

export default DashboardHeader;