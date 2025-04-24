import React from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { FileText, X, Printer } from 'lucide-react';
import { generateReceipt } from '../utils/receipt';

interface ReceiptsModalProps {
  onClose: () => void;
}

export const ReceiptsModal: React.FC<ReceiptsModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { orders } = useStore();
  
  const todaysOrders = orders.filter(order => {
    const orderDate = new Date(order.timestamp);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const handlePrintReceipt = (order: any) => {
    generateReceipt(
      order.items,
      order.total,
      order.paymentMethod,
      order.cashReceived,
      order.tableId ? true : false
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold">{t('orders.todaysReceipts')}</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            {todaysOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">{t('orders.noReceipts')}</p>
            ) : (
              <div className="space-y-4">
                {todaysOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{t('orders.receipt')} #{order.id.slice(-6)}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(order.timestamp), 'HH:mm')}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePrintReceipt(order)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Printer size={20} />
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.product.name}</span>
                          <span>€{(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                        <span>{t('common.total')}</span>
                        <span>€{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex justify-between text-sm text-gray-500">
                      <span>{t('common.payment')}: {t(`pos.${order.paymentMethod}`)}</span>
                      <span>{t('common.status')}: {t(`orders.status.${order.status}`)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};