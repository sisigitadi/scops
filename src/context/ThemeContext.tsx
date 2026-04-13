import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

/**
 * ThemeContext — Visual Environment Orchestration
 * Manages the high-fidelity dark/light mode state, persistence protocols, 
 * and transitional glitch effects for the SOC aesthetic.
 */

type ThemeType = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType | ((prev: ThemeType) => ThemeType)) => void;
  toggleTheme: () => void;
  isThemeTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    // 1. Persistent Audit Check
    const stored = typeof window !== 'undefined' ? localStorage.getItem('socops_theme') : null;
    if (stored === 'dark' || stored === 'light') return stored as ThemeType;

    // 2. System Preference Handshake
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // 3. Default to Dark Mode for Neural Comfort
    return 'dark';
  });

  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    root.setAttribute('data-theme', theme);
    localStorage.setItem('socops_theme', theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('socops_theme');
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsThemeTransitioning(true);
    const root = window.document.documentElement;
    root.classList.add('theme-glitch');
    
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    
    setTimeout(() => {
      setIsThemeTransitioning(false);
      root.classList.remove('theme-glitch');
    }, 450);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isThemeTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
