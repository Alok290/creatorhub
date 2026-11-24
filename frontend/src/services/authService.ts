import { api } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async sendOtp(phone: string): Promise<{ phone: string; message: string; otp?: string }> {
    return api.post<{ phone: string; message: string; otp?: string }>('/auth/send-otp', { phone });
  },

  async verifyOtp(phone: string, otp: string): Promise<{ verified: boolean; phone: string }> {
    return api.post<{ verified: boolean; phone: string }>('/auth/verify-otp', { phone, otp });
  },

  async login(phone: string, otpOrPassword: string): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/login', { phone, otpOrPassword });
    localStorage.setItem('creatorhub_token', data.token);
    return data;
  },

  async register(
    phone: string,
    role: string,
    otpOrPassword?: string,
    email?: string,
    brandName?: string,
    displayName?: string,
    otp?: string
  ): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/register', {
      phone,
      role,
      otpOrPassword,
      email,
      brandName,
      displayName,
      otp,
    });
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

