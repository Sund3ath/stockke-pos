import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Receipt,
  ParkingSquare,
  Type,
  ArrowLeftRight,
  Search,
  ChevronLeft
} from 'lucide-react';
import { TableSelector } from './TableSelector';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptsModal } from './ReceiptsModal';
import { ProductGrid } from './ProductGrid';
import { formatPrice } from '../utils/currency';
import { updateOrder as apiUpdateOrder } from '../api/orders';

export const POS: React.FC = () => {
  const { t } = useTranslation();
  const { 
    currentOrder, 
    removeFromOrder, 
    updateQuantity, 
    clearOrder,
    selectedTable,
    selectTable,
    occupyTable,
    setCurrentOrder
  } = useStore();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedTable?.occupied && selectedTable?.currentOrder) {
      setCurrentOrder(selectedTable.currentOrder.items);
    } else {
      clearOrder();
    }
  }, [selectedTable, setCurrentOrder, clearOrder]);

  const total = currentOrder.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleParkOrder = () => {
    if (!selectedTable) {
      alert(t('pos.selectTableFirst'));
      return;
    }

    if (currentOrder.length === 0) {
      alert(t('pos.noItems'));
      return;
    }

    // Check if there's an existing order for this table
    const existingOrder = selectedTable.currentOrder;
    const order = {
      id: existingOrder?.id || Date.now().toString(),
      items: currentOrder,
      total,
      status: 'pending' as const,
      timestamp: new Date().toISOString(),
      paymentMethod: 'cash' as const,
      tableId: selectedTable.id
    };

    // If there's an existing order, update it in the database
    if (existingOrder) {
      apiUpdateOrder(existingOrder.id, {
        items: currentOrder.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          taxRate: item.product.taxRate
        })),
        total,
        status: 'pending',
        tableId: selectedTable.id
      });
    }

    occupyTable(selectedTable.id, order);
    clearOrder();
    selectTable(null);
  };

  return (
    <div className="h-[calc(100vh-88px)] flex flex-col md:flex-row">
      {/* Left Sidebar - Order Items */}
      <div className="w-full md:w-1/4 bg-white border-r flex flex-col max-h-[40vh] md:max-h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {currentOrder.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between py-2 border-b">
                <div className="flex-1">
                  <p className="font-medium text-sm md:text-base">{item.product.name}</p>
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    <span>× {item.quantity}</span>
                    <span className="mx-2">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
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
        </div>
        
        <div className="border-t p-4 bg-white">
          <div className="flex justify-between mb-2 font-medium">
            <span>{t('common.total')}</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button className="bg-gray-700 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors text-xs md:text-sm">
              <Type size={16} />
              {t('pos.text')}
            </button>
            <button className="bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors text-xs md:text-sm">
              <ArrowLeftRight size={16} />
              {t('pos.inOut')}
            </button>
            <button 
              onClick={() => setShowCheckout(true)}
              disabled={currentOrder.length === 0}
              className="bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-xs md:text-sm"
            >
              {t('pos.checkout')}
            </button>
          </div>
          {currentOrder.length > 0 && (
            <button
              onClick={handleParkOrder}
              className="mt-2 w-full bg-gray-100 text-gray-700 p-2 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors text-xs md:text-sm"
            >
              <ParkingSquare size={16} />
              {t('pos.parkOrder')}
            </button>
          )}
        </div>
      </div>

      {/* Center - Table Selection */}
      <div className={`flex-1 bg-gray-100 flex flex-col ${selectedTable ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4">
          <div className="bg-emerald-500 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <User size={20} />
              <span className="text-base md:text-lg font-medium">
                {selectedTable ? `${t('pos.table')} ${selectedTable.name}` : t('pos.selectTable')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <TableSelector />
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className={`${selectedTable ? 'flex md:w-1/4' : 'hidden md:flex md:w-1/4'} flex-col bg-white border-l h-[calc(100vh-88px)] md:h-full overflow-hidden`}>
        <div className="p-4 flex-shrink-0 bg-white sticky top-0 z-10 border-b">
          <div className="md:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => selectTable(null)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              {t('common.back')}
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder={t('pos.searchProducts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-8 pr-4 border rounded-lg"
            />
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ProductGrid />
        </div>
      </div>

      {/* Modals */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          total={total}
          items={currentOrder}
        />
      )}
      
      {showReceipts && (
        <ReceiptsModal onClose={() => setShowReceipts(false)} />
      )}
    </div>
  );
};