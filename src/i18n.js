import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// JSON dosyalarımızı içeri alıyoruz
import translationEN from './locales/en.json';
import translationTR from './locales/tr.json';

const resources = {
  en: { translation: translationEN },
  tr: { translation: translationTR }
};

i18n
  .use(LanguageDetector) // Tarayıcı dilini otomatik algılaması için
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;