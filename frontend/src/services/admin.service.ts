import api from './api';
import type {
  AdminUserResponse,
  AdminUserDetailsResponse,
  AdminAuditLogResponse,
  AdminSystemStatsResponse,
  AdminUser,
} from '../types/admin.types';

export interface AdminUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  accountType?: string;
  role?: string;
  isActive?: boolean;
}

export const adminService = {
  async getUsers(params: AdminUserQuery = {}): Promise<AdminUserResponse> {
    const response = await api.get<AdminUserResponse>('/admin/users', { params });
    return response.data;
  },

  async getUser(id: string): Promise<AdminUserDetailsResponse> {
    const response = await api.get<AdminUserDetailsResponse>(`/admin/users/${id}`);
    return response.data;
  },

  async updateUser(id: string, data: Record<string, unknown>): Promise<AdminUserDetailsResponse> {
    const response = await api.put<AdminUserDetailsResponse>(`/admin/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await api.delete<{ success: boolean; message?: string }>(`/admin/users/${id}`);
    return response.data;
  },

  async exportUsers(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await api.get(`/admin/export/users`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  async fetchUsersDataset(): Promise<{ exportDate: string; totalUsers: number; users: AdminUser[] }> {
    const response = await api.get<{ exportDate: string; totalUsers: number; users: AdminUser[] }>('/admin/export/users', {
      params: { format: 'json' },
      responseType: 'json',
    });
    return response.data;
  },

  async exportLoadsCsv(): Promise<Blob> {
    const response = await api.get('/admin/export/loads', {
      params: { format: 'csv' },
      responseType: 'blob',
    });
    return response.data;
  },

  async exportShipmentsCsv(): Promise<Blob> {
    const response = await api.get('/admin/export/shipments', {
      params: { format: 'csv' },
      responseType: 'blob',
    });
    return response.data;
  },

  async fetchLoadsDataset(): Promise<{ exportDate: string; totalLoads: number; loads: Record<string, unknown>[] }> {
    const response = await api.get<{ exportDate: string; totalLoads: number; loads: Record<string, unknown>[] }>('/admin/export/loads', {
      params: { format: 'json' },
    });
    return response.data;
  },

  async fetchShipmentsDataset(): Promise<{ exportDate: string; totalShipments: number; shipments: Record<string, unknown>[] }> {
    const response = await api.get<{ exportDate: string; totalShipments: number; shipments: Record<string, unknown>[] }>('/admin/export/shipments', {
      params: { format: 'json' },
    });
    return response.data;
  },

  async getSystemStats(): Promise<AdminSystemStatsResponse> {
    const response = await api.get<AdminSystemStatsResponse>('/admin/system-stats');
    return response.data;
  },

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
    collection?: string;
    adminId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}): Promise<AdminAuditLogResponse> {
    const response = await api.get<AdminAuditLogResponse>('/admin/audit-logs', { params });
    return response.data;
  },

  async purgeAuditLogs(retentionDays: number): Promise<{ success: boolean; deleted: number }> {
    const response = await api.delete<{ success: boolean; deleted: number }>(`/admin/audit-logs/purge/${retentionDays}`);
    return response.data;
  },

  async seedLoads(): Promise<{ success: boolean; message?: string }> {
    const response = await api.get<{ success: boolean; message?: string }>('/admin/seed-loads');
    return response.data;
  },
};


