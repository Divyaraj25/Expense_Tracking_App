
import React, { useState, useMemo, useEffect } from 'react';
import type { User, Transaction, Account, Budget, Category, TransactionFormData, AccountFormData, BudgetFormData } from '../../types';
import { TransactionType } from '../../types';
import { USERS, ACCOUNTS, TRANSACTIONS, BUDGETS, CATEGORIES } from '../../constants';
import Sidebar from '../shared/Sidebar';
import Header from '../shared/Header';
import SummaryCard from './SummaryCard';
import ExpenseChart from './ExpenseChart';
import BudgetOverview from './BudgetOverview';
import RecentTransactions from './RecentTransactions';
import Icon from '../shared/Icon';
import { GoogleGenAI } from "@google/genai";

import AccountsView from '../accounts/AccountsView';
import TransactionsView from '../transactions/TransactionsView';
import BudgetsView from '../budgets/BudgetsView';
import SettingsView from '../settings/SettingsView';


interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [financialFact, setFinancialFact] = useState<string>('');
  const [isLoadingFact, setIsLoadingFact] = useState<boolean>(true);
  
  // --- Centralized State Management ---
  const [accounts, setAccounts] = useState<Account[]>(ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(BUDGETS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  // --- Derived Data ---
  const userAccounts = useMemo(() => accounts.filter(acc => acc.userId === currentUser.id), [accounts, currentUser.id]);
  const sharedAccounts = useMemo(() => accounts.filter(acc => acc.isSharedWith?.includes(currentUser.id)), [accounts, currentUser.id]);
  const allVisibleAccounts = useMemo(() => [...userAccounts, ...sharedAccounts], [userAccounts, sharedAccounts]);
  const userTransactions = useMemo(() => transactions.filter(t => allVisibleAccounts.some(a => a.id === t.accountId)), [transactions, allVisibleAccounts]);
  const userBudgets = useMemo(() => budgets.filter(b => b.userId === currentUser.id), [budgets, currentUser.id]);

  // --- Dashboard Calculations ---
  const totalBalance = useMemo(() => allVisibleAccounts.reduce((sum, acc) => sum + acc.balance, 0), [allVisibleAccounts]);
  const totalIncome = useMemo(() => userTransactions.filter(t => t.type === 'Income' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0), [userTransactions]);
  const totalExpense = useMemo(() => userTransactions.filter(t => t.type === 'Expense' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0), [userTransactions]);

  const lastMonthIncome = useMemo(() => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth();
    return userTransactions.filter(t => { const d = new Date(t.date); return t.type === 'Income' && d.getMonth() === month && d.getFullYear() === year; }).reduce((sum, t) => sum + t.amount, 0);
  }, [userTransactions]);

  const lastMonthExpense = useMemo(() => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth();
    return userTransactions.filter(t => { const d = new Date(t.date); return t.type === 'Expense' && d.getMonth() === month && d.getFullYear() === year; }).reduce((sum, t) => sum + t.amount, 0);
  }, [userTransactions]);

  const getChangeIndicator = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? 'Up from $0' : 'No data';
    const percentChange = ((current - previous) / previous) * 100;
    if (Math.abs(percentChange) < 1) return 'Similar';
    return `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(0)}% vs last month`;
  };
  
  const incomeDetails = getChangeIndicator(totalIncome, lastMonthIncome);
  const expenseDetails = getChangeIndicator(totalExpense, lastMonthExpense);
  const accountsDetails = `${userAccounts.length} personal, ${sharedAccounts.length} shared`;

  const highestBalanceAccount = useMemo(() => {
    if (allVisibleAccounts.length === 0) return null;
    return [...allVisibleAccounts].sort((a, b) => b.balance - a.balance)[0];
  }, [allVisibleAccounts]);

  // --- CRUD Handlers ---

  // Accounts
  const handleAddAccount = (accountData: AccountFormData) => {
    const newAccount: Account = {
      id: `acc${Date.now()}`,
      userId: currentUser.id,
      ...accountData,
    };
    setAccounts(prev => [...prev, newAccount]);
  };
  
  const handleUpdateAccount = (updatedAccount: Account) => {
    setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
  };
  
  const handleDeleteAccount = (accountId: string) => {
    // Note: In a real app, you'd need to handle transactions associated with this account.
    setAccounts(prev => prev.filter(acc => acc.id !== accountId));
  };
  
  // Transactions
  const updateAccountBalance = (accountId: string, amount: number) => {
    setAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, balance: acc.balance + amount } : acc));
  };

  const handleAddTransaction = (transactionData: TransactionFormData) => {
    const newTransaction: Transaction = {
      id: `txn${Date.now()}`,
      userId: currentUser.id,
      ...transactionData,
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    
    // Update account balances
    if (newTransaction.type === TransactionType.INCOME) {
      updateAccountBalance(newTransaction.accountId, newTransaction.amount);
    } else if (newTransaction.type === TransactionType.EXPENSE) {
      updateAccountBalance(newTransaction.accountId, -newTransaction.amount);
    } else if (newTransaction.type === TransactionType.TRANSFER && newTransaction.toAccountId) {
      updateAccountBalance(newTransaction.accountId, -newTransaction.amount);
      updateAccountBalance(newTransaction.toAccountId, newTransaction.amount);
    }
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
    if (!originalTransaction) return;

    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));

    // Revert original transaction effect
    if (originalTransaction.type === TransactionType.INCOME) {
      updateAccountBalance(originalTransaction.accountId, -originalTransaction.amount);
    } else if (originalTransaction.type === TransactionType.EXPENSE) {
      updateAccountBalance(originalTransaction.accountId, originalTransaction.amount);
    } else if (originalTransaction.type === TransactionType.TRANSFER && originalTransaction.toAccountId) {
      updateAccountBalance(originalTransaction.accountId, originalTransaction.amount);
      updateAccountBalance(originalTransaction.toAccountId, -originalTransaction.amount);
    }

    // Apply new transaction effect
    if (updatedTransaction.type === TransactionType.INCOME) {
      updateAccountBalance(updatedTransaction.accountId, updatedTransaction.amount);
    } else if (updatedTransaction.type === TransactionType.EXPENSE) {
      updateAccountBalance(updatedTransaction.accountId, -updatedTransaction.amount);
    } else if (updatedTransaction.type === TransactionType.TRANSFER && updatedTransaction.toAccountId) {
      updateAccountBalance(updatedTransaction.accountId, -updatedTransaction.amount);
      updateAccountBalance(updatedTransaction.toAccountId, updatedTransaction.amount);
    }
  };
  
  const handleDeleteTransaction = (transactionId: string) => {
      const transactionToDelete = transactions.find(t => t.id === transactionId);
      if (!transactionToDelete) return;

      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      
      // Revert transaction effect on balances
      if (transactionToDelete.type === TransactionType.INCOME) {
          updateAccountBalance(transactionToDelete.accountId, -transactionToDelete.amount);
      } else if (transactionToDelete.type === TransactionType.EXPENSE) {
          updateAccountBalance(transactionToDelete.accountId, transactionToDelete.amount);
      } else if (transactionToDelete.type === TransactionType.TRANSFER && transactionToDelete.toAccountId) {
          updateAccountBalance(transactionToDelete.accountId, transactionToDelete.amount);
          updateAccountBalance(transactionToDelete.toAccountId, -transactionToDelete.amount);
      }
  };

  // Budgets
  const handleAddBudget = (budgetData: BudgetFormData) => {
    const newBudget: Budget = {
      id: `bud${Date.now()}`,
      userId: currentUser.id,
      ...budgetData,
    };
    setBudgets(prev => [...prev, newBudget]);
  };
  
  const handleUpdateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  };
  
  const handleDeleteBudget = (budgetId: string) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
  };


  // Fetch financial fact from Gemini API
  useEffect(() => {
    const fetchFact = async () => {
      setIsLoadingFact(true);
      try {
        if (!process.env.API_KEY) {
            setFinancialFact("An API key is required for financial facts. Please set the API_KEY environment variable.");
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Tell me one interesting and surprising fact about personal finance or money in a single short sentence.',
        });
        setFinancialFact(response.text);
      } catch (error) {
        console.error("Error fetching financial fact:", error);
        setFinancialFact("The average person spends about 12-18% of their income on food.");
      } finally {
        setIsLoadingFact(false);
      }
    };
    fetchFact();
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Total Balance" amount={totalBalance} icon="Wallet" color="bg-primary" details={highestBalanceAccount ? `Main: ${highestBalanceAccount.name}` : ''} />
                <SummaryCard title="This Month's Income" amount={totalIncome} icon="TrendingUp" color="bg-secondary" details={incomeDetails} />
                <SummaryCard title="This Month's Expense" amount={totalExpense} icon="TrendingDown" color="bg-red-500" details={expenseDetails} />
                <SummaryCard title="Accounts" amount={allVisibleAccounts.length} icon="Landmark" color="bg-accent" details={accountsDetails} />
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm flex items-center space-x-4">
              <div className="bg-indigo-100 text-primary p-3 rounded-full">
                <Icon name="Sparkles" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Financial Fact</h3>
                <p className="text-text-secondary text-sm">{isLoadingFact ? 'Loading...' : financialFact}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ExpenseChart transactions={userTransactions} categories={categories} />
              </div>
              <div>
                <BudgetOverview budgets={userBudgets} transactions={userTransactions} categories={categories} />
              </div>
            </div>
            <div>
              <RecentTransactions transactions={[...userTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)} accounts={allVisibleAccounts} categories={categories} />
            </div>
          </div>
        );
      case 'accounts':
        return <AccountsView
          accounts={allVisibleAccounts}
          onAddAccount={handleAddAccount}
          onUpdateAccount={handleUpdateAccount}
          onDeleteAccount={handleDeleteAccount}
        />;
      case 'transactions':
        return <TransactionsView
            transactions={userTransactions}
            accounts={allVisibleAccounts}
            categories={categories}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
        />;
      case 'budgets':
        return <BudgetsView
            budgets={userBudgets}
            categories={categories}
            transactions={userTransactions}
            onAddBudget={handleAddBudget}
            onUpdateBudget={handleUpdateBudget}
            onDeleteBudget={handleDeleteBudget}
        />;
      case 'settings':
        return <SettingsView currentUser={currentUser} />;
      default:
        return <div className="text-2xl font-bold text-text-primary">Page not found</div>
    }
  };

  return (
    <>
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col">
        <Header currentUser={currentUser} onLogout={onLogout} />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </>
  );
};

export default Dashboard;
