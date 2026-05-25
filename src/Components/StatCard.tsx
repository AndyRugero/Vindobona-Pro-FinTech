import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Maximize2 } from 'lucide-react';
import type { StatItem } from '../Interfaces/Interfaces';
import '../Styles/StatCard.css';

/**
 * THE ULTIMATE "DIVIDE & CONQUER" COMPONENT
 * Zero style props allowed. Logic only.
 */
interface ExtendedStatItem extends Omit<StatItem, 'animationDelay'> {
  chartData?: any[];
  type?: 'income' | 'expenses' | 'savings' | 'warning';
  icon?: React.ReactNode;
}

const StatCard: React.FC<ExtendedStatItem> = ({
  label,
  value,
  chartData,
  type = 'savings',
  icon
}) => {
  return (
    <div className={`stat-card stat-card--${type}`}>
      <div className="stat-card__top">
        <div className="stat-card__icon-box">
          {icon}
        </div>
        <Maximize2 size={14} className="stat-card__expand" />
      </div>

      <div className="stat-card__body">
        <div className="stat-card__info">
          <div className="stat-card__label">{label}</div>
          <div className="stat-card__value">{value}</div>
        </div>

        {chartData && (
          <div className="stat-card__sparkline">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="currentColor" 
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;