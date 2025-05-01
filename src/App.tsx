import React, { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { useStore } from './store';

function App() {
  const { initUser } = useStore();

  useEffect(() => {
    initUser();
  }, [initUser]);

  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col min-h-screen">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;