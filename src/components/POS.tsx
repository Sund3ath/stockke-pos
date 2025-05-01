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
  ChevronLeft,
  Package,
  Grid,
  ShoppingCart
} from 'lucide-react';
import { TableSelector } from './TableSelector';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptsModal } from './ReceiptsModal';
import { ProductGrid } from './ProductGrid';
import { ExternalOrdersContainer } from './ExternalOrdersContainer';
import { formatPrice } from '../utils/currency';
import { updateOrder as apiUpdateOrder } from '../api/orders';
import { useExternalOrdersStore } from '../store/externalOrders';

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
    setCurrentOrder,
    currentUser
  } = useStore();
  
  const { externalOrders, loadExternalOrders } = useExternalOrdersStore();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);
  const [showExternalOrders, setShowExternalOrders] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Count pending external orders
  const pendingOrdersCount = externalOrders.filter(order => order.status === 'pending').length;

  useEffect(() => {
    // Load external orders on component mount
    loadExternalOrders();
    
    // Set up polling for new orders
    const interval = setInterval(loadExternalOrders, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [loadExternalOrders]);

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

    if (!currentUser) {
      alert(t('pos.loginRequired'));
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
      tableId: selectedTable.id,
      user: {
        id: currentUser.id,
        username: currentUser.username
      }
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
        tableId: selectedTable.id,
        user: {
          id: currentUser.id,
          username: currentUser.username
        }
      });
    }

    occupyTable(selectedTable.id, order);
    clearOrder();
    selectTable(null);
    setShowCart(false);
  };

  // Mobile Layout
  const renderMobileView = () => {
    return (
      <div className="h-full flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-3 bg-white border-b">
          <h1 className="text-lg font-semibold">{t('nav.pos')}</h1>
          <div className="flex items-center gap-2">
            {currentOrder.length > 0 && (
              <button 
                onClick={() => setShowCart(true)}
                className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <ShoppingCart size={24} />
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                  {currentOrder.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </button>
            )}
            <button 
              onClick={() => setShowExternalOrders(true)}
              className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Package size={24} />
              {pendingOrdersCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Either show tables or products based on selection */}
          {!selectedTable ? (
            // Show Tables when no table is selected
            <div className="flex-1 overflow-y-auto p-3">
              <h2 className="text-lg font-semibold mb-3">{t('pos.selectTable')}</h2>
              <TableSelector />
            </div>
          ) : (
            // Show Products when a table is selected
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 bg-white border-b flex items-center">
                <button
                  onClick={() => {
                    if (currentOrder.length > 0) {
                      if (window.confirm(t('pos.confirmUnsavedChanges'))) {
                        selectTable(null);
                      }
                    } else {
                      selectTable(null);
                    }
                  }}
                  className="p-2 mr-2 rounded-full hover:bg-gray-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-medium">
                  {selectedTable.id === 'pickup' 
                    ? t('pos.pickup') 
                    : t('pos.tableNumber', { number: selectedTable.name })}
                </span>
              </div>
              <ProductGrid searchQuery={searchQuery} />
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        {selectedTable && currentOrder.length > 0 && (
          <div className="border-t bg-white p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{t('common.total')}</div>
              <div className="text-lg font-bold">{formatPrice(total)}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleParkOrder}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm"
              >
                <ParkingSquare size={16} />
                {t('pos.parkOrder')}
              </button>
              <button
                onClick={() => setShowCheckout(true)}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm"
              >
                <Receipt size={16} />
                {t('pos.pay')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Desktop Layout
  const renderDesktopView = () => {
    return (
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar - Order Items */}
        <div className="w-1/3 md:w-1/4 bg-white border-r flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 md:p-4 space-y-2">
              {currentOrder.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex-1 mr-1">
                    <p className="font-medium text-xs md:text-base truncate">{item.product.name}</p>
                    <div className="flex items-center text-xs md:text-sm text-gray-600">
                      <span>× {item.quantity}</span>
                      <span className="mx-1 md:mx-2">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 md:gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus size={14} className="md:w-4 md:h-4" />
                    </button>
                    
                    <span className="w-4 md:w-8 text-center text-xs md:text-sm">{item.quantity}</span>
                    
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus size={14} className="md:w-4 md:h-4" />
                    </button>
                    
                    <button
                      onClick={() => removeFromOrder(item.product.id)}
                      className="p-1 hover:bg-gray-100 rounded text-red-500"
                    >
                      <Trash2 size={14} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2 md:p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <span className="font-bold text-xs md:text-base">{t('common.total')}:</span>
              <span className="font-bold text-xs md:text-base">{formatPrice(total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-1 md:gap-2">
              <button
                onClick={() => setShowReceipts(true)}
                className="flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs md:text-sm"
              >
                <Receipt size={16} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">{t('pos.receipts')}</span>
              </button>
              
              <button
                onClick={() => setShowCheckout(true)}
                disabled={currentOrder.length === 0}
                className="flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
              >
                <Receipt size={16} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">{t('pos.pay')}</span>
              </button>
            </div>

            {/* Park Table Button */}
            <button
              onClick={handleParkOrder}
              disabled={currentOrder.length === 0}
              className="flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 mt-1 md:mt-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
            >
              <ParkingSquare size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">{t('pos.parkOrder')}</span>
            </button>
          </div>
        </div>

        {/* Middle Content - Tables and Products */}
        <div className="w-2/3 md:flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="p-2 md:p-4 bg-white border-b">
            <TableSelector />
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50 p-2 md:p-4">
            <ProductGrid searchQuery={searchQuery} />
          </div>
        </div>

        {/* Right Sidebar - External Orders (hidden on mobile) */}
        <div className="hidden md:flex w-1/4 bg-white border-l flex-col overflow-y-auto">
          <ExternalOrdersContainer />
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-88px)] flex flex-col">
      {/* Conditional rendering based on screen size */}
      <div className="md:hidden h-full">
        {renderMobileView()}
      </div>
      <div className="hidden md:flex flex-col h-full">
        {renderDesktopView()}
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

      {/* External Orders Modal (for mobile) */}
      {showExternalOrders && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
          <div className="p-3 border-b flex items-center">
            <button 
              onClick={() => setShowExternalOrders(false)}
              className="p-2 mr-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-lg font-semibold">{t('externalOrders.title')}</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ExternalOrdersContainer />
          </div>
        </div>
      )}

      {/* Cart Modal (for mobile) */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
          <div className="p-3 border-b flex items-center">
            <button 
              onClick={() => setShowCart(false)}
              className="p-2 mr-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-lg font-semibold">{t('pos.cart')}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {currentOrder.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between py-3 border-b">
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>× {item.quantity}</span>
                    <span className="mx-2">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Minus size={18} />
                  </button>
                  
                  <span className="w-10 text-center">{item.quantity}</span>
                  
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Plus size={18} />
                  </button>
                  
                  <button
                    onClick={() => removeFromOrder(item.product.id)}
                    className="p-2 hover:bg-gray-100 rounded text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">{t('common.total')}:</span>
              <span className="font-bold text-xl">{formatPrice(total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleParkOrder}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg w-full"
              >
                <ParkingSquare size={20} />
                {t('pos.parkOrder')}
              </button>
              <button
                onClick={() => {
                  setShowCart(false);
                  setShowCheckout(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg w-full"
              >
                <Receipt size={20} />
                {t('pos.pay')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};