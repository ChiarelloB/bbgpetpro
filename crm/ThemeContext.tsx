import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor =
  | 'purple' | 'blue' | 'green' | 'pink' | 'black' | 'orange' | 'teal' | 'indigo' | 'rose' | 'cyan'
  | 'emerald' | 'amber' | 'lime' | 'sky' | 'violet' | 'fuchsia';

export type SidebarTheme =
  | 'default' | 'light' | 'navy' | 'forest' | 'black' | 'purple'
  | 'slate' | 'zinc' | 'stone' | 'ruby' | 'chocolate';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  sidebarTheme: SidebarTheme;
  setSidebarTheme: (theme: SidebarTheme) => void;
  compactMode: boolean;
  setCompactMode: (enabled: boolean) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const colors: Record<AccentColor, { primary: string; dark: string }> = {
  purple: { primary: '#7c3aed', dark: '#6d28d9' },
  blue: { primary: '#2563eb', dark: '#1d4ed8' },
  green: { primary: '#059669', dark: '#047857' },
  pink: { primary: '#db2777', dark: '#be185d' },
  black: { primary: '#171717', dark: '#000000' },
  orange: { primary: '#f97316', dark: '#ea580c' },
  teal: { primary: '#0d9488', dark: '#0f766e' },
  indigo: { primary: '#4f46e5', dark: '#4338ca' },
  rose: { primary: '#e11d48', dark: '#be123c' },
  cyan: { primary: '#06b6d4', dark: '#0891b2' },
  emerald: { primary: '#10b981', dark: '#059669' },
  amber: { primary: '#f59e0b', dark: '#d97706' },
  lime: { primary: '#84cc16', dark: '#65a30d' },
  sky: { primary: '#0ea5e9', dark: '#0284c7' },
  violet: { primary: '#8b5cf6', dark: '#7c3aed' },
  fuchsia: { primary: '#d946ef', dark: '#c026d3' },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or default
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => (localStorage.getItem('themeMode') as ThemeMode) || 'system');
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => (localStorage.getItem('accentColor') as AccentColor) || 'purple');
  const [sidebarTheme, setSidebarThemeState] = useState<SidebarTheme>(() => (localStorage.getItem('sidebarTheme') as SidebarTheme) || 'default');
  const [compactMode, setCompactModeState] = useState(() => localStorage.getItem('compactMode') === 'true');
  const [highContrast, setHighContrastState] = useState(() => localStorage.getItem('highContrast') === 'true');

  // Persistence wrappers
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('themeMode', mode);
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem('accentColor', color);
  };

  const setSidebarTheme = (theme: SidebarTheme) => {
    setSidebarThemeState(theme);
    localStorage.setItem('sidebarTheme', theme);
  };

  const setCompactMode = (enabled: boolean) => {
    setCompactModeState(enabled);
    localStorage.setItem('compactMode', String(enabled));
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    localStorage.setItem('highContrast', String(enabled));
  };

  // Handle Theme Mode
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');

    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else if (themeMode === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      }
    }
  }, [themeMode]);

  // Handle Accent Color
  useEffect(() => {
    const root = window.document.documentElement;
    const colorData = colors[accentColor] || colors.purple;
    root.style.setProperty('--color-primary', colorData.primary);
    root.style.setProperty('--color-primary-dark', colorData.dark);
  }, [accentColor]);

  // Handle Compact Mode
  useEffect(() => {
    if (compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [compactMode]);

  // Handle High Contrast
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <ThemeContext.Provider value={{
      themeMode, setThemeMode,
      accentColor, setAccentColor,
      sidebarTheme, setSidebarTheme,
      compactMode, setCompactMode,
      highContrast, setHighContrast
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};