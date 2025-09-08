import React, { useState } from 'react';
import type { Account, AccountFormData } from '../../types';
import Icon from '../shared/Icon';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import AccountForm from './AccountForm';

interface AccountsViewProps {
  accounts: Account[];
  onAddAccount: (data: AccountFormData) => void;
  onUpdateAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
}

const AccountCard: React.FC<{ account: Account; onEdit: () => void; onDelete: () => void; }> = ({ account, onEdit, onDelete }) => (
    <div className="bg-card p-4 rounded-lg shadow-sm flex items-center justify-between">
        <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-full mr-4">
                <Icon name="Landmark" className="text-primary"/>
            </div>
            <div>
                <p className="font-semibold text-text-primary">{account.name}</p>
                <p className="text-sm text-text-secondary">{account.type} - {account.bankName ? `${account.bankName} ` : ''}{account.last4Digits ? `**** ${account.last4Digits}` : ''}</p>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <p className="text-lg font-bold text-text-primary">${account.balance.toLocaleString()}</p>
            <button onClick={onEdit} className="p-2 text-text-secondary hover:text-primary"><Icon name="Pencil" size={18}/></button>
            <button onClick={onDelete} className="p-2 text-text-secondary hover:text-red-500"><Icon name="Trash2" size={18}/></button>
        </div>
    </div>
);


const AccountsView: React.FC<AccountsViewProps> = ({ accounts, onAddAccount, onUpdateAccount, onDeleteAccount }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const handleOpenModal = (account?: Account) => {
    setEditingAccount(account || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingAccount(null);
    setIsModalOpen(false);
  };
  
  const handleSave = (data: AccountFormData) => {
    if (editingAccount) {
        onUpdateAccount({ ...editingAccount, ...data });
    } else {
        onAddAccount(data);
    }
    handleCloseModal();
  };

  const handleDelete = () => {
    if (deletingAccountId) {
        onDeleteAccount(deletingAccountId);
        setDeletingAccountId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Accounts</h2>
        <Button onClick={() => handleOpenModal()} className="w-auto">
            <Icon name="Plus" size={16} className="mr-2" /> Add Account
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map(acc => (
              <AccountCard 
                key={acc.id} 
                account={acc} 
                onEdit={() => handleOpenModal(acc)} 
                onDelete={() => setDeletingAccountId(acc.id)}
              />
          ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAccount ? 'Edit Account' : 'Add New Account'}
      >
        <AccountForm 
            accountToEdit={editingAccount}
            onSave={handleSave}
            onCancel={handleCloseModal}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={!!deletingAccountId}
        onClose={() => setDeletingAccountId(null)}
        onConfirm={handleDelete}
        title="Delete Account"
        message="Are you sure you want to delete this account? This action cannot be undone."
      />

    </div>
  );
};

// FIX: Removed the block that attempted to modify Icon.defaultProps.
// This pattern is deprecated and caused TypeScript errors. All required icons
// are already defined in the central `icons` object in `Icon.tsx`, making this redundant.

export default AccountsView;