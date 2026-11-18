import { api } from './api';
import { AuthResponse } from '../types';

export interface InstagramAuthUrlResponse {
  url: string;
  provider: 'instagram' | 'meta' | 'unconfigured';
}

export interface InstagramLoginInput {
  code?: string;
  instagramHandle?: string;
  name?: string;
  followersCount?: number;
  biography?: string;
  avatarUrl?: string;
}

export const instagramService = {
  async getAuthConfig(): Promise<InstagramAuthUrlResponse> {
    return api.get<InstagramAuthUrlResponse>('/auth/instagram/url');
  },

  async getAuthUrl(): Promise<string> {
    const res = await api.get<InstagramAuthUrlResponse>('/auth/instagram/url');
    return res.url;
  },

  async login(input: InstagramLoginInput): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/instagram/callback', input);
    localStorage.setItem('creatorhub_token', data.token);
    return data;
  },

  async syncProfile(input: InstagramLoginInput): Promise<any> {
    return api.post('/auth/instagram/sync', input);
  }
};
