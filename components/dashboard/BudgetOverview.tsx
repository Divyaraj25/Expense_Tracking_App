import React, { useMemo } from 'react';
import type { Budget, Transaction, Category } from '../../types';
import { TransactionType, BudgetPeriod } from '../../types';
import Icon from '../shared/Icon';

interface BudgetOverviewProps {
  budgets: Budget[];
  transactions: Transaction[];
  categories: Category[];
}

const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  const percentage = Math.min(100, Math.max(0, value));
  let colorClass = 'bg-secondary';
  if (percentage > 75) colorClass = 'bg-accent';
  if (percentage > 95) colorClass = 'bg-red-500';
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

const getBudgetPeriodText = (budget: Budget): string => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startDate = new Date(budget.startDate);
  let endDate: Date;

  switch (budget.period) {
    case BudgetPeriod.MONTHLY:
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      break;
    case BudgetPeriod.WEEKLY:
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;
    case BudgetPeriod.DAILY:
      endDate = startDate;
      break;
    default:
      return budget.period;
  }
  
  return `${startDate.toLocaleDateString(undefined, options)} - ${endDate.toLocaleDateString(undefined, options)}`;
};

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgets, transactions, categories }) => {
  const { activeBudgets, upcomingBudgets } = useMemo(() => {
    const now = new Date();
    const active: any[] = [];
    const upcoming: any[] = [];

    budgets.forEach(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      const spent = transactions
        .filter(t => t.type === TransactionType.EXPENSE && t.categoryId === budget.categoryId && new Date(t.date) >= new Date(budget.startDate))
        .reduce((sum, t) => sum + t.amount, 0);
      const progress = (spent / budget.amount) * 100;
      const budgetItem = { ...budget, category, spent, progress, periodText: getBudgetPeriodText(budget) };

      if (new Date(budget.startDate) > now) {
        upcoming.push(budgetItem);
      } else {
        active.push(budgetItem);
      }
    });

    return { activeBudgets: active.sort((a,b) => a.progress > b.progress ? -1 : 1), upcomingBudgets: upcoming.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) };
  }, [budgets, transactions, categories]);

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Budget Overview</h3>
      <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
        {activeBudgets.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Active Budgets</h4>
            {activeBudgets.map(item => (
              <div key={item.id} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Icon name={item.category?.icon || 'HelpCircle'} className="w-5 h-5 mr-2 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary">{item.category?.name}</span>
                  </div>
                  <span className="text-sm text-text-secondary">
                    ${item.spent.toFixed(0)} / <span className="font-medium">${item.amount}</span>
                  </span>
                </div>
                <ProgressBar value={item.progress} />
                <p className="text-xs text-text-secondary text-right mt-1">{item.periodText}</p>
              </div>
            ))}
          </div>
        )}
        
        {upcomingBudgets.length > 0 && (
           <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-4 mb-2">Upcoming Budgets</h4>
            {upcomingBudgets.map(item => (
              <div key={item.id} className="p-3 bg-gray-50 rounded-lg mb-2">
                <div className="flex justify-between items-center">
                   <div className="flex items-center">
                      <Icon name={item.category?.icon || 'HelpCircle'} className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-sm font-medium text-text-primary">{item.category?.name}</span>
                   </div>
                   <span className="text-sm font-medium text-text-primary">${item.amount}</span>
                </div>
                <p className="text-xs text-text-secondary text-right mt-1">{item.periodText}</p>
              </div>
            ))}
          </div>
        )}

        {activeBudgets.length === 0 && upcomingBudgets.length === 0 && <p className="text-text-secondary text-center mt-8">No budgets set up.</p>}
      </div>
    </div>
  );
};

export default BudgetOverview;