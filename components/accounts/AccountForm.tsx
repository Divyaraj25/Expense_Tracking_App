
import React, { useState, useEffect } from 'react';
import type { Account, AccountFormData } from '../../types';
import { AccountType } from '../../types';
import Button from '../shared/Button';

interface AccountFormProps {
  accountToEdit?: Account | null;
  onSave: (data: AccountFormData) => void;
  onCancel: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ accountToEdit, onSave, onCancel }) => {
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    type: AccountType.BANK,
    balance: 0,
    bankName: '',
    last4Digits: '',
  });

  useEffect(() => {
    if (accountToEdit) {
      setFormData({
        name: accountToEdit.name,
        type: accountToEdit.type,
        balance: accountToEdit.balance,
        bankName: accountToEdit.bankName || '',
        last4Digits: accountToEdit.last4Digits || '',
      });
    } else {
       setFormData({ name: '', type: AccountType.BANK, balance: 0, bankName: '', last4Digits: '' });
    }
  }, [accountToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const showBankDetails = formData.type === AccountType.BANK || formData.type === AccountType.CREDIT_CARD || formData.type === AccountType.DEBIT_CARD;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Account Name</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"/>
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-text-secondary">Account Type</label>
        <select name="type" id="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary">
            {Object.values(AccountType).map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="balance" className="block text-sm font-medium text-text-secondary">Current Balance</label>
        <input type="number" name="balance" id="balance" value={formData.balance} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"/>
      </div>

      {showBankDetails && (
        <>
            <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-text-secondary">Bank Name (Optional)</label>
                <input type="text" name="bankName" id="bankName" value={formData.bankName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"/>
            </div>
            <div>
                <label htmlFor="last4Digits" className="block text-sm font-medium text-text-secondary">Last 4 Digits (Optional)</label>
                <input type="text" name="last4Digits" id="last4Digits" value={formData.last4Digits} onChange={handleChange} pattern="\d{4}" title="Four digits" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"/>
            </div>
        </>
      )}

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-auto">Cancel</Button>
        <Button type="submit" className="w-auto">Save Account</Button>
      </div>
    </form>
  );
};

export default AccountForm;
