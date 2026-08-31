import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthContext, useAuthProvider } from '../hooks/useAuth';
import { ThemeProvider } from '../contexts/ThemeContext';
import { lightColors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  const auth = useAuthProvider();

  const [fontsLoaded] = useFonts({
    'GeneralSans': require('../assets/fonts/GeneralSans-Variable.ttf'),
    'GeneralSans-Italic': require('../assets/fonts/GeneralSans-VariableItalic.ttf'),
  });

  // Runs before ThemeProvider mounts (RootLayout is what renders the
  // provider, so it can't consume useTheme() itself here), so this reads
  // the raw theme values directly rather than through the context.
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = lightColors.background;
      document.body.style.backgroundColor = lightColors.background;
      const style = document.createElement('style');
      style.textContent = `
        html, body, #root { background-color: ${lightColors.background} !important; }
        * { font-family: 'GeneralSans', -apple-system, sans-serif; }
        *:focus, *:focus-visible, *:focus-within {
          outline: none !important;
          box-shadow: none !important;
        }
        input, textarea { outline: none !important; -webkit-appearance: none !important; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded && !auth.loading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, auth.loading]);

  if (!fontsLoaded || auth.loading) return null;

  return (
    <ThemeProvider>
      <AuthContext.Provider value={auth}>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="dark" />
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
