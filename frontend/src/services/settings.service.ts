import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/user.types';
import api from './api';

export interface UserSettings {
  email?: string;
  phone?: string;
  company?: string;
}

export const settingsService = {
  async getSettings(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/settings');
    return response.data;
  },

  async updateProfile(data: UserSettings): Promise<ApiResponse<User>> {
    const response = await api.put<ApiResponse<User>>('/settings/profile', data);
    return response.data;
  }
};

