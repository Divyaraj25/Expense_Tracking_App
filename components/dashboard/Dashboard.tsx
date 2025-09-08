import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { User, Transaction, Account, Budget, Category, TransactionFormData, AccountFormData, BudgetFormData } from '../../types';
import { TransactionType } from '../../types';
// Static data like categories can still be kept locally
import { CATEGORIES as staticCategories } from '../../constants';
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // --- Centralized State Management ---
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories] = useState<Category[]>(staticCategories);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const userAccountsQuery = query(collection(db, 'accounts'), where("userId", "==", currentUser.id));
        const accountsSnapshot = await getDocs(userAccountsQuery);
        const fetchedAccounts = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
        setAccounts(fetchedAccounts);

        if (fetchedAccounts.length > 0) {
            const accountIds = fetchedAccounts.map(a => a.id);
            const userTransactionsQuery = query(collection(db, 'transactions'), where("accountId", "in", accountIds));
            const transactionsSnapshot = await getDocs(userTransactionsQuery);
            const fetchedTransactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
            setTransactions(fetchedTransactions);
        } else {
            setTransactions([]);
        }

        const userBudgetsQuery = query(collection(db, 'budgets'), where("userId", "==", currentUser.id));
        const budgetsSnapshot = await getDocs(userBudgetsQuery);
        const fetchedBudgets = budgetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
        setBudgets(fetchedBudgets);

    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Dashboard Calculations (no change needed here) ---
  const totalBalance = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'Income' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'Expense' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const highestBalanceAccount = useMemo(() => accounts.length > 0 ? [...accounts].sort((a, b) => b.balance - a.balance)[0] : null, [accounts]);

  // --- CRUD Handlers ---

  // Accounts
  const handleAddAccount = async (accountData: AccountFormData) => {
    const newAccountData = { userId: currentUser.id, ...accountData };
    const docRef = await addDoc(collection(db, "accounts"), newAccountData);
    setAccounts(prev => [...prev, { id: docRef.id, ...newAccountData }]);
  };
  
  const handleUpdateAccount = async (updatedAccount: Account) => {
    const accountRef = doc(db, "accounts", updatedAccount.id);
    await updateDoc(accountRef, updatedAccount);
    setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
  };
  
  const handleDeleteAccount = async (accountId: string) => {
    // In a real app, you must handle associated transactions. For simplicity, we delete them.
    const batch = writeBatch(db);
    const accountRef = doc(db, "accounts", accountId);
    batch.delete(accountRef);
    
    const associatedTransactionsQuery = query(collection(db, "transactions"), where("accountId", "==", accountId));
    const snapshot = await getDocs(associatedTransactionsQuery);
    snapshot.forEach(doc => batch.delete(doc.ref));

    await batch.commit();

    setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    setTransactions(prev => prev.filter(t => t.accountId !== accountId));
  };
  
  // Transactions
  const updateAccountBalanceInDb = async (accountId: string, amount: number) => {
      const accountRef = doc(db, "accounts", accountId);
      const account = accounts.find(a => a.id === accountId);
      if (account) {
          const newBalance = account.balance + amount;
          await updateDoc(accountRef, { balance: newBalance });
          return newBalance;
      }
      return null;
  };
  
  const updateAccountBalanceInState = (accountId: string, newBalance: number) => {
      setAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, balance: newBalance } : acc));
  };

  const handleAddTransaction = async (transactionData: TransactionFormData) => {
      const newTransactionData = { userId: currentUser.id, ...transactionData };
      const docRef = await addDoc(collection(db, "transactions"), newTransactionData);
      setTransactions(prev => [...prev, { id: docRef.id, ...newTransactionData }]);

      // Update balances
      if (transactionData.type === TransactionType.INCOME) {
          const newBalance = await updateAccountBalanceInDb(transactionData.accountId, transactionData.amount);
          if (newBalance !== null) updateAccountBalanceInState(transactionData.accountId, newBalance);
      } else if (transactionData.type === TransactionType.EXPENSE) {
          const newBalance = await updateAccountBalanceInDb(transactionData.accountId, -transactionData.amount);
          if (newBalance !== null) updateAccountBalanceInState(transactionData.accountId, newBalance);
      } else if (transactionData.type === TransactionType.TRANSFER && transactionData.toAccountId) {
          const fromBalance = await updateAccountBalanceInDb(transactionData.accountId, -transactionData.amount);
          const toBalance = await updateAccountBalanceInDb(transactionData.toAccountId, transactionData.amount);
          if (fromBalance !== null) updateAccountBalanceInState(transactionData.accountId, fromBalance);
          if (toBalance !== null) updateAccountBalanceInState(transactionData.toAccountId, toBalance);
      }
  };

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
      const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
      if (!originalTransaction) return;

      const transactionRef = doc(db, "transactions", updatedTransaction.id);
      await updateDoc(transactionRef, updatedTransaction);
      setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));

      // Re-fetch all data to ensure balances are consistent.
      // A more optimized approach would calculate the balance diffs, but this is safer.
      await fetchData();
  };
  
  const handleDeleteTransaction = async (transactionId: string) => {
      const transactionToDelete = transactions.find(t => t.id === transactionId);
      if (!transactionToDelete) return;
      
      await deleteDoc(doc(db, "transactions", transactionId));
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      
      // Revert balance changes
      if (transactionToDelete.type === TransactionType.INCOME) {
          const newBalance = await updateAccountBalanceInDb(transactionToDelete.accountId, -transactionToDelete.amount);
          if (newBalance !== null) updateAccountBalanceInState(transactionToDelete.accountId, newBalance);
      } else if (transactionToDelete.type === TransactionType.EXPENSE) {
          const newBalance = await updateAccountBalanceInDb(transactionToDelete.accountId, transactionToDelete.amount);
          if (newBalance !== null) updateAccountBalanceInState(transactionToDelete.accountId, newBalance);
      } else if (transactionToDelete.type === TransactionType.TRANSFER && transactionToDelete.toAccountId) {
          const fromBalance = await updateAccountBalanceInDb(transactionToDelete.accountId, transactionToDelete.amount);
          const toBalance = await updateAccountBalanceInDb(transactionToDelete.toAccountId, -transactionToDelete.amount);
          if (fromBalance !== null) updateAccountBalanceInState(transactionToDelete.accountId, fromBalance);
          if (toBalance !== null) updateAccountBalanceInState(transactionToDelete.toAccountId, toBalance);
      }
  };


  // Budgets
  const handleAddBudget = async (budgetData: BudgetFormData) => {
    const newBudgetData = { userId: currentUser.id, ...budgetData };
    const docRef = await addDoc(collection(db, "budgets"), newBudgetData);
    setBudgets(prev => [...prev, { id: docRef.id, ...newBudgetData }]);
  };
  
  const handleUpdateBudget = async (updatedBudget: Budget) => {
    const budgetRef = doc(db, "budgets", updatedBudget.id);
    await updateDoc(budgetRef, updatedBudget);
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  };
  
  const handleDeleteBudget = async (budgetId: string) => {
    await deleteDoc(doc(db, "budgets", budgetId));
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
  };

  useEffect(() => {
    const fetchFact = async () => {
      try {
        if (!process.env.API_KEY) return;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Tell me one interesting and surprising fact about personal finance or money in a single short sentence.',
        });
        setFinancialFact(response.text);
      } catch (error) {
        console.error("Error fetching financial fact:", error);
      }
    };
    fetchFact();
  }, []);

  const renderContent = () => {
    if (isLoading) {
        return <div className="text-center p-10">Loading your financial data...</div>;
    }
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Total Balance" amount={totalBalance} icon="Wallet" color="bg-primary" details={highestBalanceAccount ? `Main: ${highestBalanceAccount.name}` : ''} />
                <SummaryCard title="This Month's Income" amount={totalIncome} icon="TrendingUp" color="bg-secondary" />
                <SummaryCard title="This Month's Expense" amount={totalExpense} icon="TrendingDown" color="bg-red-500" />
                <SummaryCard title="Accounts" amount={accounts.length} icon="Landmark" color="bg-accent" />
            </div>
            {financialFact && <div className="bg-card p-6 rounded-lg shadow-sm flex items-center space-x-4">
              <div className="bg-indigo-100 text-primary p-3 rounded-full"><Icon name="Sparkles" /></div>
              <div>
                <h3 className="font-semibold text-text-primary">Financial Fact</h3>
                <p className="text-text-secondary text-sm">{financialFact}</p>
              </div>
            </div>}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2"><ExpenseChart transactions={transactions} categories={categories} /></div>
              <div><BudgetOverview budgets={budgets} transactions={transactions} categories={categories} /></div>
            </div>
            <div>
              <RecentTransactions transactions={[...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)} accounts={accounts} categories={categories} />
            </div>
          </div>
        );
      case 'accounts':
        return <AccountsView accounts={accounts} onAddAccount={handleAddAccount} onUpdateAccount={handleUpdateAccount} onDeleteAccount={handleDeleteAccount}/>;
      case 'transactions':
        return <TransactionsView transactions={transactions} accounts={accounts} categories={categories} onAddTransaction={handleAddTransaction} onUpdateTransaction={handleUpdateTransaction} onDeleteTransaction={handleDeleteTransaction}/>;
      case 'budgets':
        return <BudgetsView budgets={budgets} categories={categories} transactions={transactions} onAddBudget={handleAddBudget} onUpdateBudget={handleUpdateBudget} onDeleteBudget={handleDeleteBudget}/>;
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
