import { LieferandoOrder, LieferandoCredentials } from '../types/lieferando';
import { useStore } from '../store';

class LieferandoAPI {
  private credentials: LieferandoCredentials;
  private pollingInterval: number = 30000; // 30 seconds
  private intervalId?: NodeJS.Timeout;

  constructor(credentials: LieferandoCredentials) {
    this.credentials = credentials;
  }

  private async fetchOrders(): Promise<LieferandoOrder[]> {
    try {
      const response = await fetch(`${this.credentials.apiUrl}/orders`, {
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Restaurant-ID': this.credentials.restaurantId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Lieferando orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Lieferando orders:', error);
      return [];
    }
  }

  private async updateOrderStatus(orderId: string, status: LieferandoOrder['status']): Promise<boolean> {
    try {
      const response = await fetch(`${this.credentials.apiUrl}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Restaurant-ID': this.credentials.restaurantId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  public startPolling() {
    this.stopPolling(); // Clear any existing interval
    this.intervalId = setInterval(async () => {
      const orders = await this.fetchOrders();
      const store = useStore.getState();
      
      // Process new orders
      orders.forEach(order => {
        if (order.status === 'new') {
          // Convert Lieferando order to POS order format
          const posOrder = {
            id: `lieferando_${order.id}`,
            items: order.items.map(item => ({
              product: {
                id: item.id,
                name: item.name,
                price: item.price,
                category: 'mains', // Default category
                image: '', // No image from Lieferando
                inStock: true,
                taxRate: 19 // Default tax rate for delivery
              },
              quantity: item.quantity
            })),
            total: order.payment.total,
            status: 'pending',
            timestamp: order.orderTime,
            paymentMethod: order.payment.method === 'online' ? 'card' : 'cash',
            isDelivery: true,
            deliveryInfo: {
              customer: order.customer,
              deliveryTime: order.deliveryTime,
              notes: order.notes
            }
          };

          // Add to store
          store.addDeliveryOrder(posOrder);
          
          // Update Lieferando status to accepted
          this.updateOrderStatus(order.id, 'accepted');
        }
      });
    }, this.pollingInterval);
  }

  public stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

export const createLieferandoAPI = (credentials: LieferandoCredentials) => {
  return new LieferandoAPI(credentials);
};