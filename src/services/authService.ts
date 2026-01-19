import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const response = await api.post('/auth/signup', data);
    if (response.data.success && response.data.data.token) {
      await this.saveAuthData(response.data.data);
    }
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    if (response.data.success && response.data.data.token) {
      await this.saveAuthData(response.data.data);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  private async saveAuthData(data: {
    token: string;
    id: string;
    email: string;
    username: string;
  }): Promise<void> {
    await AsyncStorage.setItem('authToken', data.token);
    await AsyncStorage.setItem(
      'user',
      JSON.stringify({
        id: data.id,
        email: data.email,
        username: data.username,
      })
    );
  }

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  async getStoredUser(): Promise<any | null> {
    const userString = await AsyncStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }
}

export default new AuthService();
