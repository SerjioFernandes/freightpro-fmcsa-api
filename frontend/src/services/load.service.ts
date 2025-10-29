import api from './api';
import type { Load, LoadFormData } from '../types/load.types';
import type { PaginatedResponse } from '../types/api.types';

export const loadService = {
  async getLoads(page = 1, limit = 20, status = 'available'): Promise<PaginatedResponse<Load>> {
    const response = await api.get('/loads', {
      params: { page, limit, status },
    });
    return response.data;
  },

  async postLoad(data: LoadFormData): Promise<{ success: boolean; load: Load; message: string }> {
    const response = await api.post('/loads', data);
    return response.data;
  },

  async bookLoad(loadId: string): Promise<{ success: boolean; load: Load; message: string }> {
    const response = await api.post(`/loads/${loadId}/book`);
    return response.data;
  },
};

