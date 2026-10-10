import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language } from '../data/translations';
import { translations } from '../data/translations';

interface LanguageContextType {
  lang: Language;
  isRTL: boolean;
  toggleLanguage: () => void;
  t: typeof translations;
  // Convenience shorthand: get text for current lang
  tx: (obj: { ar: string; en: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'bh_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    return saved === 'en' ? 'en' : 'ar';
  });

  const isRTL = lang === 'ar';

  // Apply direction & lang attribute to <html> whenever lang changes
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    // Switch font family based on language
    document.body.style.fontFamily = isRTL
      ? 'var(--font-arabic)'
      : 'var(--font-latin)';
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, isRTL]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // tx = translate — picks the right string for current lang
  const tx = (obj: { ar: string; en: string }): string => obj[lang];

  return (
    <LanguageContext.Provider value={{ lang, isRTL, toggleLanguage, t: translations, tx }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
};
