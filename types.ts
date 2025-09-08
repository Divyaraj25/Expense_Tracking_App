
export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  TRANSFER = 'Transfer',
}

export enum AccountType {
  BANK = 'Bank Account',
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
  CASH = 'Cash',
}

export enum BudgetPeriod {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly',
  CUSTOM = 'Custom',
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  last4Digits?: string;
  bankName?: string;
  isSharedWith?: string[]; // Array of user IDs this account is shared with
}
export type AccountFormData = Omit<Account, 'id' | 'userId' | 'isSharedWith'>;


export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO string
  description: string;
  categoryId: string;
  toAccountId?: string; // For transfers
}
export type TransactionFormData = Omit<Transaction, 'id' | 'userId'>;

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string; // ISO string
  endDate?: string; // For custom period
}
export type BudgetFormData = Omit<Budget, 'id' | 'userId'>;


export interface User {
  id: string; // Corresponds to Firebase UID
  name: string;
  email: string;
}
