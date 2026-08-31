import React, { createContext, useContext, useMemo } from 'react';
import { AppColors, lightColors } from '../constants/theme';

// Mirrors Chatbramp-app's contexts/ThemeContext.tsx shape ({colors, isDark,
// toggleTheme}), but Lejerli is light-mode-only for this pass (see build
// brief §12) — isDark is hardcoded false and toggleTheme is a no-op rather
// than wiring up the AsyncStorage dark/light persistence Chatbramp-app has.

type ThemeContextType = {
  colors: AppColors;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<ThemeContextType>(() => ({
    colors: lightColors,
    isDark: false,
    toggleTheme: () => {},
  }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
