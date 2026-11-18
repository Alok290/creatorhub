import { api } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async login(phone: string, otpOrPassword: string): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/login', { phone, otpOrPassword });
    localStorage.setItem('creatorhub_token', data.token);
    return data;
  },

  async register(phone: string, role: string, otpOrPassword?: string, email?: string): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/register', { phone, role, otpOrPassword, email });
    localStorage.setItem('creatorhub_token', data.token);
    return data;
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me');
  },

  logout(): void {
    localStorage.removeItem('creatorhub_token');
    localStorage.removeItem('creatorhub_user');
  }
};

