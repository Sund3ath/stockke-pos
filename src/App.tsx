import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { POS } from './components/POS';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Products } from './pages/Products';
import { Customers } from './pages/Customers';
import { TSE } from './pages/TSE';
import { SettingsPage } from './pages/Settings';
import { LoginForm } from './components/LoginForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useStore } from './store';

function App() {
  const { isAuthenticated } = useStore();

  useEffect(() => {
    // Function to update the viewport height
    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Initial call
    updateHeight();

    // Update on resize and orientation change
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  if (!isAuthenticated()) {
    return <LoginForm />;
  }

  return (
    <Router>
      <div className="h-[100vh] h-[calc(var(--vh,1vh)*100)] flex flex-col bg-gray-100 overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<POS />} />
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
    </Router>
  );
}

export default App;