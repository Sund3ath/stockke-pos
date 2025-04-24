import React from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';

export const TableSelector: React.FC = () => {
  const { t } = useTranslation();
  const { tables, selectedTable, selectTable } = useStore();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {/* Pickup Option */}
      <button
        onClick={() => selectTable('pickup')}
        className={`h-16 flex flex-col items-center justify-center rounded-lg text-center transition-all
          ${selectedTable?.id === 'pickup'
            ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-500'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
      >
        <ShoppingBag size={16} className="mb-1" />
        <div className="text-xs font-medium">{t('pos.pickup')}</div>
      </button>

      {/* Table Cards */}
      {tables.map((table) => (
        <button
          key={table.id}
          onClick={() => selectTable(table.id)}
          className={`h-16 flex flex-col items-center justify-center rounded-lg text-center transition-all
            ${table.occupied
              ? 'bg-red-100 text-red-800'
              : table.id === selectedTable?.id
              ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
        >
          <div className="text-xs font-medium">{t('pos.tableNumber', { number: table.name })}</div>
          {table.occupied && (
            <div className="text-xs mt-0.5">
              €{table.currentOrder?.total.toFixed(2) || '0.00'}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};