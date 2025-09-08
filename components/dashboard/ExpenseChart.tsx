
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Transaction, Category } from '../../types';
import { TransactionType } from '../../types';

interface ExpenseChartProps {
  transactions: Transaction[];
  categories: Category[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions, categories }) => {
  const expenseData = useMemo(() => {
    const expensesByCategory: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        if (expensesByCategory[t.categoryId]) {
          expensesByCategory[t.categoryId] += t.amount;
        } else {
          expensesByCategory[t.categoryId] = t.amount;
        }
      });
      
    return Object.entries(expensesByCategory).map(([categoryId, amount]) => ({
      name: categories.find(c => c.id === categoryId)?.name || 'Unknown',
      value: amount,
    })).sort((a,b) => b.value - a.value);
  }, [transactions, categories]);

  if (expenseData.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-sm h-96 flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Expense Breakdown</h3>
        <p className="text-text-secondary">No expense data available for this month.</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm h-96">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Expense Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={expenseData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {expenseData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;
