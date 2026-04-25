import React from 'react';
import type { StatItem } from '../Interfaces/Interfaces';

const StatCard: React.FC<StatItem> = ({ label, value, animationDelay }) => {
  return (
    <div className="stat-card" style={{ animationDelay }}>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
    </div>
  );
};

export default StatCard;