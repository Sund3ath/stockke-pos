import React, { useState, useEffect, useRef } from 'react';
import { useExternalOrdersStore } from '../store/externalOrders';
import { useStore } from '../store';
import { format } from 'date-fns';
import { ShoppingBag, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { useSubscription } from '@apollo/client';
import { EXTERNAL_ORDER_CREATED_SUBSCRIPTION } from '../api/orders';

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

export const ExternalOrdersContainer: React.FC = () => {
  const { t } = useTranslation();
  const { externalOrders, loadExternalOrders, updateExternalOrderStatus } = useExternalOrdersStore();
  const { setCurrentOrder, clearOrder } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const { products } = useStore();
  const previousOrdersRef = useRef<string[]>([]);
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize audio element
  useEffect(() => {
    notificationSound.current = new Audio('/sounds/notification.mp3');
    notificationSound.current.load(); // Preload the sound
  }, []);

  // Function to play notification sound
  const playNotificationSound = () => {
    if (notificationSound.current) {
      notificationSound.current.currentTime = 0; // Reset to start
      notificationSound.current.play().catch(error => {
        console.error('Error playing notification sound:', error);
      });
    }
  };

  // Subscribe to new external orders
  const { data: subscriptionData, error: subscriptionError } = useSubscription(EXTERNAL_ORDER_CREATED_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('Subscription data received:', subscriptionData);
      setErrorMessage(null);
    },
    onError: (error) => {
      console.error('Subscription error:', error);
      setErrorMessage(error.message);
      // Try to reconnect after a delay
      setTimeout(() => {
        loadExternalOrders();
      }, 5000);
    }
  });

  useEffect(() => {
    console.log('Subscription data changed:', subscriptionData);
    console.log('Subscription error:', subscriptionError);
    if (subscriptionData?.externalOrderCreated) {
      // Play sound for new order
      playNotificationSound();
      console.log('New order received:', subscriptionData.externalOrderCreated);
      // Reload orders to get the latest state
      loadExternalOrders();
    }
  }, [subscriptionData, subscriptionError, loadExternalOrders]);

  useEffect(() => {
    loadExternalOrders();
    // Set up polling for new orders (as fallback)
    const interval = setInterval(loadExternalOrders, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [loadExternalOrders]);

  useEffect(() => {
    // Get current pending order IDs
    const currentPendingOrderIds = externalOrders
      .filter(order => order.status.toLowerCase() === 'pending')
      .map(order => order.id);

    // Check if there are new orders that weren't in the previous list
    const newOrders = currentPendingOrderIds.filter(
      id => !previousOrdersRef.current.includes(id)
    );

    // If there are new orders and we're not on the first load, play the sound
    if (newOrders.length > 0 && previousOrdersRef.current.length > 0) {
      playNotificationSound();
    }

    // Update the previous orders reference
    previousOrdersRef.current = currentPendingOrderIds;
  }, [externalOrders]);

  const handleOrderClick = (order: ExternalOrder) => {
    if (selectedOrder === order.id) {
      setSelectedOrder(null);
      clearOrder();
    } else {
      setSelectedOrder(order.id);
      // Convert external order items to the format expected by the current order
      const orderItems = order.items
        .map(item => {
          // Find the product in the database by name instead of ID
          const product = products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());
          if (!product) {
            console.error(`Product not found: ${item.productName}`);
            return null;
          }
          return {
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              category: product.category,
              image: product.image,
              inStock: product.inStock,
              taxRate: product.taxRate
            },
            quantity: item.quantity
          };
        })
        .filter((item): item is { product: Product; quantity: number } => item !== null);
      
      setCurrentOrder(orderItems);
      
      // Save the external order ID to localStorage for later reference
      localStorage.setItem('currentExternalOrderId', order.id);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: 'completed' | 'cancelled') => {
    await updateExternalOrderStatus(orderId, status);
    setSelectedOrder(null);
    clearOrder();
  };

  return (
    <div className="h-full flex flex-col">
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" onClick={() => setErrorMessage(null)}>
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">{t('externalOrders.title', 'External Orders')}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {externalOrders
            .filter(order => order.status.toLowerCase() === 'pending')
            .map((order) => (
            <div
              key={order.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors
                ${selectedOrder === order.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
              onClick={() => handleOrderClick(order)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">Order #{order.id.slice(-6)}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.createdAt || Date.now()), 'HH:mm')}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium
                  ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}`}>
                  {t(`orders.status.${order.status.toLowerCase()}`)}
                </div>
              </div>

              <div className="space-y-1">
                {order.items.map((item, index) => (
                  <div key={`${order.id}-${index}`} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.productName}</span>
                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-1 mt-1 font-medium flex justify-between">
                  <span>{t('common.total')}</span>
                  <span>€{order.total.toFixed(2)}</span>
                </div>
              </div>

              {order.customerNote && (
                <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                  <p className="font-medium">{t('orders.note')}:</p>
                  <p>{order.customerNote}</p>
                </div>
              )}

              {selectedOrder === order.id && order.status === 'pending' && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(order.id, 'completed');
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <CheckCircle size={16} />
                    {t('orders.complete')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(order.id, 'cancelled');
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <XCircle size={16} />
                    {t('orders.cancel')}
                  </button>
                </div>
              )}
            </div>
          ))}

          {externalOrders.filter(order => order.status.toLowerCase() === 'pending').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('externalOrders.noPendingOrders', 'No pending orders available')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 