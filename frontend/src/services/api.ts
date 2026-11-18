import { ApiResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const token = localStorage.getItem('creatorhub_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers as Record<string, string>) };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        // If unauthorized, clear invalid session if endpoint is protected
        if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
          localStorage.removeItem('creatorhub_token');
          localStorage.removeItem('creatorhub_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }

      const json: ApiResponse<T> = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || `Request failed with status ${response.status}`);
      }

      return json.data;
    } catch (err: any) {
      throw new Error(err.message || 'Network error or backend unavailable');
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

