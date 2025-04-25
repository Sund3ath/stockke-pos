import { AppDataSource } from '../../config/database';
import { Settings } from '../../entity';
import { DeepPartial } from 'typeorm';

// Repository für Einstellungen
const settingsRepository = AppDataSource.getRepository(Settings);

// Standardeinstellungen
const defaultSettings: DeepPartial<Settings> = {
  language: 'de',
  currency: {
    code: 'EUR',
    symbol: '€',
    position: 'before'
  },
  timezone: 'Europe/Berlin',
  tse: {
    apiKey: '',
    deviceId: '',
    environment: 'test'
  },
  company: {
    name: 'Mein Restaurant',
    address: 'Musterstraße 1, 12345 Musterstadt',
    phone: '+49 123 456789',
    email: 'info@mein-restaurant.de',
    taxId: 'DE123456789'
  },
  receipt: {
    header: 'Vielen Dank für Ihren Besuch!',
    footer: 'Besuchen Sie uns bald wieder!',
    showLogo: true
  },
  tax: {
    enabled: true,
    rate: 19
  },
  printer: {
    enabled: false,
    name: ''
  },
  modules: {
    tse: true,
    customers: true
  }
};

// Input type for settings update
interface UpdateSettingsInput {
  language?: string;
  timezone?: string;
  currency?: {
    code?: string;
    symbol?: string;
    position?: string;
  };
  tse?: {
    apiKey?: string;
    deviceId?: string;
    environment?: string;
  };
  company?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    taxId?: string;
  };
  receipt?: {
    header?: string;
    footer?: string;
    showLogo?: boolean;
  };
  tax?: {
    enabled?: boolean;
    rate?: number;
  };
  printer?: {
    enabled?: boolean;
    name?: string;
  };
  modules?: {
    tse?: boolean;
    customers?: boolean;
  };
  lieferando?: {
    apiKey?: string;
    restaurantId?: string;
    apiUrl?: string;
  };
}

// Resolver für Einstellungen
export const settingsResolver = {
  Query: {
    settings: async (_: any, __: any, context: any) => {
      try {
        // Prüfen, ob Einstellungen existieren
        let settings = await settingsRepository.findOne({ where: { id: 1 } });
        
        // Wenn keine Einstellungen existieren, erstelle Standardeinstellungen
        if (!settings) {
          const newSettings = settingsRepository.create(defaultSettings);
          settings = await settingsRepository.save(newSettings);
        }
        
        return settings;
      } catch (error) {
        console.error('Fehler beim Abrufen der Einstellungen:', error);
        throw new Error('Fehler beim Abrufen der Einstellungen');
      }
    }
  },
  
  Mutation: {
    updateSettings: async (_: any, { input }: { input: UpdateSettingsInput }) => {
      try {
        // Prüfen, ob Einstellungen existieren
        let settings = await settingsRepository.findOne({ where: { id: 1 } });
        
        // Wenn keine Einstellungen existieren, erstelle Standardeinstellungen
        if (!settings) {
          settings = settingsRepository.create(defaultSettings);
        }
        
        // Aktualisiere die Einstellungen
        if (input.language) settings.language = input.language;
        if (input.timezone) settings.timezone = input.timezone;
        
        // Aktualisiere verschachtelte Objekte
        if (input.currency) {
          settings.currency = {
            ...settings.currency,
            ...input.currency
          };
        }
        
        if (input.tse) {
          settings.tse = {
            ...settings.tse,
            ...input.tse
          };
        }
        
        if (input.company) {
          settings.company = {
            ...settings.company,
            ...input.company
          };
        }
        
        if (input.receipt) {
          settings.receipt = {
            ...settings.receipt,
            ...input.receipt
          };
        }
        
        if (input.tax) {
          settings.tax = {
            ...settings.tax,
            ...input.tax
          };
        }
        
        if (input.printer) {
          settings.printer = {
            ...settings.printer,
            ...input.printer
          };
        }
        
        if (input.modules) {
          settings.modules = {
            ...settings.modules,
            ...input.modules
          };
        }
        
        if (input.lieferando) {
          settings.lieferando = {
            ...settings.lieferando,
            ...input.lieferando
          };
        }
        
        // Speichere die aktualisierten Einstellungen
        const updatedSettings = await settingsRepository.save(settings);
        
        return updatedSettings;
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Einstellungen:', error);
        throw new Error('Fehler beim Aktualisieren der Einstellungen');
      }
    }
  }
};