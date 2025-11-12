import api from './api';
import type { Load, LoadFormData } from '../types/load.types';
import type { PaginatedResponse } from '../types/api.types';

export const loadService = {
  async getLoads(page = 1, limit = 20, status = 'available'): Promise<PaginatedResponse<Load>> {
    const response = await api.get('/loads', {
      params: { page, limit, status },
    });
    // Handle both response formats: { success, data: { loads, pagination } } or { loads, pagination }
    if (response.data.success && response.data.data) {
      return {
        loads: response.data.data.loads || [],
        pagination: response.data.data.pagination || { page, limit, total: 0, pages: 0 },
        success: true
      };
    }
    return response.data;
  },

  async postLoad(data: LoadFormData): Promise<{ success: boolean; load: Load; message: string }> {
    const response = await api.post('/loads', data);
    return response.data;
  },

  async bookLoad(
    loadId: string,
    payload?: { agreedRate?: number; bookingNotes?: string }
  ): Promise<{ success: boolean; load: Load; message: string }> {
    const response = await api.post(`/loads/${loadId}/book`, payload ?? {});
    return response.data;
  },
};

