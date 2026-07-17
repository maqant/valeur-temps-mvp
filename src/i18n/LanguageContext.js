import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations, DEFAULT_LANGUAGE } from './translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children, initialLang }) => {
  const [lang, setLang] = useState(initialLang || DEFAULT_LANGUAGE);

  const t = useCallback(
    (key) => translations[lang]?.[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
};
