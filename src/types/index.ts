export type UserRole = 'user' | 'admin' | 'ADMIN' | 'CUSTOMER' | 'AGENT';

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  role: UserRole;
  isVerified?: boolean;
  isSuspended?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  adminId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
}

export interface Bill {
  id: string;
  userId: string;
  type: 'electricity' | 'water' | 'internet';
  provider: string;
  amount: number;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface DataPlan {
  id: string;
  network: string;
  planType: 'daily' | 'weekly' | 'monthly';
  volume: string; // e.g., "1GB", "100MB"
  price: number;
  validity: number; // in days
  code: string;
}
