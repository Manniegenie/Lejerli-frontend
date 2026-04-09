import api from './api';

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
      this.saveAuthData(response.data.data);
    }
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/signin', data);
    if (response.data.success && response.data.data?.token) {
      this.saveAuthData(response.data.data);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // Synchronous — used by authSlice initial state and AppNavigator restore
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getStoredUser(): any | null {
    const s = localStorage.getItem('auth_user');
    return s ? JSON.parse(s) : null;
  }

  private saveAuthData(data: { token: string; id: string; email: string; username: string }): void {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify({
      id: data.id,
      email: data.email,
      username: data.username,
    }));
  }
}

export default new AuthService();
