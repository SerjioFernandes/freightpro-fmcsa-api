import api from './api';
import type { Load, LoadFormData } from '../types/load.types';
import type { PaginatedResponse, PaginationParams } from '../types/api.types';

type LoadListResponse = PaginatedResponse<Load> & {
  loads?: Load[];
};

export const loadService = {
  async getLoads(page = 1, limit = 20, status = 'available'): Promise<LoadListResponse> {
    const response = await api.get('/loads', {
      params: { page, limit, status },
    });
    const payload = response.data as Partial<LoadListResponse> & {
      data?: Load[] | { loads?: Load[]; pagination?: PaginationParams };
    };

    if (payload.success && payload.data && !Array.isArray(payload.data)) {
      const dataPayload = payload.data as { loads?: Load[]; pagination?: PaginationParams };
      const loads = dataPayload.loads ?? [];
      const pagination = dataPayload.pagination ?? { page, limit, total: loads.length, pages: 1 };
      return {
        success: true,
        data: loads,
        loads,
        pagination,
      };
    }

    const loads = Array.isArray(payload.data)
      ? payload.data
      : (payload.loads ?? []);

    const pagination =
      payload.pagination ??
      (Array.isArray(payload.data)
        ? { page, limit, total: loads.length, pages: loads.length ? Math.max(1, Math.ceil(loads.length / limit)) : 0 }
        : { page, limit, total: loads.length, pages: loads.length ? Math.max(1, Math.ceil(loads.length / limit)) : 0 });

    return {
      success: Boolean(payload.success),
      data: loads,
      loads,
      pagination,
      error: payload.error,
      message: payload.message,
    };
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

