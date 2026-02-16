import { createContext, useContext, useState, useEffect } from 'react';
import { fr } from '../locales/fr';
import { ar } from '../locales/ar';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Récupère la langue sauvegardée ou utilise 'fr' par défaut
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'fr';
  });

  const translations = {
    fr,
    ar,
  };

  const t = translations[language];
  const isRTL = language === 'ar';

  // Sauvegarde la langue et applique la direction RTL
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language, isRTL]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'fr' ? 'ar' : 'fr'));
  };

  const changeLanguage = (lang) => {
    if (lang === 'fr' || lang === 'ar') {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        t,
        isRTL,
        toggleLanguage,
        changeLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};