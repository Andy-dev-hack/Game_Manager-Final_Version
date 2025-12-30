/**
 * LanguageToggle.tsx
 * Component to switch between available languages (EN/ES).
 * Persists selection via i18next.
 */

import { useTranslation } from "react-i18next";
import styles from "./LanguageToggle.module.css";

/**
 * LanguageToggle component
 * Renders a button to toggle between English and Spanish.
 */
export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "es" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      className={styles.toggleButton}
      onClick={toggleLanguage}
      title={i18n.language === "en" ? "Switch to Spanish" : "Cambiar a Inglés"}
      aria-label="Toggle language"
    >
      <span className={i18n.language === "en" ? styles.activeLang : ""}>
        EN
      </span>
      <span className={styles.separator}>|</span>
      <span className={i18n.language === "es" ? styles.activeLang : ""}>
        ES
      </span>
    </button>
  );
};
