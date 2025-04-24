import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { useStore } from '../store';

import translationEN from './locales/en.json';
import translationTR from './locales/tr.json';
import translationDE from './locales/de.json';

const resources = {
  en: {
    translation: translationEN,
  },
  de: {
    translation: translationDE,
  },
  tr: {
    translation: translationTR,
  },
};

// Get initial language from store
const store = useStore.getState();
const initialLanguage = store.settings.language;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Subscribe to language changes from the store
useStore.subscribe((state) => {
  const language = state.settings.language;
  if (i18n.language !== language) {
    i18n.changeLanguage(language);
  }
});

export default i18n; 