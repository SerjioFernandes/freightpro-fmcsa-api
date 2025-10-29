import { create } from 'zustand';
import type { Load } from '../types/load.types';
import { loadService } from '../services/load.service';
import type { PaginationParams } from '../types/api.types';

interface LoadState {
  loads: Load[];
  pagination: PaginationParams | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLoads: (page?: number, limit?: number, status?: string) => Promise<void>;
  bookLoad: (loadId: string) => Promise<void>;
  clearError: () => void;
}

export const useLoadStore = create<LoadState>((set) => ({
  loads: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchLoads: async (page = 1, limit = 20, status = 'available') => {
    set({ isLoading: true, error: null });
    try {
      const response = await loadService.getLoads(page, limit, status);
      set({
        loads: (response as any).loads || response.data || [],
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch loads',
        isLoading: false,
      });
    }
  },

  bookLoad: async (loadId) => {
    set({ isLoading: true, error: null });
    try {
      await loadService.bookLoad(loadId);
      // Refresh loads after booking
      const state = useLoadStore.getState();
      await state.fetchLoads();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to book load',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

