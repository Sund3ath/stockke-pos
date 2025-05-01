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
    createdAt: apiOrder.createdAt,
    paymentMethod: apiOrder.paymentMethod as 'cash' | 'card',
    cashReceived: apiOrder.cashReceived,
    tableId: apiOrder.tableId,
    user: {
      id: 'system',
      username: 'System'
    }
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

export const CREATE_EXTERNAL_ORDER = gql`
  mutation CreateExternalOrder($input: CreateExternalOrderInput!) {
    createExternalOrder(input: $input) {
      id
      total
      status
      createdAt
      customerNote
    }
  }
`;

export const GET_EXTERNAL_ORDERS_BY_USER_ID = gql`
  query GetExternalOrdersByUserId($userId: ID!) {
    externalOrdersByUserId(userId: $userId) {
      id
      total
      status
      createdAt
      customerNote
      items {
        id
        productName
        quantity
        price
      }
    }
  }
`;

export const UPDATE_EXTERNAL_ORDER_STATUS = gql`
  mutation UpdateExternalOrderStatus($id: ID!, $status: OrderStatus!) {
    updateExternalOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

// Define the CreateExternalOrderInput type
export interface CreateExternalOrderInput {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    taxRate: number;
  }>;
  total: number;
  adminUserId: string;
  customerNote?: string;
}

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
    // Sanitize the input if it contains items with productName
    let sanitizedInput = { ...input };
    if (input.items) {
      sanitizedInput.items = input.items.map((item: any) => {
        // Log each item for debugging
        console.log('Processing create item:', JSON.stringify(item));
        
        // Extract only the allowed fields
        const { productId, quantity, price, taxRate } = item;
        
        // Explicitly check if productName exists and warn about it
        if ('productName' in item) {
          console.warn(`Warning: productName found in create item ${productId} and will be removed`);
        }
        
        return { productId, quantity, price, taxRate };
      });
    }
    
    console.log('Sanitized create input for GraphQL:', JSON.stringify(sanitizedInput));
    
    const { data } = await apolloClient.mutate({
      mutation: CREATE_ORDER,
      variables: { input: sanitizedInput },
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
    console.log(`Updating order ${id} to status ${status}`);
    
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_ORDER_STATUS,
      variables: { id, status },
      refetchQueries: [{ query: GET_ORDERS }]
    });
    
    console.log(`Order status update result:`, data);
    
    if (data.updateOrderStatus) {
      // Da updateOrderStatus nur id und status zurückgibt, müssen wir die vollständige Bestellung abrufen
      return await fetchOrder(id);
    }
    return null;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error; // Werfen Sie den Fehler, damit der Aufrufer ihn behandeln kann
  }
};

export const updateOrder = async (id: string, input: any): Promise<Order | null> => {
  try {
    // Sanitize the input if it contains items with productName
    let sanitizedInput = { ...input };
    if (input.items) {
      sanitizedInput.items = input.items.map((item: any) => {
        // Log each item for debugging
        console.log('Processing update item:', JSON.stringify(item));
        
        // Extract only the allowed fields
        const { productId, quantity, price, taxRate } = item;
        
        // Explicitly check if productName exists and warn about it
        if ('productName' in item) {
          console.warn(`Warning: productName found in update item ${productId} and will be removed`);
        }
        
        return { productId, quantity, price, taxRate };
      });
    }
    
    console.log('Sanitized update input for GraphQL:', JSON.stringify(sanitizedInput));
    
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_ORDER,
      variables: { id, input: sanitizedInput },
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

export const createExternalOrder = async (input: CreateExternalOrderInput) => {
  try {
    console.log('Input received by createExternalOrder API:', JSON.stringify(input));
    
    // Validate the input to ensure no productName is sent
    const sanitizedInput = {
      ...input,
      items: input.items.map(item => {
        // Log each item to debug
        console.log('Processing item:', JSON.stringify(item));
        
        // Create a new object with only the allowed fields
        const { productId, quantity, price, taxRate } = item;
        
        // Explicitly check if productName exists and warn about it
        if ('productName' in item) {
          console.warn(`Warning: productName found in item ${productId} and will be removed`);
        }
        
        return { productId, quantity, price, taxRate };
      })
    };
    
    console.log('Sanitized input for GraphQL:', JSON.stringify(sanitizedInput));
    
    const { data } = await apolloClient.mutate({
      mutation: CREATE_EXTERNAL_ORDER,
      variables: { input: sanitizedInput }
    });
    return data.createExternalOrder;
  } catch (error) {
    console.error('Error creating external order:', error);
    throw error;
  }
};

export const getExternalOrdersByUserId = async (userId: string) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_EXTERNAL_ORDERS_BY_USER_ID,
      variables: { userId },
      fetchPolicy: 'network-only' // Don't use cache for this query
    });
    return data.externalOrdersByUserId;
  } catch (error) {
    console.error('Error fetching external orders:', error);
    return [];
  }
};

export const updateExternalOrderStatus = async (id: string, status: 'COMPLETED' | 'CANCELLED'): Promise<any> => {
  try {
    console.log(`Updating external order ${id} status to ${status}`);
    
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_EXTERNAL_ORDER_STATUS,
      variables: { id, status },
      refetchQueries: [{ query: GET_EXTERNAL_ORDERS_BY_USER_ID, variables: { userId: localStorage.getItem('userId') } }]
    });
    
    console.log(`External order status update result:`, data);
    
    return data.updateExternalOrderStatus;
  } catch (error) {
    console.error('Error updating external order status:', error);
    console.error('Detailed error:', JSON.stringify(error, null, 2));
    throw error;
  }
};