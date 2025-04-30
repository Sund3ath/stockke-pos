import React, { useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import DailySalesReport from '../components/DailySalesReport';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { DailySales, CategorySales } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const Dashboard: React.FC = () => {
  const { orders, loadOrders } = useStore();
  const { t } = useTranslation();
  const completedOrders = orders.filter(order => order.status === 'completed');

  // Load orders when component mounts
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Daily sales data
  const dailySales: DailySales[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const startOfDayDate = startOfDay(date);
      const dayOrders = completedOrders.filter(order => 
        startOfDay(new Date(order.timestamp)).getTime() === startOfDayDate.getTime()
      );
      
      return {
        date: format(date, 'MMM dd'),
        total: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length
      };
    }).reverse();
  }, [completedOrders]);

  // Category sales data
  const categorySales: CategorySales[] = useMemo(() => {
    return completedOrders.reduce((acc, order) => {
      order.items.forEach(item => {
        const category = item.product.category;
        const existing = acc.find(c => c.category === category);
        
        if (existing) {
          existing.total += item.product.price * item.quantity;
          existing.quantity += item.quantity;
        } else {
          acc.push({
            category,
            total: item.product.price * item.quantity,
            quantity: item.quantity
          });
        }
      });
      return acc;
    }, [] as CategorySales[]);
  }, [completedOrders]);

  // Calculate total sales
  const totalSales = useMemo(() => 
    completedOrders.reduce((sum, order) => sum + order.total, 0)
  , [completedOrders]);

  // Calculate today's orders
  const todayOrders = useMemo(() => {
    const startOfToday = startOfDay(new Date()).getTime();
    return completedOrders.filter(order => 
      startOfDay(new Date(order.timestamp)).getTime() === startOfToday
    ).length;
  }, [completedOrders]);

  // Calculate average order value
  const averageOrderValue = useMemo(() => 
    completedOrders.length > 0 ? totalSales / completedOrders.length : 0
  , [completedOrders, totalSales]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header with Report Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <DailySalesReport date={new Date()} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.totalSales')}</h3>
            <p className="text-3xl font-bold text-green-600">
              €{totalSales.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.ordersToday')}</h3>
            <p className="text-3xl font-bold text-blue-600">
              {todayOrders}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.averageOrderValue')}</h3>
            <p className="text-3xl font-bold text-purple-600">
              €{averageOrderValue.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.dailySales')}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#0088FE" name={t('dashboard.sales')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.salesByCategory')}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {categorySales.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};