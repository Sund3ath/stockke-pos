import React, { useState } from 'react';
import { useStore } from '../store';
import { Settings } from '../types';
import { Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserManagement } from '../components/UserManagement';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, isAdmin } = useStore();
  const [formData, setFormData] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setFormData({
      ...formData,
      language: newLanguage
    });
    i18n.changeLanguage(newLanguage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    
    if (success) {
      console.log('Einstellungen erfolgreich in der Datenbank gespeichert');
    } else {
      console.warn('Einstellungen konnten nicht in der Datenbank gespeichert werden, nur lokaler Zustand wurde aktualisiert');
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="bg-white rounded-lg shadow-sm max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

            {/* Company Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    value={formData.company.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      company: { ...formData.company, name: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                  <input
                    type="text"
                    value={formData.company.taxId}
                    onChange={(e) => setFormData({
                      ...formData,
                      company: { ...formData.company, taxId: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.company.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      company: { ...formData.company, phone: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.company.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      company: { ...formData.company, email: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={formData.company.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      company: { ...formData.company, address: e.target.value }
                    })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Language Settings */}
            <div className="space-y-6 mt-8">
              <h3 className="text-lg font-semibold">{t('settings.language')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('settings.language')}</label>
                  <select
                    value={formData.language}
                    onChange={handleLanguageChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('settings.currency')}</label>
                  <select
                    value={`${formData.currency.code}`}
                    onChange={(e) => {
                      const currencyMap = {
                        EUR: { code: 'EUR', symbol: '€', position: 'before' as const },
                        USD: { code: 'USD', symbol: '$', position: 'before' as const },
                        TRY: { code: 'TRY', symbol: '₺', position: 'after' as const }
                      };
                      setFormData({
                        ...formData,
                        currency: currencyMap[e.target.value as keyof typeof currencyMap]
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="TRY">Turkish Lira (₺)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tax Settings */}
            <div className="space-y-6 mt-8">
              <h3 className="text-lg font-semibold">Tax Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enable Tax</label>
                  <div className="mt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tax.enabled}
                        onChange={(e) => setFormData({
                          ...formData,
                          tax: {
                            ...formData.tax,
                            enabled: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={formData.tax.rate}
                    onChange={(e) => setFormData({
                      ...formData,
                      tax: {
                        ...formData.tax,
                        rate: Number(e.target.value)
                      }
                    })}
                    disabled={!formData.tax.enabled}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* TSE Settings */}
            <div className="space-y-6 mt-8">
              <h3 className="text-lg font-semibold">TSE Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">API Key</label>
                  <input
                    type="password"
                    value={formData.tse.apiKey}
                    onChange={(e) => setFormData({
                      ...formData,
                      tse: { ...formData.tse, apiKey: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Device ID</label>
                  <input
                    type="text"
                    value={formData.tse.deviceId}
                    onChange={(e) => setFormData({
                      ...formData,
                      tse: { ...formData.tse, deviceId: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Environment</label>
                  <select
                    value={formData.tse.environment}
                    onChange={(e) => setFormData({
                      ...formData,
                      tse: { ...formData.tse, environment: e.target.value as 'production' | 'test' }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="production">Production</option>
                    <option value="test">Test</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Module Settings */}
            <div className="space-y-6 mt-8">
              <h3 className="text-lg font-semibold">{t('settings.modules')}</h3>
              <p className="text-sm text-gray-500">{t('settings.modulesDescription')}</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h4 className="text-base font-medium">{t('settings.tseModule')}</h4>
                    <p className="text-sm text-gray-500">{t('settings.tseDescription')}</p>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.modules?.tse ?? true}
                        onChange={(e) => setFormData({
                          ...formData,
                          modules: {
                            ...formData.modules,
                            tse: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h4 className="text-base font-medium">{t('settings.customerModule')}</h4>
                    <p className="text-sm text-gray-500">{t('settings.customerDescription')}</p>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.modules?.customers ?? true}
                        onChange={(e) => setFormData({
                          ...formData,
                          modules: {
                            ...formData.modules,
                            customers: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Lieferando Integration */}
            <div className="space-y-6 mt-8">
              <h3 className="text-lg font-semibold">Lieferando Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">API Key</label>
                  <input
                    type="password"
                    value={formData.lieferando?.apiKey ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      lieferando: {
                        apiKey: e.target.value,
                        restaurantId: formData.lieferando?.restaurantId ?? '',
                        apiUrl: formData.lieferando?.apiUrl ?? ''
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Restaurant ID</label>
                  <input
                    type="text"
                    value={formData.lieferando?.restaurantId ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      lieferando: {
                        apiKey: formData.lieferando?.apiKey ?? '',
                        restaurantId: e.target.value,
                        apiUrl: formData.lieferando?.apiUrl ?? ''
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">API URL</label>
                  <input
                    type="url"
                    value={formData.lieferando?.apiUrl ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      lieferando: {
                        apiKey: formData.lieferando?.apiKey ?? '',
                        restaurantId: formData.lieferando?.restaurantId ?? '',
                        apiUrl: e.target.value
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://api.lieferando.de/v1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            {saved && (
              <div className="flex items-center text-green-600">
                <Save className="w-5 h-5 mr-2" />
                Settings saved successfully!
              </div>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={20} />
              Save Settings
            </button>
          </div>
        </form>
      </div>
      
      {/* User Management - nur für Administratoren (außerhalb des Formulars) */}
      {isAdmin() && (
        <div className="bg-white rounded-lg shadow-sm max-w-5xl mx-auto mt-8">
          <div className="p-6">
            <UserManagement />
          </div>
        </div>
      )}
    </div>
  );
};