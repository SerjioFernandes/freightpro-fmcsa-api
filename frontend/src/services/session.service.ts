import api from './api';

export interface Session {
  token: string;
  device: string;
  ip: string;
  userAgent?: string;
  lastActivity: string;
  createdAt: string;
}

export const sessionService = {
  async getSessions(): Promise<{ success: boolean; data?: Session[]; error?: string }> {
    const response = await api.get('/sessions');
    return response.data;
  },

  async deleteSession(token: string): Promise<{ success: boolean; error?: string }> {
    const response = await api.delete(`/sessions/${token}`);
    return response.data;
  },

  async deleteAllSessions(): Promise<{ success: boolean; error?: string }> {
    const response = await api.delete('/sessions');
    return response.data;
  },

  async refreshSession(): Promise<{ success: boolean; error?: string }> {
    const response = await api.post('/sessions/refresh');
    return response.data;
  },

  async getSecurityInfo(): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await api.get('/sessions/security');
    return response.data;
  }
};

