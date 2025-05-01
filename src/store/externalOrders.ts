import { create } from 'zustand';
import { getExternalOrdersByUserId, updateExternalOrderStatus } from '../api/orders';

interface ExternalOrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface ExternalOrder {
  id: string;
  items: ExternalOrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  customerNote?: string;
}

interface ExternalOrdersStore {
  externalOrders: ExternalOrder[];
  loadExternalOrders: () => Promise<void>;
  updateExternalOrderStatus: (orderId: string, status: 'completed' | 'cancelled') => Promise<void>;
}

export const useExternalOrdersStore = create<ExternalOrdersStore>((set, get) => ({
  externalOrders: [],
  loadExternalOrders: async () => {
    try {
      // Get the user ID from localStorage token
      const token = localStorage.getItem('token');
      if (!token) return;

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decodedToken = JSON.parse(jsonPayload);
      const userId = decodedToken.id;
      
      // Save userId for later use in API calls
      localStorage.setItem('userId', userId);

      const orders = await getExternalOrdersByUserId(userId);
      set({ externalOrders: orders });
    } catch (error) {
      console.error('Error loading external orders:', error);
    }
  },
  updateExternalOrderStatus: async (orderId: string, status: 'completed' | 'cancelled') => {
    try {
      // Convert status to enum format expected by the API
      const apiStatus = status.toUpperCase() as 'COMPLETED' | 'CANCELLED';
      await updateExternalOrderStatus(orderId, apiStatus);
      
      // Refresh orders after update
      const store = get();
      await store.loadExternalOrders();
    } catch (error) {
      console.error('Error updating external order status:', error);
    }
  }
})); 