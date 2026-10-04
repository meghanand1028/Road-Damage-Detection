import React, { createContext, useContext, useState } from 'react';
import { theme as defaultTheme } from '../../theme';

export interface AppTheme {
  isDark: boolean;
  colors: typeof defaultTheme.colors;
  typography: typeof defaultTheme.typography;
  rounded: typeof defaultTheme.rounded;
  spacing: typeof defaultTheme.spacing;
}

const lightColors: typeof defaultTheme.colors = {
  ...defaultTheme.colors,
  surface: '#ffffff',                 // Complete pure white background
  surfaceDim: '#ffffff',
  surfaceBright: '#ffffff',
  surfaceContainerLowest: '#ffffff',  // Pure white card background
  surfaceContainerLow: '#fafafa',     // Crisp elevated light
  surfaceContainer: '#f4f4f5',        // Section container
  surfaceContainerHigh: '#e4e4e7',    // Light clean border
  surfaceContainerHighest: '#d4d4d8',
  onSurface: '#09090b',               // Solid dark readable text
  onSurfaceVariant: '#52525b',        // Subdued dark text
  background: '#ffffff',              // Complete pure white
  onBackground: '#09090b',
  outline: '#d4d4d8',
  outlineVariant: '#e4e4e7',
};

const darkColors: typeof defaultTheme.colors = {
  ...defaultTheme.colors,
  surface: '#000000',                 // Complete true OLED black background
  surfaceDim: '#000000',
  surfaceBright: '#09090b',
  surfaceContainerLowest: '#000000',  // Pure black card surface
  surfaceContainerLow: '#09090b',     // Deep OLED black surface
  surfaceContainer: '#0d0d11',        // Dark section container
  surfaceContainerHigh: '#18181b',    // Crisp dark border
  surfaceContainerHighest: '#27272a', // Pressed dark states
  onSurface: '#ffffff',               // Crisp pure white text
  onSurfaceVariant: '#a1a1aa',        // Secondary muted light text
  inverseSurface: '#fafafa',
  inverseOnSurface: '#09090b',
  outline: '#27272a',                 // Clean dark borders
  outlineVariant: '#18181b',          // Input dark borders
  surfaceTint: '#3b82f6',
  primary: '#3b82f6',                 // Electric municipal blue
  onPrimary: '#ffffff',
  primaryContainer: '#2563eb',
  onPrimaryContainer: '#eff6ff',
  inversePrimary: '#bfdbfe',
  primaryFixed: '#1e3a8a',
  primaryFixedDim: '#1e40af',
  onPrimaryFixed: '#dbeafe',
  secondary: '#a1a1aa',
  onSecondary: '#ffffff',
  secondaryContainer: '#18181b',
  onSecondaryContainer: '#f4f4f5',
  tertiary: '#10b981',                // Vivid verified emerald
  onTertiary: '#ffffff',
  tertiaryContainer: '#047857',
  onTertiaryContainer: '#d1fae5',
  error: '#ef4444',
  onError: '#ffffff',
  errorContainer: '#7f1d1d',
  onErrorContainer: '#fee2e2',
  background: '#000000',              // Complete true OLED black
  onBackground: '#ffffff',
  warningAmber: '#fbbf24',
  alertCrimson: '#f87171',
};

const lightTheme: AppTheme = {
  ...defaultTheme,
  isDark: false,
  colors: lightColors,
};

const darkTheme: AppTheme = {
  ...defaultTheme,
  isDark: true,
  colors: darkColors,
};

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  themeMode: 'light',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setThemeMode = (mode: 'light' | 'dark') => {
    setIsDark(mode === 'dark');
  };

  const currentTheme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider 
      value={{ 
        theme: currentTheme, 
        isDark, 
        themeMode: isDark ? 'dark' : 'light', 
        toggleTheme, 
        setThemeMode 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
