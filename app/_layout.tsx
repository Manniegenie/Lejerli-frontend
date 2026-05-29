import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import authService from '../src/services/authService';
import { setLogoutHandler } from '../src/services/api';

SplashScreen.preventAutoHideAsync();

// ─── Auth Context ──────────────────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const storedToken = await authService.getStoredToken();
        const storedUser = await authService.getStoredUser();
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback((u: User, t: string) => {
    setUser(u);
    setToken(t);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

  return {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  };
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  const auth = useAuthProvider();

  const [fontsLoaded] = useFonts({
    'GeneralSans': require('../assets/fonts/GeneralSans-Variable.ttf'),
    'GeneralSans-Italic': require('../assets/fonts/GeneralSans-VariableItalic.ttf'),
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = '#0a0a0a';
      document.body.style.backgroundColor = '#0a0a0a';
      const style = document.createElement('style');
      style.textContent = `
        html, body, #root { background-color: #0a0a0a !important; }
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
    <AuthContext.Provider value={auth}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </AuthContext.Provider>
  );
}
