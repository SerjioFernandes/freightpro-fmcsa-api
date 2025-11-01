import api from './api';

export interface UserSettings {
  email?: string;
  phone?: string;
  company?: string;
}

export const settingsService = {
  async getSettings(): Promise<any> {
    const response = await api.get('/settings');
    return response.data;
  },

  async updateProfile(data: UserSettings): Promise<any> {
    const response = await api.put('/settings/profile', data);
    return response.data;
  }
};

