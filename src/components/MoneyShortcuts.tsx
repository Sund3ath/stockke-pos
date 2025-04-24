import React from 'react';
import { Euro } from 'lucide-react';

interface MoneyShortcutsProps {
  onSelect: (amount: number) => void;
}

export const MoneyShortcuts: React.FC<MoneyShortcutsProps> = ({ onSelect }) => {
  const bills = [5, 10, 20, 50, 100];
  const coins = [0.1, 0.2, 0.5, 1, 2];

  return (
    <div className="space-y-4">
      {/* Bills */}
      <div className="grid grid-cols-3 gap-2">
        {bills.map((amount) => (
          <button
            key={amount}
            onClick={() => onSelect(amount)}
            className="flex items-center justify-center gap-1 bg-green-100 text-green-800 p-2 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Euro size={16} />
            {amount}
          </button>
        ))}
      </div>

      {/* Coins */}
      <div className="grid grid-cols-5 gap-2">
        {coins.map((amount) => (
          <button
            key={amount}
            onClick={() => onSelect(amount)}
            className="flex items-center justify-center gap-1 bg-gray-100 text-gray-800 p-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <Euro size={14} />
            {amount.toFixed(2)}
          </button>
        ))}
      </div>
    </div>
  );
};