export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'mains' | 'sides' | 'drinks';
  image: string;
  description?: string;
  inStock: boolean;
  taxRate: 7 | 19;
}

export interface TaxSettings {
  indoor: {
    food: number;
    drinks: number;
  };
  outdoor: {
    food: number;
    drinks: number;
  };
}

export interface Settings {
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after';
  };
  language: string;
  timezone: string;
  tse: {
    apiKey: string;
    deviceId: string;
    environment: 'production' | 'test';
  };
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
  };
  receipt: {
    header: string;
    footer: string;
    showLogo: boolean;
  };
  tax: TaxSettings;
  modules: {
    tse: boolean;
    customers: boolean;
  };
  lieferando?: {
    apiKey: string;
    restaurantId: string;
    apiUrl: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  lastVisit: string;
}

export interface Order {
  id: string;
  items: Array<{ 
    product: Product; 
    quantity: number;
    note?: string;
  }>;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  timestamp: string;
  paymentMethod: 'cash' | 'card';
  cashReceived?: number;
  tseSignature?: string;
  tableId?: string;
  note?: string;
}

export interface Table {
  id: string;
  name: string;
  occupied: boolean;
  currentOrder: Order | null;
}

export interface DailySales {
  date: string;
  total: number;
  orders: number;
}

export interface CategorySales {
  category: string;
  total: number;
  quantity: number;
}