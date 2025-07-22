import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Available locales based on your requirements
export const AVAILABLE_LOCALES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-Hans', name: '简体中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

const LocaleContext = createContext();

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export const LocaleProvider = ({ children }) => {
  const [currentLocale, setCurrentLocale] = useState(() => {
    // Try to get saved locale from localStorage, fallback to 'en'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('laxy-locale') || 'en';
    }
    return 'en';
  });
  
  const [isChanging, setIsChanging] = useState(false);

  // Save locale to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('laxy-locale', currentLocale);
    }
  }, [currentLocale]);

  const changeLocale = useCallback((localeCode) => {
    if (AVAILABLE_LOCALES.find(locale => locale.code === localeCode) && localeCode !== currentLocale) {
      setIsChanging(true);
      setCurrentLocale(localeCode);
      
      // Reset changing state after a short delay
      setTimeout(() => {
        setIsChanging(false);
      }, 500);
    }
  }, [currentLocale]);

  const getCurrentLocaleInfo = useCallback(() => {
    return AVAILABLE_LOCALES.find(locale => locale.code === currentLocale) || AVAILABLE_LOCALES[0];
  }, [currentLocale]);

  const value = {
    currentLocale,
    changeLocale,
    availableLocales: AVAILABLE_LOCALES,
    getCurrentLocaleInfo,
    isChanging,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};
