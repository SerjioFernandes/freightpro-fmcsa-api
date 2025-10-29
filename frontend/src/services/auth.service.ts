import api from './api';
import type { RegisterData, LoginData, User } from '../types/user.types';
import type { AuthResponse } from '../types/api.types';

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/verify', { email, code });
    return response.data;
  },

  async resendCode(email: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/resend-code', { email });
    return response.data;
  },

  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

