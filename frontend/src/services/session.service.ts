import type { ApiResponse } from '../types/api.types';
import api from './api';

export interface Session {
  token: string;
  device: string;
  ip: string;
  userAgent?: string;
  lastActivity: string;
  createdAt: string;
}

export interface SessionSecurityInfo {
  totalSessions: number;
  suspiciousIPs: string[];
  hasSuspiciousActivity: boolean;
}

export const sessionService = {
  async getSessions(): Promise<ApiResponse<Session[]>> {
    const response = await api.get<ApiResponse<Session[]>>('/sessions');
    return response.data;
  },

  async deleteSession(token: string): Promise<ApiResponse<undefined>> {
    const response = await api.delete<ApiResponse<undefined>>(`/sessions/${token}`);
    return response.data;
  },

  async deleteAllSessions(): Promise<ApiResponse<undefined>> {
    const response = await api.delete<ApiResponse<undefined>>('/sessions');
    return response.data;
  },

  async refreshSession(): Promise<ApiResponse<undefined>> {
    const response = await api.post<ApiResponse<undefined>>('/sessions/refresh');
    return response.data;
  },

  async getSecurityInfo(): Promise<ApiResponse<SessionSecurityInfo>> {
    const response = await api.get<ApiResponse<SessionSecurityInfo>>('/sessions/security');
    return response.data;
  }
};

