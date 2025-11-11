import { create } from 'zustand';
import type { Load } from '../types/load.types';
import { loadService } from '../services/load.service';
import { getErrorMessage } from '../utils/errors';
import type { PaginationParams } from '../types/api.types';

interface LoadState {
  loads: Load[];
  pagination: PaginationParams | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLoads: (page?: number, limit?: number, status?: string) => Promise<void>;
  bookLoad: (loadId: string) => Promise<void>;
  addLoad: (load: Load) => void;
  updateLoad: (loadId: string, updates: Partial<Load>) => void;
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
        loads: response.loads || [],
        pagination: response.pagination || null,
        isLoading: false,
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to fetch loads');
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  bookLoad: async (loadId) => {
    set({ isLoading: false, error: null }); // Don't set loading to true - let component handle UI state
    try {
      await loadService.bookLoad(loadId);
      // Update the specific load status in the store
      set((state) => ({
        loads: state.loads.map(load => 
          load._id === loadId ? { ...load, status: 'booked' as const } : load
        )
      }));
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to book load');
      set({
        error: message,
      });
      throw error;
    }
  },

  addLoad: (load) => set((state) => ({
    loads: [load, ...state.loads]
  })),

  updateLoad: (loadId, updates) => set((state) => ({
    loads: state.loads.map(load => 
      load._id === loadId ? { ...load, ...updates } : load
    )
  })),

  clearError: () => set({ error: null }),
}));

