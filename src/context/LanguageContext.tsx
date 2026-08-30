import React, { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';

// Basic static imports for MVP de-monolithization.
import idDict from '../locales/id.json';
import enDict from '../locales/en.json';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (nextLanguage: Language) => void;
  toggleLanguage: () => void;
  isLanguageTransitioning: boolean;
  t: (key: string, params?: Record<string, string | number>) => any;
}

const translations: Record<Language, any> = {
  id: idDict,
  en: enDict
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getByPath(obj: any, path: string): any {
  if (!path || !obj) return undefined;
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

/**
 * LanguageProvider — Localization & Internationalization Context
 * Manages translation state, persistence, and transition animations for multi-language support.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');
  const [isLanguageTransitioning, setIsLanguageTransitioning] = useState(false);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const persisted = window.localStorage.getItem('socops_lang') as Language;
      if (persisted === 'id' || persisted === 'en') {
        setLanguageState(persisted);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as any).__socops_lang = language;
    window.localStorage.setItem('socops_lang', language);
  }, [language]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const value = useMemo(() => {
    const dictionary = translations[language] || translations['id'];
    
    const setLanguage = (nextLanguage: Language) => {
      if (nextLanguage !== 'id' && nextLanguage !== 'en') return;
      if (nextLanguage === language) return;

      setLanguageState(nextLanguage);
      setIsLanguageTransitioning(true);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        setIsLanguageTransitioning(false);
      }, 350);
    };

    const toggleLanguage = () => {
      setLanguage(language === 'id' ? 'en' : 'id');
    };

    const t = (key: string, params?: Record<string, string | number>): any => {
      let text = getByPath(dictionary, key) || key;
      
      if (typeof text === 'string' && params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    };

    return {
      language,
      setLanguage,
      toggleLanguage,
      isLanguageTransitioning,
      t
    };
  }, [language, isLanguageTransitioning]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful Fallback: Enable forensic continuity even if provider is detached
    console.warn('[CONTEXT] useLanguage called outside LanguageProvider. Engaging tactical fallback.');
    return {
      language: 'id',
      setLanguage: () => {},
      toggleLanguage: () => {},
      isLanguageTransitioning: false,
      t: (key: string) => key
    } as LanguageContextType;
  }
  return context;
}
