
import React, { useState, useEffect } from 'react';
import type { Budget, BudgetFormData, Category } from '../../types';
import { BudgetPeriod } from '../../types';
import Button from '../shared/Button';

interface BudgetFormProps {
  budgetToEdit?: Budget | null;
  categories: Category[];
  onSave: (data: BudgetFormData) => void;
  onCancel: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ budgetToEdit, categories, onSave, onCancel }) => {
  const getInitialFormData = (): BudgetFormData => {
    if (budgetToEdit) {
      return {
        categoryId: budgetToEdit.categoryId,
        amount: budgetToEdit.amount,
        period: budgetToEdit.period,
        startDate: budgetToEdit.startDate.split('T')[0],
        endDate: budgetToEdit.endDate ? budgetToEdit.endDate.split('T')[0] : '',
      };
    }
    return {
      categoryId: categories.find(c => c.name !== 'Salary')?.id || '',
      amount: 500,
      period: BudgetPeriod.MONTHLY,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    };
  };

  const [formData, setFormData] = useState<BudgetFormData>(getInitialFormData);

  useEffect(() => {
    setFormData(getInitialFormData());
  }, [budgetToEdit, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave: BudgetFormData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
    };
    if (dataToSave.period !== BudgetPeriod.CUSTOM) {
        delete dataToSave.endDate;
    }
    onSave(dataToSave);
  };

  const expenseCategories = categories.filter(c => c.name !== 'Salary');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-text-secondary">Category</label>
        <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary">
          {expenseCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-text-secondary">Budget Amount</label>
        <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required min="1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"/>
      </div>
      
      <div>
        <label htmlFor="period" className="block text-sm font-medium text-text-secondary">Period</label>
        <select name="period" id="period" value={formData.period} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary">
            {Object.values(BudgetPeriod).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-text-secondary">Start Date</label>
        <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"/>
      </div>

      {formData.period === BudgetPeriod.CUSTOM && (
        <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-text-secondary">End Date</label>
            <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"/>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-auto">Cancel</Button>
        <Button type="submit" className="w-auto">Save Budget</Button>
      </div>
    </form>
  );
};

export default BudgetForm;
