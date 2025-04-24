import { create } from 'zustand';
import { createTableSlice, TableSlice } from './tableSlice';
import { Product, Order, Settings } from '../types';
import { initialProducts } from '../data/initialProducts';
import { defaultSettings } from './defaultSettings';

interface StoreState extends TableSlice {
  // Authentication
  currentUser: { username: string; role: string } | null;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Orders
  orders: Order[];
  currentOrder: Array<{ product: Product; quantity: number }>;
  addToOrder: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromOrder: (productId: string) => void;
  clearOrder: () => void;
  setCurrentOrder: (items: Array<{ product: Product; quantity: number }>) => void;
  completeOrder: (paymentMethod: 'cash' | 'card', cashReceived?: number) => void;
  cancelOrder: (orderId: string) => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;

  // TSE Transactions
  tseTransactions: Array<{
    id: string;
    orderId: string;
    timestamp: string;
    signature: string;
    total: number;
  }>;
}

export const useStore = create<StoreState>((set, get) => ({
  ...createTableSlice(set, get),

  // Rest of the store implementation...
  // Copy the existing implementation from store.ts but remove the table-related code
  // as it's now in the tableSlice
}));