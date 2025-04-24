import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  LayoutDashboard, 
  Receipt, 
  Settings,
  ShieldCheck,
  LogOut,
  Package,
  Users,
  Menu,
  X
} from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin, settings } = useStore();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: UtensilsCrossed, label: 'nav.pos', showAlways: true },
    { path: '/dashboard', icon: LayoutDashboard, label: 'nav.dashboard', adminOnly: true },
    { path: '/orders', icon: Receipt, label: 'nav.orders', adminOnly: true },
    { path: '/products', icon: Package, label: 'nav.products', adminOnly: true },
    { path: '/customers', icon: Users, label: 'nav.customers', adminOnly: true, moduleCheck: () => settings.modules.customers },
    { path: '/tse', icon: ShieldCheck, label: 'nav.tse', adminOnly: true, moduleCheck: () => settings.modules.tse },
    { path: '/settings', icon: Settings, label: 'nav.settings', adminOnly: true }
  ];

  const filteredNavItems = navItems.filter(item => 
    (item.showAlways || (item.adminOnly && isAdmin())) &&
    (!item.moduleCheck || item.moduleCheck())
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gray-800 text-white h-16">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-700"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive(item.path)
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-2" />
              {t(item.label)}
            </Link>
          ))}
        </div>

        {/* Desktop User Info */}
        <div className="hidden md:flex items-center">
          <span className="mr-4 text-gray-300">{currentUser?.username}</span>
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-2" />
            {t('auth.logout')}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed top-16 left-0 right-0 bottom-0 bg-gray-800 z-50 transition-transform duration-300 ease-in-out md:hidden overflow-y-auto`}
        >
          <div className="flex flex-col p-4 space-y-2 h-full">
            <div className="flex-1 space-y-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-3 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {t(item.label)}
                </Link>
              ))}
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              <span className="block px-4 py-2 text-gray-300">{currentUser?.username}</span>
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="flex items-center w-full px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};