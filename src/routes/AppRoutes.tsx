import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { POS } from '../components/POS';
import { Dashboard } from '../pages/Dashboard';
import { Orders } from '../pages/Orders';
import { Products } from '../pages/Products';
import { Customers } from '../pages/Customers';
import { TSE } from '../pages/TSE';
import { SettingsPage } from '../pages/Settings';
import { LoginForm } from '../components/LoginForm';
import { ProtectedRoute } from '../components/ProtectedRoute';
import ExternalOrder from '../pages/ExternalOrder';
import { useStore } from '../store';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, loadProducts, loadOrders, loadSettings } = useStore();
  const location = useLocation();

  // Load data when authenticated
  React.useEffect(() => {
    if (isAuthenticated()) {
      loadProducts();
      loadOrders();
      loadSettings();
    }
  }, [isAuthenticated, loadProducts, loadOrders, loadSettings]);

  const isMenuPath = location.pathname.startsWith('/menu/');

  if (!isAuthenticated() && !isMenuPath) {
    return <LoginForm />;
  }

  // Für externe Bestellseiten (menu/) keine Navigation und Footer anzeigen
  if (isMenuPath) {
    return (
      <div className="h-[100vh] h-[calc(var(--vh,1vh)*100)] flex flex-col bg-gray-100 overflow-hidden">
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/menu/:userId" element={<ExternalOrder />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="h-[100vh] h-[calc(var(--vh,1vh)*100)] flex flex-col bg-gray-100 overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<ProtectedRoute element={<POS />} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} requireAdmin />} />
          <Route path="/orders" element={<ProtectedRoute element={<Orders />} requireAdmin />} />
          <Route path="/products" element={<ProtectedRoute element={<Products />} requireAdmin />} />
          <Route path="/customers" element={<ProtectedRoute element={<Customers />} requireAdmin />} />
          <Route path="/tse" element={<ProtectedRoute element={<TSE />} requireAdmin />} />
          <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} requireAdmin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}; 