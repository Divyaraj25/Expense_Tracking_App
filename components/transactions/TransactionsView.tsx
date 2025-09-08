
import React, { useState, useMemo } from 'react';
import type { Transaction, Account, Category, TransactionFormData } from '../../types';
import Icon from '../shared/Icon';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import TransactionForm from './TransactionForm';
import { TransactionType } from '../../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onAddTransaction: (data: TransactionFormData) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

const TransactionRow: React.FC<{ transaction: Transaction; account?: Account; category?: Category; onEdit: () => void; onDelete: () => void; }> = ({ transaction, account, category, onEdit, onDelete }) => {
    const isIncome = transaction.type === TransactionType.INCOME;
    const amountColor = isIncome ? 'text-secondary' : 'text-red-500';
    const sign = isIncome ? '+' : (transaction.type === TransactionType.EXPENSE ? '-' : '');
    
    return (
      <tr className="border-b border-gray-200">
        <td className="py-3 px-4">
            <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-full mr-3">
                    <Icon name={category?.icon || 'HelpCircle'} className="text-text-primary" size={20}/>
                </div>
                <div>
                    <p className="font-semibold text-text-primary">{transaction.description}</p>
                    <p className="text-sm text-text-secondary">{category?.name || 'Uncategorized'}</p>
                </div>
            </div>
        </td>
        <td className="py-3 px-4 text-text-secondary">{account?.name || 'N/A'}</td>
        <td className="py-3 px-4 text-text-secondary">{new Date(transaction.date).toLocaleDateString()}</td>
        <td className={`py-3 px-4 font-bold text-right ${amountColor}`}>{sign} ${transaction.amount.toFixed(2)}</td>
        <td className="py-3 px-4 text-right">
            <button onClick={onEdit} className="p-2 text-text-secondary hover:text-primary"><Icon name="Pencil" size={18}/></button>
            <button onClick={onDelete} className="p-2 text-text-secondary hover:text-red-500"><Icon name="Trash2" size={18}/></button>
        </td>
      </tr>
    );
  };


const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, accounts, categories, onAddTransaction, onUpdateTransaction, onDeleteTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [filter, setFilter] = useState({ accountId: 'all', type: 'all' });

  const handleOpenModal = (transaction?: Transaction) => {
    setEditingTransaction(transaction || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(false);
  };
  
  const handleSave = (data: TransactionFormData) => {
    if (editingTransaction) {
        onUpdateTransaction({ ...editingTransaction, ...data });
    } else {
        onAddTransaction(data);
    }
    handleCloseModal();
  };

  const handleDelete = () => {
    if (deletingTransactionId) {
        onDeleteTransaction(deletingTransactionId);
        setDeletingTransactionId(null);
    }
  };
  
  const filteredTransactions = useMemo(() => {
    return transactions
        .filter(t => filter.accountId === 'all' || t.accountId === filter.accountId)
        .filter(t => filter.type === 'all' || t.type === filter.type)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Transactions</h2>
        <Button onClick={() => handleOpenModal()} className="w-auto">
            <Icon name="Plus" size={16} className="mr-2" /> Add Transaction
        </Button>
      </div>
      
      {/* Filters */}
      <div className="bg-card p-4 rounded-lg shadow-sm flex items-center space-x-4">
        <div className="flex-1">
            <label htmlFor="accountFilter" className="text-sm font-medium text-text-secondary">Account</label>
            <select id="accountFilter" value={filter.accountId} onChange={e => setFilter(f => ({...f, accountId: e.target.value}))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary">
                <option value="all">All Accounts</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
        </div>
        <div className="flex-1">
            <label htmlFor="typeFilter" className="text-sm font-medium text-text-secondary">Type</label>
            <select id="typeFilter" value={filter.type} onChange={e => setFilter(f => ({...f, type: e.target.value}))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary">
                <option value="all">All Types</option>
                {Object.values(TransactionType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
            <thead className="bg-gray-50">
                <tr>
                    <th className="py-2 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Description</th>
                    <th className="py-2 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Account</th>
                    <th className="py-2 px-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                    <th className="py-2 px-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</th>
                    <th className="py-2 px-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map(tx => (
                    <TransactionRow
                        key={tx.id}
                        transaction={tx}
                        account={accounts.find(a => a.id === tx.accountId)}
                        category={categories.find(c => c.id === tx.categoryId)}
                        onEdit={() => handleOpenModal(tx)}
                        onDelete={() => setDeletingTransactionId(tx.id)}
                    />
                ))}
            </tbody>
        </table>
         {filteredTransactions.length === 0 && <p className="text-center text-text-secondary p-8">No transactions found.</p>}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
      >
        <TransactionForm
            transactionToEdit={editingTransaction}
            accounts={accounts}
            categories={categories}
            onSave={handleSave}
            onCancel={handleCloseModal}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={!!deletingTransactionId}
        onClose={() => setDeletingTransactionId(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This will also update the balance of the associated account(s)."
      />

    </div>
  );
};

export default TransactionsView;
