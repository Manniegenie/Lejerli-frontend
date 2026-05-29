import api from './api';
import { saveSecure, getSecure, deleteSecure } from '../utils/storage';

export interface SignupData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error: string;
  data: {
    id: string;
    email: string;
    username: string;
    token: string;
    refreshToken?: string;
  } | null;
}

class AuthService {
  async signup(data: SignupData): Promise<AuthResult> {
    const res = await api.post('/signup', data);
    if (res.success && res.data?.token) {
      await this.saveAuthData(res.data);
      return { success: true, error: '', data: res.data };
    }
    return { success: false, error: res.success ? 'Signup failed' : (res as any).error, data: null };
  }

  async login(data: LoginData): Promise<AuthResult> {
    const res = await api.post('/signin', data);
    if (res.success && res.data?.token) {
      await this.saveAuthData(res.data);
      return { success: true, error: '', data: res.data };
    }
    return { success: false, error: res.success ? 'Login failed' : (res as any).error, data: null };
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
    username: string;
  }): Promise<void> {
    await saveSecure('auth_token', data.token);
    if (data.refreshToken) {
      await saveSecure('auth_refresh_token', data.refreshToken);
    }
    await saveSecure('auth_user', JSON.stringify({
      id: data.id,
      email: data.email,
      username: data.username,
    }));
  }
}

export default new AuthService();
