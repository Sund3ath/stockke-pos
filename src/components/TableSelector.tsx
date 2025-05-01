import React from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';

export const TableSelector: React.FC = () => {
  const { t } = useTranslation();
  const { tables, selectedTable, selectTable } = useStore();

  // Determine if we're in the mobile view based on screen width
  const isMobile = window.innerWidth < 768;

  return (
    <div className={`grid ${isMobile ? 'grid-cols-3 gap-3' : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1 md:gap-2'}`}>
      {/* Pickup Option */}
      <button
        onClick={async () => {
          try {
            await selectTable('pickup');
          } catch (error) {
            console.error('Fehler beim Auswählen des Abholmodus:', error);
          }
        }}
        className={`${isMobile ? 'h-20' : 'h-12 md:h-16'} flex flex-col items-center justify-center rounded-lg text-center transition-all
          ${selectedTable?.id === 'pickup'
            ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-500'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
      >
        <ShoppingBag size={isMobile ? 18 : 12} className={isMobile ? 'mb-1' : 'mb-0.5 md:mb-1 md:w-4 md:h-4'} />
        <div className={isMobile ? 'text-sm font-medium' : 'text-[10px] md:text-xs font-medium'}>
          {t('pos.pickup')}
        </div>
      </button>

      {/* Table Cards */}
      {tables.map((table) => (
        <button
          key={table.id}
          onClick={async () => {
            try {
              await selectTable(table.id);
            } catch (error) {
              console.error(`Fehler beim Auswählen des Tisches ${table.id}:`, error);
            }
          }}
          className={`${isMobile ? 'h-20' : 'h-12 md:h-16'} flex flex-col items-center justify-center rounded-lg text-center transition-all
            ${table.occupied
              ? 'bg-red-100 text-red-800'
              : table.id === selectedTable?.id
              ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
        >
          <div className={isMobile ? 'text-sm font-medium' : 'text-[10px] md:text-xs font-medium'}>
            {t('pos.tableNumber', { number: table.name })}
          </div>
          {table.occupied && (
            <div className={isMobile ? 'text-sm mt-1' : 'text-[10px] md:text-xs mt-0.5'}>
              €{table.currentOrder?.total.toFixed(2) || '0.00'}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};