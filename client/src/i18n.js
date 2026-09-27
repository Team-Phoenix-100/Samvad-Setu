import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import aboutTranslation from './locales/en/about.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        about: aboutTranslation
      }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
