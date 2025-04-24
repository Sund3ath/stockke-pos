import React, { useState } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { CreditCard, Banknote, X } from 'lucide-react';
import { generateReceipt } from '../utils/receipt';
import { calculateTax } from '../utils/tax';
import { MoneyShortcuts } from './MoneyShortcuts';

interface CheckoutModalProps {
  onClose: () => void;
  total: number;
  items: Array<{ product: any; quantity: number }>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, total, items }) => {
  const { t } = useTranslation();
  const { completeOrder } = useStore();
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showChange, setShowChange] = useState(false);
  const [isIndoor, setIsIndoor] = useState(true);

  // Calculate tax totals based on indoor/outdoor selection
  const taxSummary = items.reduce((acc, item) => {
    const { net, tax } = calculateTax(
      item.product.price * item.quantity,
      isIndoor || item.product.category === 'drinks' ? 19 : 7
    );
    
    const rateKey = isIndoor || item.product.category === 'drinks' ? '19' : '7';
    if (!acc[rateKey]) {
      acc[rateKey] = { net: 0, tax: 0 };
    }
    
    acc[rateKey].net += net;
    acc[rateKey].tax += tax;
    
    return acc;
  }, {} as Record<string, { net: number; tax: number }>);

  const handleCashPayment = () => {
    if (!cashReceived) {
      alert(t('pos.enterCashAmount'));
      return;
    }

    const cashAmount = parseFloat(cashReceived);
    if (cashAmount < total) {
      alert(t('pos.insufficientCash'));
      return;
    }

    completeOrder('cash', cashAmount);
    generateReceipt(items, total, 'cash', cashAmount, isIndoor);
    onClose();
  };

  const handleCardPayment = () => {
    completeOrder('card');
    generateReceipt(items, total, 'card', undefined, isIndoor);
    onClose();
  };

  const handleMoneyShortcut = (amount: number) => {
    const currentAmount = parseFloat(cashReceived) || 0;
    setCashReceived((currentAmount + amount).toFixed(2));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">{t('pos.checkout')}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={isIndoor}
                  onChange={() => setIsIndoor(true)}
                  className="mr-2"
                />
                {t('orders.indoor')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!isIndoor}
                  onChange={() => setIsIndoor(false)}
                  className="mr-2"
                />
                {t('orders.outdoor')}
              </label>
            </div>

            <div className="space-y-2 mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>€{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 space-y-1">
              {Object.entries(taxSummary).map(([rate, { net, tax }]) => (
                <div key={rate} className="flex justify-between text-sm text-gray-600">
                  <span>{rate}% {t('orders.vat')}</span>
                  <span>
                    {t('orders.net')}: €{net.toFixed(2)} | {t('orders.vat')}: €{tax.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>{t('common.total')}:</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {!showChange ? (
            <div className="space-y-3">
              <button
                onClick={() => setShowChange(true)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold
                         flex items-center justify-center gap-2 hover:bg-green-700"
              >
                <Banknote size={20} />
                {t('pos.cash')}
              </button>
              
              <button
                onClick={handleCardPayment}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold
                         flex items-center justify-center gap-2 hover:bg-blue-700"
              >
                <CreditCard size={20} />
                {t('pos.card')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pos.cashReceived')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('pos.enterCashAmount')}
                />
              </div>

              <MoneyShortcuts onSelect={handleMoneyShortcut} />
              
              {parseFloat(cashReceived) > 0 && (
                <div className="text-lg font-semibold">
                  {t('pos.change')}: €{(parseFloat(cashReceived) - total).toFixed(2)}
                </div>
              )}
              
              <button
                onClick={handleCashPayment}
                disabled={!cashReceived || parseFloat(cashReceived) < total}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold
                         flex items-center justify-center gap-2 hover:bg-green-700
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {t('pos.completePayment')}
              </button>
              
              <button
                onClick={() => setShowChange(false)}
                className="w-full border border-gray-300 py-2 rounded-lg font-semibold"
              >
                {t('common.back')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};