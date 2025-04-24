export interface LieferandoOrder {
  id: string;
  restaurantId: string;
  orderTime: string;
  deliveryTime: string;
  status: 'new' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  customer: {
    name: string;
    phone: string;
    email: string;
    address: {
      street: string;
      houseNumber: string;
      postalCode: string;
      city: string;
      floor?: string;
      doorbell?: string;
    };
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
    options?: Array<{
      name: string;
      price: number;
    }>;
  }>;
  payment: {
    method: 'online' | 'cash';
    total: number;
    deliveryFee: number;
    tip?: number;
  };
  notes?: string;
}

export interface LieferandoCredentials {
  apiKey: string;
  restaurantId: string;
  apiUrl: string;
}