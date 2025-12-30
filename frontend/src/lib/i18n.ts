/**
 * i18n.ts
 * Internationalization configuration using i18next.
 * Currently supports English (en) as default language.
 * Spanish translations exist but are not loaded yet.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import es from "../locales/es.json";

// Initialize i18next with React integration
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en, // English translations
    },
    es: {
      translation: es, // Spanish translations
    },
  },
  lng: localStorage.getItem("i18nextLng") || "en", // Load from storage or default
  fallbackLng: "en", // Fallback if translation missing
  interpolation: {
    escapeValue: false, // React already protects from XSS
  },
});

// Save language preference on change
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("i18nextLng", lng);
});

// Exported to main.tsx for application-wide i18n support
export default i18n;
