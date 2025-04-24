import { create } from 'zustand';
import { Product, Customer, Order, Settings, Table } from './types';
import { initialProducts } from './data/initialProducts';
import { defaultSettings } from './store/defaultSettings';

// Initial tables
const initialTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: (i + 1).toString(),
  name: (i + 1).toString(),
  occupied: false,
  currentOrder: null
}));

interface StoreState {
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

  // Tables
  tables: Table[];
  selectedTable: Table | null;
  selectTable: (tableId: string | null) => void;
  occupyTable: (tableId: string, order: Order) => void;
  clearTable: (tableId: string) => void;

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
  // Authentication
  currentUser: null,
  isAuthenticated: () => get().currentUser !== null,
  isAdmin: () => get().currentUser?.role === 'admin',
  login: async (username, password) => {
    if (username === 'admin' && password === 'password') {
      set({ currentUser: { username: 'admin', role: 'admin' } });
      return true;
    } else if (username === 'employee' && password === 'password') {
      set({ currentUser: { username: 'employee', role: 'employee' } });
      return true;
    }
    return false;
  },
  logout: () => set({ currentUser: null }),

  // Products
  products: initialProducts,
  addProduct: (product) => set(state => ({
    products: [...state.products, { ...product, id: Date.now().toString() }]
  })),
  updateProduct: (id, product) => set(state => ({
    products: state.products.map(p => p.id === id ? { ...p, ...product } : p)
  })),
  deleteProduct: (id) => set(state => ({
    products: state.products.filter(p => p.id !== id)
  })),

  // Orders
  orders: [],
  currentOrder: [],
  addToOrder: (product) => set(state => {
    const existingItem = state.currentOrder.find(item => item.product.id === product.id);
    if (existingItem) {
      return {
        currentOrder: state.currentOrder.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }
    return {
      currentOrder: [...state.currentOrder, { product, quantity: 1 }]
    };
  }),
  updateQuantity: (productId, quantity) => set(state => ({
    currentOrder: quantity > 0
      ? state.currentOrder.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      : state.currentOrder.filter(item => item.product.id !== productId)
  })),
  removeFromOrder: (productId) => set(state => ({
    currentOrder: state.currentOrder.filter(item => item.product.id !== productId)
  })),
  clearOrder: () => set({ currentOrder: [] }),
  setCurrentOrder: (items) => set({ currentOrder: items }),
  completeOrder: (paymentMethod, cashReceived) => set(state => {
    const order: Order = {
      id: Date.now().toString(),
      items: state.currentOrder,
      total: state.currentOrder.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      status: 'completed',
      timestamp: new Date().toISOString(),
      paymentMethod,
      cashReceived,
      tableId: state.selectedTable?.id
    };

    if (order.tableId) {
      get().clearTable(order.tableId);
    }

    return {
      orders: [...state.orders, order],
      currentOrder: [],
      tseTransactions: [...state.tseTransactions, {
        id: Date.now().toString(),
        orderId: order.id,
        timestamp: order.timestamp,
        signature: `TSE-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
        total: order.total
      }]
    };
  }),
  cancelOrder: (orderId) => set(state => ({
    orders: state.orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'cancelled' }
        : order
    )
  })),

  // Tables
  tables: initialTables,
  selectedTable: null,
  selectTable: (tableId) => {
    const state = get();
    const currentOrder = state.currentOrder;
    const previousTable = state.selectedTable;

    // If there's a current order and we're switching tables
    if (currentOrder.length > 0) {
      // If we had a previous table selected, save the order there
      if (previousTable) {
        const order: Order = {
          id: Date.now().toString(),
          items: currentOrder,
          total: currentOrder.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
          status: 'pending',
          timestamp: new Date().toISOString(),
          paymentMethod: 'cash',
          tableId: previousTable.id
        };
        state.occupyTable(previousTable.id, order);
      } else {
        // If no previous table, this is a takeaway order
        const order: Order = {
          id: `takeaway_${Date.now()}`,
          items: currentOrder,
          total: currentOrder.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
          status: 'pending',
          timestamp: new Date().toISOString(),
          paymentMethod: 'cash',
          isTakeaway: true
        };
        set(state => ({ orders: [...state.orders, order] }));
      }
      // Clear the current order after saving it
      state.clearOrder();
    }

    // Now select the new table
    set(state => ({
      selectedTable: tableId ? state.tables.find(t => t.id === tableId) || null : null
    }));

    // If the new table has an order, load it
    const newTable = get().tables.find(t => t.id === tableId);
    if (newTable?.currentOrder) {
      state.setCurrentOrder(newTable.currentOrder.items);
    }
  },
  occupyTable: (tableId, order) => set(state => ({
    tables: state.tables.map(table =>
      table.id === tableId
        ? { ...table, occupied: true, currentOrder: order }
        : table
    )
  })),
  clearTable: (tableId) => set(state => ({
    tables: state.tables.map(table =>
      table.id === tableId
        ? { ...table, occupied: false, currentOrder: null }
        : table
    ),
    selectedTable: null
  })),

  // Settings
  settings: defaultSettings,
  updateSettings: (newSettings) => set(state => ({
    settings: { ...state.settings, ...newSettings }
  })),

  // TSE Transactions
  tseTransactions: []
}));