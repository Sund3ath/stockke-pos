import { create } from 'zustand';
import { Product, Customer, Order, Settings, Table } from './types';
import { initialProducts } from './data/initialProducts';
import { defaultSettings } from './store/defaultSettings';
import { isAuthenticated, logout as apiLogout } from './api/auth';
import {
  fetchProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct
} from './api/apolloClient';
import { createOrder as apiCreateOrder, updateOrder as apiUpdateOrder, fetchOrders } from './api/orders';
import { updateSettings as apiUpdateSettings, fetchSettings } from './api/settings';

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
  initUser: () => boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Products
  products: Product[];
  loadProducts: () => Promise<void>;
  loadOrders: () => Promise<void>;
  loadSettings: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;

  // Orders
  orders: Order[];
  currentOrder: Array<{ product: Product; quantity: number }>;
  addToOrder: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromOrder: (productId: string) => void;
  clearOrder: () => void;
  setCurrentOrder: (items: Array<{ product: Product; quantity: number }>) => void;
  completeOrder: (paymentMethod: 'cash' | 'card', cashReceived?: number) => Promise<void>;
  cancelOrder: (orderId: string) => void;

  // Tables
  tables: Table[];
  selectedTable: Table | null;
  selectTable: (tableId: string | null) => Promise<void>;
  occupyTable: (tableId: string, order: Order) => Promise<void>;
  clearTable: (tableId: string) => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => Promise<boolean>;

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
  isAuthenticated: () => isAuthenticated(),
  isAdmin: () => get().currentUser?.role === 'ADMIN',
  initUser: () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode the JWT token to get user information
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        set({
          currentUser: {
            username: decodedToken.username,
            role: decodedToken.role
          }
        });
        return true;
      } catch (error) {
        console.error('Error decoding token:', error);
        return false;
      }
    }
    return false;
  },
  login: async (username, password) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decode the JWT token to get user information
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const decodedToken = JSON.parse(jsonPayload);
          set({
            currentUser: {
              username: decodedToken.username,
              role: decodedToken.role
            }
          });
          return true;
        } catch (error) {
          console.error('Error decoding token:', error);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },
  logout: () => {
    apiLogout(); // API-Logout-Funktion aufrufen, um den Token zu entfernen
    set({ currentUser: null });
  },

  // Products
  products: [], // Leere Liste statt initialProducts
  loadProducts: async () => {
    try {
      const products = await fetchProducts();
      set({ products });
    } catch (error) {
      console.error('Error loading products:', error);
    }
  },
  
  // Einstellungen laden
  loadSettings: async () => {
    try {
      const settings = await fetchSettings();
      if (settings) {
        set({ settings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },
  
  // Bestellungen laden und Tische aktualisieren
  loadOrders: async () => {
    try {
      const orders = await fetchOrders();
      
      // Speichere alle Bestellungen im Store
      set({ orders });
      
      // Geparkten oder ausstehenden Bestellungen den Tischen zuordnen
      const parkedOrders = orders.filter(order => (order.status === 'parked' || order.status === 'pending') && order.tableId);
      
      if (parkedOrders.length > 0) {
        set(state => ({
          tables: state.tables.map(table => {
            // Finde eine geparkte Bestellung für diesen Tisch
            // Stelle sicher, dass beide Werte als Strings verglichen werden
            const parkedOrder = parkedOrders.find(order => String(order.tableId) === String(table.id));
            
            if (parkedOrder) {
              return {
                ...table,
                occupied: true,
                currentOrder: parkedOrder
              };
            }
            
            return table;
          })
        }));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  },
  addProduct: async (product) => {
    try {
      const newProduct = await apiCreateProduct(product);
      if (newProduct) {
        // Aktualisiere den Store mit dem neuen Produkt
        set(state => ({
          products: [...state.products, newProduct]
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding product:', error);
      return false;
    }
  },
  updateProduct: async (id, product) => {
    try {
      const updatedProduct = await apiUpdateProduct(id, product);
      if (updatedProduct) {
        // Aktualisiere den Store mit dem aktualisierten Produkt
        set(state => ({
          products: state.products.map(p => p.id === id ? updatedProduct : p)
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  },
  deleteProduct: async (id) => {
    try {
      const success = await apiDeleteProduct(id);
      if (success) {
        // Entferne das Produkt aus dem Store
        set(state => ({
          products: state.products.filter(p => p.id !== id)
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  },

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
  completeOrder: async (paymentMethod: 'cash' | 'card', cashReceived?: number) => {
    const { currentOrder, selectedTable } = get();
    
    if (currentOrder.length === 0) {
      throw new Error('Keine Artikel in der Bestellung');
    }
    
    try {
      // Berechne den Gesamtbetrag
      const total = currentOrder.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      
      // Wenn ein Tisch ausgewählt ist und eine Bestellung hat, aktualisiere diese
      if (selectedTable?.currentOrder?.id) {
        // Aktualisiere die bestehende Bestellung
        const order = await apiUpdateOrder(selectedTable.currentOrder.id, {
          items: currentOrder.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            taxRate: item.product.taxRate
          })),
          total,
          status: 'completed',
          paymentMethod,
          cashReceived,
          tableId: selectedTable.id
        });
        
        if (order) {
          // Tisch freigeben
          await get().clearTable(selectedTable.id);
          
          // Bestellung zurücksetzen
          set({ currentOrder: [] });
          
          // TSE-Transaktion erstellen
          const tseTransaction = {
            id: Date.now().toString(),
            orderId: order.id,
            timestamp: order.timestamp,
            signature: `TSE-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
            total: order.total
          };
          
          // Store aktualisieren
          set(state => ({
            tseTransactions: [...state.tseTransactions, tseTransaction]
          }));
        }
      } else {
        // Erstelle eine neue Bestellung
        const order = await apiCreateOrder({
          items: currentOrder.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            taxRate: item.product.taxRate
          })),
          total,
          status: 'completed',
          paymentMethod,
          cashReceived,
          tableId: selectedTable?.id
        });
        
        if (order) {
          // Wenn ein Tisch ausgewählt ist, räume ihn auf
          if (selectedTable) {
            await get().clearTable(selectedTable.id);
          }
          
          // Bestellung zurücksetzen
          set({ currentOrder: [] });
          
          // TSE-Transaktion erstellen
          const tseTransaction = {
            id: Date.now().toString(),
            orderId: order.id,
            timestamp: order.timestamp,
            signature: `TSE-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
            total: order.total
          };
          
          // Store aktualisieren
          set(state => ({
            tseTransactions: [...state.tseTransactions, tseTransaction]
          }));
        }
      }
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  },
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
  selectTable: async (tableId) => {
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
        try {
          await state.occupyTable(previousTable.id, order);
        } catch (error) {
          console.error('Fehler beim Speichern der Tischbestellung:', error);
        }
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
      selectedTable: tableId ? state.tables.find(t => String(t.id) === String(tableId)) || null : null
    }));

    // If the new table has an order, load it
    const newTable = get().tables.find(t => String(t.id) === String(tableId));
    if (newTable?.currentOrder) {
      // If there's an existing order, update it instead of creating a new one
      const existingOrder = newTable.currentOrder;
      state.setCurrentOrder(existingOrder.items);
    }
  },
  occupyTable: async (tableId, order) => {
    const state = get();
    
    try {
      // Bestelldaten für die API vorbereiten
      const orderInput = {
        items: order.items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          taxRate: item.product.taxRate || 19
        })),
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        tableId: tableId
      };
      
      // Prüfen, ob es eine existierende Bestellung gibt
      const existingOrder = state.tables.find(t => String(t.id) === String(tableId))?.currentOrder;
      
      let updatedOrder;
      if (existingOrder) {
        // Bestellung aktualisieren
        updatedOrder = await apiUpdateOrder(existingOrder.id, orderInput);
      } else {
        // Neue Bestellung erstellen
        updatedOrder = await apiCreateOrder(orderInput);
      }
      
      if (updatedOrder) {
        console.log('Tischbestellung erfolgreich in der Datenbank gespeichert:', updatedOrder);
        
        // Store aktualisieren
        set(state => ({
          tables: state.tables.map(table =>
            String(table.id) === String(tableId)
              ? { ...table, occupied: true, currentOrder: updatedOrder }
              : table
          ),
          orders: existingOrder 
            ? state.orders.map(o => o.id === existingOrder.id ? updatedOrder : o)
            : [...state.orders, updatedOrder]
        }));
      } else {
        console.error('Fehler beim Speichern der Tischbestellung in der Datenbank');
        
        // Fallback: Nur lokalen Zustand aktualisieren
        set(state => ({
          tables: state.tables.map(table =>
            String(table.id) === String(tableId)
              ? { ...table, occupied: true, currentOrder: order }
              : table
          )
        }));
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Tischbestellung:', error);
      
      // Fallback: Nur lokalen Zustand aktualisieren
      set(state => ({
        tables: state.tables.map(table =>
          table.id === tableId
            ? { ...table, occupied: true, currentOrder: order }
            : table
        )
      }));
    }
  },
  clearTable: (tableId) => set(state => ({
    tables: state.tables.map(table =>
      String(table.id) === String(tableId)
        ? { ...table, occupied: false, currentOrder: null }
        : table
    ),
    selectedTable: null
  })),

  // Settings
  settings: defaultSettings,
  updateSettings: async (newSettings) => {
    try {
      // Einstellungen in der Datenbank aktualisieren
      const updatedSettings = await apiUpdateSettings(newSettings);
      
      if (updatedSettings) {
        // Lokalen Zustand aktualisieren
        set({ settings: updatedSettings });
        return true;
      } else {
        // Fallback: Nur lokalen Zustand aktualisieren
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
        return false;
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Einstellungen:', error);
      
      // Fallback: Nur lokalen Zustand aktualisieren
      set(state => ({
        settings: { ...state.settings, ...newSettings }
      }));
      return false;
    }
  },

  // TSE Transactions
  tseTransactions: []
}));