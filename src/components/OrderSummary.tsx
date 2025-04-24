import React, { useState } from 'react';
import { Trash2, Minus, Plus, Receipt, CreditCard, Banknote } from 'lucide-react';
import { useStore } from '../store';
import { generateInvoice } from '../utils/invoice';
import { useTranslation } from 'react-i18next';

export const OrderSummary: React.FC = () => {
  const { t } = useTranslation();
  const { currentOrder, updateQuantity, removeFromOrder, completeOrder } = useStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const total = currentOrder.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handlePayment = (method: 'cash' | 'card') => {
    if (currentOrder.length === 0) return;
    completeOrder(method);
    generateInvoice(currentOrder, total);
    setShowPaymentModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">{t('pos.cart')}</h2>
      
      <div className="space-y-4 mb-6">
        {currentOrder.map((item) => (
          <div key={item.product.id} className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium">{item.product.name}</h3>
              <p className="text-sm text-gray-600">
                €{(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Minus size={16} />
              </button>
              
              <span className="w-8 text-center">{item.quantity}</span>
              
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Plus size={16} />
              </button>
              
              <button
                onClick={() => removeFromOrder(item.product.id)}
                className="p-1 hover:bg-gray-100 rounded text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between mb-4">
          <span className="font-bold">{t('common.total')}:</span>
          <span className="font-bold">€{total.toFixed(2)}</span>
        </div>
        
        <button
          onClick={() => setShowPaymentModal(true)}
          disabled={currentOrder.length === 0}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold
                     flex items-center justify-center gap-2
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     hover:bg-green-700 transition-colors"
        >
          <Receipt size={20} />
          {t('pos.completePayment')}
        </button>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">{t('pos.payment')}</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => handlePayment('cash')}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold
                         flex items-center justify-center gap-2 hover:bg-green-700"
              >
                <Banknote size={20} />
                {t('pos.cash')}
              </button>
              
              <button
                onClick={() => handlePayment('card')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold
                         flex items-center justify-center gap-2 hover:bg-blue-700"
              >
                <CreditCard size={20} />
                {t('pos.card')}
              </button>
              
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full border border-gray-300 py-3 rounded-lg font-semibold
                         flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};