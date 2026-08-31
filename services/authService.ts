import api from './api';
import { saveSecure, getSecure, deleteSecure } from '../utils/storage';

export interface RequestOtpResult {
  success: boolean;
  error: string;
  purpose: 'SIGNUP' | 'LOGIN' | null;
}

export interface VerifyOtpResult {
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
  async requestOtp(email: string): Promise<RequestOtpResult> {
    const res = await api.post('/auth/request-otp', { email });
    if (res.success) {
      return { success: true, error: '', purpose: res.data?.purpose ?? null };
    }
    return { success: false, error: (res as any).error || 'Failed to request code', purpose: null };
  }

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResult> {
    const res = await api.post('/auth/verify-otp', { email, otp });
    if (res.success && res.data?.token) {
      await this.saveAuthData(res.data);
      return { success: true, error: '', data: res.data };
    }
    return { success: false, error: res.success ? 'Verification failed' : (res as any).error, data: null };
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
