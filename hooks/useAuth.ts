import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';
import { setLogoutHandler } from '../services/api';

// Mirrors Chatbramp-app's hooks/useAuth.js file organization: AuthContext
// exported for the provider, useAuth() to consume it (throws outside the
// provider), useAuthProvider() holding the actual state/logic. Lejerli is
// strict TypeScript (Chatbramp-app's version isn't), so this is typed.
//
// The login/logout/checkAuth bodies are adapted to Lejerli's email+password
// contract: authService.signup/login do the actual network calls from the
// signup/login screens, and hand this hook an already-resolved {user, token}
// pair via login() rather than this hook owning credential submission itself.

export interface User {
  id: string;
  email: string;
  displayName: string;
  verificationTier: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
    checkAuth,
  };
}
