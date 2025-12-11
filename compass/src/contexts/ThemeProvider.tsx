/**
 * THEME PROVIDER - Token-Only Theming
 * Last Updated: 06:02:26 Dec 11, 2025
 * 
 * RULE: Only data-theme="warm" and data-theme="dark" may change behavior.
 * Components MUST rely on CSS tokens, not conditional text-black/text-white.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'warm' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'kind-home-theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage or default to 'warm'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === 'warm' || stored === 'dark') {
        return stored;
      }
    }
    return 'warm';
  });

  // Apply theme to root element via data-theme attribute
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'warm' ? 'dark' : 'warm'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
