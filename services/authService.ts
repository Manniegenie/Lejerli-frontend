import api from './api';
import { saveSecure, getSecure, deleteSecure } from '../utils/storage';

export interface AuthResult {
  success: boolean;
  error: string;
  data: {
    id: string;
    email: string;
    displayName: string;
    verificationTier: number;
    token: string;
    refreshToken?: string;
  } | null;
}

class AuthService {
  async signup(email: string, password: string, displayName?: string): Promise<AuthResult> {
    const res = await api.post('/auth/signup', { email, password, displayName });
    if (res.success && res.data?.token) {
      await this.saveAuthData(res.data);
      return { success: true, error: '', data: res.data };
    }
    return { success: false, error: (res as any).error || 'Could not create account', data: null };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data?.token) {
      await this.saveAuthData(res.data);
      return { success: true, error: '', data: res.data };
    }
    return { success: false, error: (res as any).error || 'Invalid email or password', data: null };
  }

  async logout(): Promise<void> {
    await deleteSecure('auth_token');
    await deleteSecure('auth_refresh_token');
    await deleteSecure('auth_user');
  }

  async getStoredToken(): Promise<string | null> {
    return getSecure('auth_token');
  }

  async getStoredRefreshToken(): Promise<string | null> {
    return getSecure('auth_refresh_token');
  }

  async getStoredUser(): Promise<any | null> {
    const s = await getSecure('auth_user');
    return s ? JSON.parse(s) : null;
  }

  private async saveAuthData(data: {
    token: string;
    refreshToken?: string;
    id: string;
    email: string;
    displayName: string;
    verificationTier: number;
  }): Promise<void> {
    await saveSecure('auth_token', data.token);
    if (data.refreshToken) {
      await saveSecure('auth_refresh_token', data.refreshToken);
    }
    await saveSecure('auth_user', JSON.stringify({
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      verificationTier: data.verificationTier,
    }));
  }
}

export default new AuthService();
