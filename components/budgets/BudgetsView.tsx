import React, { useState } from 'react';
import type { Budget, Category, Transaction, BudgetFormData } from '../../types';
import { TransactionType, BudgetPeriod } from '../../types';
import Icon from '../shared/Icon';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import BudgetForm from './BudgetForm';

interface BudgetsViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  onAddBudget: (data: BudgetFormData) => void;
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (budgetId: string) => void;
}

const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
    const percentage = Math.min(100, Math.max(0, value));
    let colorClass = 'bg-secondary';
    if (percentage > 75) colorClass = 'bg-accent';
    if (percentage > 95) colorClass = 'bg-red-500';
    return <div className="w-full bg-gray-200 rounded-full h-2"><div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div></div>;
};

const getBudgetPeriodText = (budget: Budget): string => {
    const fullOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const shortOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startDate = new Date(budget.startDate);
    
    if (budget.period === BudgetPeriod.YEARLY) {
      const endDate = new Date(startDate.getFullYear(), 11, 31);
      return `Jan 1, ${startDate.getFullYear()} - Dec 31, ${endDate.getFullYear()}`;
    }
  
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
      case BudgetPeriod.CUSTOM:
        if (budget.endDate) {
          endDate = new Date(budget.endDate);
          return startDate.getFullYear() !== endDate.getFullYear()
            ? `${startDate.toLocaleDateString(undefined, fullOptions)} - ${endDate.toLocaleDateString(undefined, fullOptions)}`
            : `${startDate.toLocaleDateString(undefined, shortOptions)} - ${endDate.toLocaleDateString(undefined, shortOptions)}`;
        }
        return `Starts ${startDate.toLocaleDateString(undefined, fullOptions)}`;
      default:
          return `Starts ${startDate.toLocaleDateString(undefined, fullOptions)}`;
    }
  
    return startDate.getFullYear() !== endDate.getFullYear()
        ? `${startDate.toLocaleDateString(undefined, fullOptions)} - ${endDate.toLocaleDateString(undefined, fullOptions)}`
        : `${startDate.toLocaleDateString(undefined, shortOptions)} - ${endDate.toLocaleDateString(undefined, shortOptions)}`;
};


const BudgetCard: React.FC<{ budget: Budget; category?: Category; spent: number; onEdit: () => void; onDelete: () => void; }> = ({ budget, category, spent, onEdit, onDelete }) => {
    const progress = (spent / budget.amount) * 100;
    const remaining = budget.amount - spent;
    
    return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-start">
            <div className="flex items-center">
                <div className="p-3 bg-gray-100 rounded-full mr-4">
                    <Icon name={category?.icon || 'HelpCircle'} className="text-primary"/>
                </div>
                <div>
                    <p className="font-semibold text-text-primary">{category?.name}</p>
                    <p className="text-sm text-text-secondary">{budget.period} Budget</p>
                     <p className="text-xs text-text-secondary mt-1 flex items-center">
                        <Icon name="Calendar" size={14} className="mr-1.5"/>
                        {getBudgetPeriodText(budget)}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-1">
                 <button onClick={onEdit} className="p-2 text-text-secondary hover:text-primary"><Icon name="Pencil" size={18}/></button>
                 <button onClick={onDelete} className="p-2 text-text-secondary hover:text-red-500"><Icon name="Trash2" size={18}/></button>
            </div>
        </div>
        <div className="mt-4">
            <ProgressBar value={progress} />
            <div className="flex justify-between text-sm mt-2">
                <p className="text-text-secondary">Spent: <span className="font-medium text-text-primary">${spent.toFixed(2)}</span></p>
                <p className="text-text-secondary">Remaining: <span className="font-medium text-text-primary">${remaining.toFixed(2)}</span></p>
            </div>
        </div>
    </div>
)};


const BudgetsView: React.FC<BudgetsViewProps> = ({ budgets, categories, transactions, onAddBudget, onUpdateBudget, onDeleteBudget }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);

  const handleOpenModal = (budget?: Budget) => {
    setEditingBudget(budget || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingBudget(null);
    setIsModalOpen(false);
  };
  
  const handleSave = (data: BudgetFormData) => {
    if (editingBudget) {
        onUpdateBudget({ ...editingBudget, ...data });
    } else {
        onAddBudget(data);
    }
    handleCloseModal();
  };

  const handleDelete = () => {
    if (deletingBudgetId) {
        onDeleteBudget(deletingBudgetId);
        setDeletingBudgetId(null);
    }
  };

  const getSpentAmount = (budget: Budget) => {
    return transactions
        .filter(t => t.type === TransactionType.EXPENSE && t.categoryId === budget.categoryId && new Date(t.date) >= new Date(budget.startDate))
        .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Budgets</h2>
        <Button onClick={() => handleOpenModal()} className="w-auto">
            <Icon name="Plus" size={16} className="mr-2" /> Add Budget
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(budget => (
              <BudgetCard 
                key={budget.id} 
                budget={budget}
                category={categories.find(c => c.id === budget.categoryId)}
                spent={getSpentAmount(budget)}
                onEdit={() => handleOpenModal(budget)} 
                onDelete={() => setDeletingBudgetId(budget.id)}
              />
          ))}
      </div>
      {budgets.length === 0 && <p className="text-center text-text-secondary py-8">No budgets set. Create one to get started!</p>}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBudget ? 'Edit Budget' : 'Add New Budget'}
      >
        <BudgetForm 
            budgetToEdit={editingBudget}
            categories={categories}
            onSave={handleSave}
            onCancel={handleCloseModal}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={!!deletingBudgetId}
        onClose={() => setDeletingBudgetId(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message="Are you sure you want to delete this budget?"
      />

    </div>
  );
};

export default BudgetsView;