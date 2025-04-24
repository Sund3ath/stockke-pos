import { AppDataSource } from '../../config/database';
import { Settings } from '../../entity';

// Repository für Einstellungen
const settingsRepository = AppDataSource.getRepository(Settings);

// Standardeinstellungen
const defaultSettings = {
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

// Resolver für Einstellungen
export const settingsResolver = {
  Query: {
    settings: async (_: any, __: any, context: any) => {
      try {
        // Prüfen, ob Einstellungen existieren
        let settings = await settingsRepository.findOne({ where: { id: 1 } });
        
        // Wenn keine Einstellungen existieren, erstelle Standardeinstellungen
        if (!settings) {
          settings = settingsRepository.create(defaultSettings);
          await settingsRepository.save(settings);
        }
        
        return settings;
      } catch (error) {
        console.error('Fehler beim Abrufen der Einstellungen:', error);
        throw new Error('Fehler beim Abrufen der Einstellungen');
      }
    }
  },
  
  Mutation: {
    updateSettings: async (_: any, { input }: { input: any }) => {
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
        await settingsRepository.save(settings);
        
        return settings;
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Einstellungen:', error);
        throw new Error('Fehler beim Aktualisieren der Einstellungen');
      }
    }
  }
};