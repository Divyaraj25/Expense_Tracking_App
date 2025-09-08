import type { User, Account, Transaction, Budget, Category } from './types';
import { AccountType, TransactionType, BudgetPeriod } from './types';

export const USERS: User[] = [
  { id: 'user1', name: 'Alex Doe', email: 'alex@example.com' },
  { id: 'user2', name: 'John Doe (Dad)', email: 'john@example.com' },
];

export const CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Groceries', icon: 'ShoppingCart' },
  { id: 'cat2', name: 'Salary', icon: 'Briefcase' },
  { id: 'cat3', name: 'Utilities', icon: 'Lightbulb' },
  { id: 'cat4', name: 'Rent', icon: 'Home' },
  { id: 'cat5', name: 'Transport', icon: 'Car' },
  { id: 'cat6', name: 'Entertainment', icon: 'Ticket' },
  { id: 'cat7', name: 'Healthcare', icon: 'HeartPulse' },
  { id: 'cat8', name: 'Savings', icon: 'PiggyBank' },
  { id: 'cat9', name: 'Other', icon: 'HelpCircle' },
];

export const ACCOUNTS: Account[] = [
  { id: 'acc1', userId: 'user1', name: 'Checking Account', type: AccountType.BANK, balance: 5000, bankName: 'Global Bank', last4Digits: '1234', isSharedWith: ['user2'] },
  { id: 'acc2', userId: 'user1', name: 'Visa Credit', type: AccountType.CREDIT_CARD, balance: -500, last4Digits: '5678' },
  { id: 'acc3', userId: 'user1', name: 'Cash Wallet', type: AccountType.CASH, balance: 300 },
  { id: 'acc4', userId: 'user2', name: 'Main Savings', type: AccountType.BANK, balance: 25000, bankName: 'National Bank', last4Digits: '1111' },
  { id: 'acc5', userId: 'user2', name: 'Emergency Fund', type: AccountType.CASH, balance: 1500 },
];

export const TRANSACTIONS: Transaction[] = [
  { id: 'txn1', userId: 'user1', accountId: 'acc1', type: TransactionType.INCOME, amount: 2500, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Monthly Salary', categoryId: 'cat2' },
  { id: 'txn2', userId: 'user1', accountId: 'acc1', type: TransactionType.EXPENSE, amount: 80, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Weekly Groceries', categoryId: 'cat1' },
  { id: 'txn3', userId: 'user1', accountId: 'acc2', type: TransactionType.EXPENSE, amount: 45, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), description: 'Movie Tickets', categoryId: 'cat6' },
  { id: 'txn4', userId: 'user1', accountId: 'acc1', type: TransactionType.EXPENSE, amount: 1200, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Rent Payment', categoryId: 'cat4' },
  { id: 'txn5', userId: 'user1', accountId: 'acc1', type: TransactionType.TRANSFER, amount: 100, date: new Date().toISOString(), description: 'Move to cash', categoryId: 'cat9', toAccountId: 'acc3'},
  { id: 'txn6', userId: 'user2', accountId: 'acc4', type: TransactionType.EXPENSE, amount: 200, date: new Date().toISOString(), description: 'Utility Bill', categoryId: 'cat3' },
  // Last month's data for comparison
  { id: 'txn7', userId: 'user1', accountId: 'acc1', type: TransactionType.INCOME, amount: 2400, date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), description: 'Last Month Salary', categoryId: 'cat2' },
  { id: 'txn8', userId: 'user1', accountId: 'acc1', type: TransactionType.EXPENSE, amount: 1300, date: new Date(new Date().setMonth(new Date().getMonth() - 1, 15)).toISOString(), description: 'Last Month Bills', categoryId: 'cat3' },
  { id: 'txn9', userId: 'user1', accountId: 'acc2', type: TransactionType.EXPENSE, amount: 150, date: new Date(new Date().setMonth(new Date().getMonth() - 1, 20)).toISOString(), description: 'Last Month Entertainment', categoryId: 'cat6' },
];

export const BUDGETS: Budget[] = [
  { id: 'bud1', userId: 'user1', categoryId: 'cat1', amount: 400, period: BudgetPeriod.MONTHLY, startDate: new Date(new Date().setDate(1)).toISOString() },
  { id: 'bud2', userId: 'user1', categoryId: 'cat6', amount: 150, period: BudgetPeriod.MONTHLY, startDate: new Date(new Date().setDate(1)).toISOString() },
  { id: 'bud3', userId: 'user1', categoryId: 'cat5', amount: 100, period: BudgetPeriod.WEEKLY, startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString()},
  // Upcoming budget
  { id: 'bud4', userId: 'user1', categoryId: 'cat1', amount: 450, period: BudgetPeriod.MONTHLY, startDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString() },
];