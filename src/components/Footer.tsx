import React from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { settings } = useStore();
  const { t } = useTranslation();
  const now = new Date();

  return (
    <footer className="bg-gray-800 text-white h-8 text-xs md:text-sm">
      <div className="h-full max-w-full mx-auto px-4 flex items-center justify-between">
        {/* Left side - Company name and TSE status */}
        <div className="flex items-center gap-2 md:gap-6 truncate">
          <span className="truncate hidden md:inline">{settings.company.name}</span>
          <span className="truncate">TSE: Active</span>
        </div>
        
        {/* Right side - System status and version */}
        <div className="flex items-center gap-2 md:gap-6">
          <span className="hidden md:inline">v1.0.0</span>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1 md:mr-2"></div>
            <span className="truncate">{t('dashboard.systemOnline')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};