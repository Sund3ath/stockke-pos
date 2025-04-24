import { Settings } from '../types';

export const defaultSettings: Settings = {
  currency: {
    code: 'EUR',
    symbol: '€',
    position: 'before'
  },
  language: 'de',
  timezone: 'Europe/Berlin',
  tse: {
    apiKey: 'test-key',
    deviceId: 'TSE-001',
    environment: 'test'
  },
  company: {
    name: 'Stockke POS',
    address: 'Saarbrückerstr.39, 66333 Völklingen',
    phone: '0162 9766086',
    email: 'fares.ataya@gmail.com',
    taxId: '123456'
  },
  receipt: {
    header: 'Thank you for your visit!',
    footer: 'See you soon!',
    showLogo: true
  },
  tax: {
    indoor: {
      food: 19,
      drinks: 19
    },
    outdoor: {
      food: 7,
      drinks: 19
    }
  },
  modules: {
    tse: true,
    customers: true
  }
};