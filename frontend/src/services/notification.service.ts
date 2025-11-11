import type { ApiResponse, PaginationParams } from '../types/api.types';
import type { NotificationPreferences } from '../types/user.types';
import api from './api';

export interface NotificationPayload {
  notifications: NotificationRecord[];
  pagination: PaginationParams;
  unreadCount: number;
}

export interface NotificationRecord {
  _id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'load_update' | 'message' | 'shipment' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  isImportant?: boolean;
}

export const notificationService = {
  async getNotifications(
    page = 1,
    limit = 50,
    filters?: NotificationFilters
  ): Promise<ApiResponse<NotificationPayload>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isImportant !== undefined) params.append('isImportant', filters.isImportant.toString());

    const response = await api.get<ApiResponse<NotificationPayload>>(`/notifications?${params.toString()}`);
    return response.data;
  },

  async markAsRead(id: string): Promise<ApiResponse<undefined>> {
    const response = await api.put<ApiResponse<undefined>>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<ApiResponse<{ count?: number }>> {
    const response = await api.put<ApiResponse<{ count?: number }>>('/notifications/read-all');
    return response.data;
  },

  async toggleImportant(id: string): Promise<ApiResponse<NotificationRecord>> {
    const response = await api.put<ApiResponse<NotificationRecord>>(`/notifications/${id}/important`);
    return response.data;
  },

  async deleteNotification(id: string): Promise<ApiResponse<undefined>> {
    const response = await api.delete<ApiResponse<undefined>>(`/notifications/${id}`);
    return response.data;
  },

  async deleteAllNotifications(filters?: Pick<NotificationFilters, 'isRead' | 'type'>): Promise<ApiResponse<{ count?: number }>> {
    const params = new URLSearchParams();
    if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters?.type) params.append('type', filters.type);

    const query = params.toString();
    const url = query ? `/notifications?${query}` : '/notifications';
    const response = await api.delete<ApiResponse<{ count?: number }>>(url);
    return response.data;
  },

  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    const response = await api.get<ApiResponse<NotificationPreferences>>('/notifications/preferences');
    return response.data;
  }
};

