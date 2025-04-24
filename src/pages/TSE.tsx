import React from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { ShieldCheck } from 'lucide-react';

export const TSE: React.FC = () => {
  const { tseTransactions } = useStore();

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="h-8 w-8 text-green-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">TSE Transactions</h2>
              <p className="text-gray-500">Technical Security Equipment Records</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">TSE Status</p>
                <p className="mt-1 text-lg font-semibold text-green-600">Active</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Signatures</p>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  {tseTransactions.length}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Sync</p>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  {format(new Date(), 'PPpp')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signature
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tseTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{transaction.orderId.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(transaction.timestamp), 'PPpp')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{transaction.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {transaction.signature}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};