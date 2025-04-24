import { gql } from '@apollo/client';
import { apolloClient } from './apollo';
import { Order, Product } from '../types';

// API-Bestellungstypen
export interface ApiOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  taxRate: number;
}

export interface ApiOrder {
  id: string;
  items: ApiOrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled' | 'parked';
  timestamp: string;
  paymentMethod: string;
  cashReceived?: number;
  tableId?: string;
  createdAt: string;
  updatedAt: string;
}

// Konvertierungsfunktion von API-Bestellung zu Frontend-Bestellung
export const convertApiOrderToOrder = (apiOrder: ApiOrder): Order => {
  return {
    id: apiOrder.id,
    items: apiOrder.items.map(item => ({
      product: {
        id: item.productId,
        name: item.productName,
        price: item.price,
        category: 'mains' as const, // Standard-Kategorie
        image: '',
        inStock: true,
        taxRate: item.taxRate as 7 | 19
      },
      quantity: item.quantity
    })),
    total: apiOrder.total,
    status: apiOrder.status,
    timestamp: apiOrder.timestamp,
    paymentMethod: apiOrder.paymentMethod as 'cash' | 'card',
    cashReceived: apiOrder.cashReceived,
    tableId: apiOrder.tableId
  };
};

// GraphQL-Dokumente
const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      items {
        id
        productId
        productName
        quantity
        price
        taxRate
      }
      total
      status
      timestamp
      paymentMethod
      cashReceived
      tableId
      createdAt
      updatedAt
    }
  }
`;

const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      items {
        id
        productId
        productName
        quantity
        price
        taxRate
      }
      total
      status
      timestamp
      paymentMethod
      cashReceived
      tableId
      createdAt
      updatedAt
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      items {
        id
        productId
        productName
        quantity
        price
        taxRate
      }
      total
      status
      timestamp
      paymentMethod
      cashReceived
      tableId
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_ORDER = gql`
  mutation UpdateOrder($id: ID!, $input: UpdateOrderInput!) {
    updateOrder(id: $id, input: $input) {
      id
      items {
        id
        productId
        productName
        quantity
        price
        taxRate
      }
      total
      status
      timestamp
      paymentMethod
      cashReceived
      tableId
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const GET_DAILY_SALES = gql`
  query GetDailySales($date: String!) {
    dailySales(date: $date) {
      date
      total
      orderCount
      items {
        productId
        productName
        quantity
        total
        taxRate
      }
    }
  }
`;

interface OrdersQueryResult {
  orders: ApiOrder[];
}

// Direkte Client-Methoden
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const { data } = await apolloClient.query({
      query: GET_ORDERS,
      fetchPolicy: 'network-only'
    });
    
    // Konvertiere API-Bestellungen zu Frontend-Bestellungen
    return data.orders.map((apiOrder: ApiOrder) => convertApiOrderToOrder(apiOrder));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const fetchOrder = async (id: string): Promise<Order | null> => {
  try {
    const { data } = await apolloClient.query({
      query: GET_ORDER,
      variables: { id },
      fetchPolicy: 'network-only'
    });
    
    if (data.order) {
      return convertApiOrderToOrder(data.order as ApiOrder);
    }
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

export const createOrder = async (input: any): Promise<Order | null> => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_ORDER,
      variables: { input },
      update: (cache, { data: { createOrder } }) => {
        const existingOrders = cache.readQuery<OrdersQueryResult>({ query: GET_ORDERS });
        if (existingOrders) {
          cache.writeQuery({
            query: GET_ORDERS,
            data: {
              orders: [...existingOrders.orders, createOrder]
            }
          });
        }
      }
    });
    
    if (data.createOrder) {
      return convertApiOrderToOrder(data.createOrder as ApiOrder);
    }
    return null;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

export const updateOrderStatus = async (id: string, status: string): Promise<Order | null> => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_ORDER_STATUS,
      variables: { id, status },
      refetchQueries: [{ query: GET_ORDERS }]
    });
    
    if (data.updateOrderStatus) {
      // Da updateOrderStatus nur id und status zurückgibt, müssen wir die vollständige Bestellung abrufen
      return await fetchOrder(id);
    }
    return null;
  } catch (error) {
    console.error('Error updating order status:', error);
    return null;
  }
};

export const updateOrder = async (id: string, input: any): Promise<Order | null> => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_ORDER,
      variables: { id, input },
      update: (cache, { data: { updateOrder } }) => {
        const existingOrders = cache.readQuery<OrdersQueryResult>({ query: GET_ORDERS });
        if (existingOrders) {
          cache.writeQuery({
            query: GET_ORDERS,
            data: {
              orders: existingOrders.orders.map((order: ApiOrder) => 
                order.id === updateOrder.id ? updateOrder : order
              )
            }
          });
        }
      }
    });
    
    if (data.updateOrder) {
      return convertApiOrderToOrder(data.updateOrder as ApiOrder);
    }
    return null;
  } catch (error) {
    console.error('Error updating order:', error);
    return null;
  }
};

export const fetchDailySales = async (date: string) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_DAILY_SALES,
      variables: { date },
      fetchPolicy: 'network-only'
    });
    
    return data.dailySales;
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    return null;
  }
};