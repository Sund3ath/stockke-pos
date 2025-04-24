import { Settings } from '../types';

export const defaultSettings: Settings = {
  language: 'de',
  currency: {
    code: 'EUR',
    symbol: '€',
    position: 'before'
  },
  tax: {
    enabled: true,
    rate: 19
  },
  printer: {
    enabled: false,
    name: ''
  }
}; 