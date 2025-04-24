import React from 'react';
import { useStore } from '../store';
import DailySalesReport from './DailySalesReport';

const Overview: React.FC = () => {
  const { settings } = useStore();

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Geschäftsinformationen</h2>
        <div className="space-y-2">
          <p><span className="font-semibold">Name:</span> {settings.company.name}</p>
          <p><span className="font-semibold">Adresse:</span> {settings.company.address}</p>
          <p><span className="font-semibold">Telefon:</span> {settings.company.phone}</p>
          <p><span className="font-semibold">Steuernummer:</span> {settings.company.taxId}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Tagesabschluss</h2>
        <DailySalesReport date={new Date()} />
      </div>
    </div>
  );
};

export default Overview; 