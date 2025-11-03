import api from './api';

export interface Notification {
  _id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'load_update' | 'message' | 'shipment' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
}

interface NotificationResponse {
  success: boolean;
  data?: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  };
  error?: string;
}

export const notificationService = {
  async getNotifications(
    page: number = 1,
    limit: number = 50,
    filters?: { isRead?: boolean; type?: string; isImportant?: boolean }
  ): Promise<NotificationResponse> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isImportant !== undefined) params.append('isImportant', filters.isImportant.toString());

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  },

  async markAsRead(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ success: boolean; count?: number; error?: string }> {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  async toggleImportant(id: string): Promise<{ success: boolean; data?: Notification; error?: string }> {
    const response = await api.put(`/notifications/${id}/important`);
    return response.data;
  },

  async deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  async deleteAllNotifications(filters?: { isRead?: boolean; type?: string }): Promise<{ success: boolean; count?: number; error?: string }> {
    const params = new URLSearchParams();
    if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters?.type) params.append('type', filters.type);

    const response = await api.delete(`/notifications?${params.toString()}`);
    return response.data;
  },

  async getPreferences(): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await api.get('/notifications/preferences');
    return response.data;
  }
};

