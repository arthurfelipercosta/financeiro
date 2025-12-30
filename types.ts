
export type TransactionType = 'INCOME' | 'EXPENSE' | 'SAVINGS';

export type PaymentMethod = 'DEBIT' | 'CREDIT' | 'PIX' | 'CASH' | 'BOLETO' | 'TRANSFER' | 'CARD';

export type CardType = 'DEBIT' | 'CREDIT' | 'BOTH';

export interface Category {
  id: string;
  name: string;
}

export interface Card {
  id: string;
  name: string;
  personId: string;
  type: CardType;
  lastDigits?: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO format
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod;
  cardId?: string; // Optional link to a registered card
  isPaid: boolean;
  personId: string;
  installmentsId?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  isFixed?: boolean; // Identifica se é um gasto recorrente mensal
}

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface FirebaseFullConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface CloudConfig {
  fullConfig?: FirebaseFullConfig;
  familySecret: string;
  enabled: boolean;
}

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pendingExpense: number;
  totalSavings: number;
}
