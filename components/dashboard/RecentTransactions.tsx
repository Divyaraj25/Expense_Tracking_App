
import React from 'react';
import type { Transaction, Account, Category } from '../../types';
import { TransactionType } from '../../types';
import Icon from '../shared/Icon';

interface RecentTransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
}

const TransactionRow: React.FC<{ transaction: Transaction; account?: Account; category?: Category }> = ({ transaction, account, category }) => {
  const isIncome = transaction.type === TransactionType.INCOME;
  const amountColor = isIncome ? 'text-secondary' : 'text-red-500';
  const sign = isIncome ? '+' : (transaction.type === TransactionType.EXPENSE ? '-' : '');
  
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
        <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-full mr-4">
                <Icon name={category?.icon || 'HelpCircle'} className="text-text-primary" />
            </div>
            <div>
                <p className="font-semibold text-text-primary">{transaction.description}</p>
                <p className="text-sm text-text-secondary">{account?.name || 'Unknown Account'}</p>
            </div>
        </div>
        <div className="text-right">
            <p className={`font-bold ${amountColor}`}>{sign} ${transaction.amount.toFixed(2)}</p>
            <p className="text-sm text-text-secondary">{new Date(transaction.date).toLocaleDateString()}</p>
        </div>
    </div>
  );
};

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, accounts, categories }) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Transactions</h3>
      <div className="space-y-2">
        {transactions.map(tx => {
          const account = accounts.find(a => a.id === tx.accountId);
          const category = categories.find(c => c.id === tx.categoryId);
          return <TransactionRow key={tx.id} transaction={tx} account={account} category={category} />;
        })}
         {transactions.length === 0 && <p className="text-text-secondary text-center mt-8">No recent transactions.</p>}
      </div>
    </div>
  );
};

export default RecentTransactions;
