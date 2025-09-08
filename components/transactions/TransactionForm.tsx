
import React, { useState, useEffect } from 'react';
import type { Transaction, TransactionFormData, Account, Category } from '../../types';
import { TransactionType } from '../../types';
import Button from '../shared/Button';

interface TransactionFormProps {
  transactionToEdit?: Transaction | null;
  accounts: Account[];
  categories: Category[];
  onSave: (data: TransactionFormData) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transactionToEdit, accounts, categories, onSave, onCancel }) => {
  const getInitialFormData = (): TransactionFormData => {
    if (transactionToEdit) {
      return {
        type: transactionToEdit.type,
        amount: transactionToEdit.amount,
        date: transactionToEdit.date.split('T')[0],
        description: transactionToEdit.description,
        accountId: transactionToEdit.accountId,
        categoryId: transactionToEdit.categoryId,
        toAccountId: transactionToEdit.toAccountId || '',
      };
    }
    return {
      type: TransactionType.EXPENSE,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      accountId: accounts[0]?.id || '',
      categoryId: categories[0]?.id || '',
      toAccountId: '',
    };
  };

  const [formData, setFormData] = useState<TransactionFormData>(getInitialFormData);

  useEffect(() => {
    setFormData(getInitialFormData());
  }, [transactionToEdit, accounts, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Math.abs(parseFloat(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave: TransactionFormData = {
        ...formData,
        date: new Date(formData.date).toISOString(), // Ensure ISO string format
    };
    if (dataToSave.type !== TransactionType.TRANSFER) {
        delete dataToSave.toAccountId;
    }
    onSave(dataToSave);
  };
  
  const incomeCategories = categories.filter(c => c.name === 'Salary' || c.name === 'Other');
  const expenseCategories = categories.filter(c => c.name !== 'Salary');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-text-secondary">Type</label>
        <select name="type" id="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary">
            {Object.values(TransactionType).map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
        <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"/>
      </div>
      
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-text-secondary">Amount</label>
        <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"/>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-text-secondary">Date</label>
        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"/>
      </div>

      <div>
        <label htmlFor="accountId" className="block text-sm font-medium text-text-secondary">{formData.type === 'Transfer' ? 'From Account' : 'Account'}</label>
        <select name="accountId" id="accountId" value={formData.accountId} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary">
            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toFixed(2)})</option>)}
        </select>
      </div>

      {formData.type === 'Transfer' && (
         <div>
            <label htmlFor="toAccountId" className="block text-sm font-medium text-text-secondary">To Account</label>
            <select name="toAccountId" id="toAccountId" value={formData.toAccountId} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary">
                <option value="">Select account</option>
                {accounts.filter(acc => acc.id !== formData.accountId).map(acc => <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toFixed(2)})</option>)}
            </select>
         </div>
      )}

      {formData.type !== 'Transfer' && (
        <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-text-secondary">Category</label>
            <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary">
                {(formData.type === 'Income' ? incomeCategories : expenseCategories).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-auto">Cancel</Button>
        <Button type="submit" className="w-auto">Save Transaction</Button>
      </div>
    </form>
  );
};

export default TransactionForm;
