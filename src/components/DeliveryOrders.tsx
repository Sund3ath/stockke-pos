import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

export const DeliveryOrders: React.FC = () => {
  const { deliveryOrders, updateDeliveryOrderStatus } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const handleStatusUpdate = (orderId: string, status: string) => {
    updateDeliveryOrderStatus(orderId, status);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Truck className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Delivery Orders</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deliveryOrders.map((order) => (
          <div
            key={order.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors
              ${selectedOrder === order.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
            onClick={() => setSelectedOrder(order.id === selectedOrder ? null : order.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">Order #{order.id.split('_')[1]}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(order.timestamp), 'HH:mm')}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium
                ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'}`}>
                {order.status}
              </div>
            </div>

            {order.deliveryInfo && (
              <div className="mb-2 text-sm">
                <p className="font-medium">{order.deliveryInfo.customer.name}</p>
                <p className="text-gray-600">
                  {order.deliveryInfo.customer.address.street} {order.deliveryInfo.customer.address.houseNumber}
                </p>
                <p className="text-gray-600">
                  {order.deliveryInfo.customer.address.postalCode} {order.deliveryInfo.customer.address.city}
                </p>
                {order.deliveryInfo.customer.address.floor && (
                  <p className="text-gray-600">Floor: {order.deliveryInfo.customer.address.floor}</p>
                )}
              </div>
            )}

            <div className="space-y-1 mb-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>€{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-1 mt-1 font-medium flex justify-between">
                <span>Total</span>
                <span>€{order.total.toFixed(2)}</span>
              </div>
            </div>

            {selectedOrder === order.id && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => handleStatusUpdate(order.id, 'completed')}
                  className="flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
                >
                  <CheckCircle size={16} />
                  Complete
                </button>
                <button
                  onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                  className="flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              </div>
            )}

            {order.deliveryInfo?.notes && (
              <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                <p className="font-medium">Notes:</p>
                <p>{order.deliveryInfo.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};