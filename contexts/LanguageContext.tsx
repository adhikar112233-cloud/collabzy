import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import * as locales from '../locales';

type Language = keyof typeof locales;
// Use 'en' as the source of truth for all translation keys.
// This prevents type errors if a language file is missing a key.
type Translations = typeof locales['en'];

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  // The key is now correctly typed against the 'en' locale.
  t: (key: keyof Translations, options?: { [key: string]: string | number | undefined }) => string;
  languages: { key: Language; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languageNames: { [key in Language]: string } = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    hi: "हिन्दी",
    zh: "中文",
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Memoize the languages array as it's constant throughout the app's lifecycle.
  const languages = useMemo(() => Object.keys(locales).map(key => ({
      key: key as Language,
      name: languageNames[key as Language]
  })).sort((a, b) => a.name.localeCompare(b.name)), []);

  // Use useCallback for the translation function, re-creating it only when the language changes.
  const t = useCallback((key: keyof Translations, options?: { [key: string]: string | number | undefined }): string => {
    // Safely access translations for the current language, with a fallback to English.
    let translation = (locales[language] as Translations)?.[key] || locales.en[key] || String(key);
    
    if (options) {
      Object.keys(options).forEach(optionKey => {
        const regex = new RegExp(`{{${optionKey}}}`, 'g');
        translation = translation.replace(regex, String(options[optionKey]));
      });
    }
    return translation;
  }, [language]);

  // Memoize the context value to prevent unnecessary re-renders of consumer components.
  // This is a key performance optimization for Context API.
  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    languages
  }), [language, t, languages]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
