import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'arctic' | 'emerald' | 'amber' | 'light';

export interface ThemeOption {
  id: Theme;
  name: string;
  label: string;
  description: string;
  accentColor: string;
  previewBg: string;
  previewBorder: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'arctic',
    name: 'Arctic Cyan',
    label: 'Polar High-Tech (Default)',
    description: 'Crisp ice-cyan accents over deep sub-zero polar slate.',
    accentColor: '#06b6d4',
    previewBg: '#090d16',
    previewBorder: '#1e293b'
  },
  {
    id: 'emerald',
    name: 'Clean Energy',
    label: 'Clean Energy Emerald',
    description: 'Vibrant emerald & mint accents with deep forest obsidian.',
    accentColor: '#10b981',
    previewBg: '#05140d',
    previewBorder: '#123324'
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    label: 'Solar Amber & Gold',
    description: 'Warm gold & amber energy accents over industrial charcoal.',
    accentColor: '#f59e0b',
    previewBg: '#0f0b06',
    previewBorder: '#291e11'
  },
  {
    id: 'light',
    name: 'Clean Light',
    label: 'Modern Clean Light',
    description: 'Daylight control-room mode with crisp white cards & sapphire accents.',
    accentColor: '#0284c7',
    previewBg: '#f8fafc',
    previewBorder: '#e2e8f0'
  }
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'arctic',
  setTheme: () => {},
  themes: THEME_OPTIONS
});

const STORAGE_KEY = 'polar_ems_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme;
      if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Unable to read theme from localStorage', e);
    }
    return 'arctic';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Unable to save theme to localStorage', e);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEME_OPTIONS }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
