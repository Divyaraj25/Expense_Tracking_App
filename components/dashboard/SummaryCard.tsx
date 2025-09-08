import React from 'react';
import Icon from '../shared/Icon';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: string;
  color: string;
  details?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, icon, color, details }) => {
  const isCurrency = title !== 'Accounts';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: isCurrency ? 'currency' : 'decimal',
    currency: 'USD',
    minimumFractionDigits: isCurrency ? 2 : 0,
    maximumFractionDigits: isCurrency ? 2 : 0,
  });

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">
          {formatter.format(amount)}
        </p>
        {details && (
          <p className="text-xs text-text-secondary mt-2">{details}</p>
        )}
      </div>
      <div className={`p-3 rounded-full text-white ${color}`}>
        <Icon name={icon} size={24} />
      </div>
    </div>
  );
};

export default SummaryCard;