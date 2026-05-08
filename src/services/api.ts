import axios from 'axios';
import { getSecure, deleteSecure } from '../utils/storage';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getSecure('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      await deleteSecure('auth_token');
      await deleteSecure('auth_user');
    }
    return Promise.reject(error);
  }
);

export default api;
