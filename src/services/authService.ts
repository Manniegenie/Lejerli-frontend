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

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    username: string;
    token: string;
  };
}

class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post('/signup', data);
    if (response.data.success && response.data.data?.token) {
      await this.saveAuthData(response.data.data);
    }
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/signin', data);
    if (response.data.success && response.data.data?.token) {
      await this.saveAuthData(response.data.data);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    await deleteSecure('auth_token');
    await deleteSecure('auth_user');
  }

  async getStoredToken(): Promise<string | null> {
    return getSecure('auth_token');
  }

  async getStoredUser(): Promise<any | null> {
    const s = await getSecure('auth_user');
    return s ? JSON.parse(s) : null;
  }

  private async saveAuthData(data: {
    token: string;
    id: string;
    email: string;
    username: string;
  }): Promise<void> {
    await saveSecure('auth_token', data.token);
    await saveSecure('auth_user', JSON.stringify({
      id: data.id,
      email: data.email,
      username: data.username,
    }));
  }
}

export default new AuthService();
