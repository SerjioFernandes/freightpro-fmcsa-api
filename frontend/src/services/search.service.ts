import type { ApiResponse, PaginationParams } from '../types/api.types';
import type { Load } from '../types/load.types';
import api from './api';

export interface LoadSearchFilters {
  query?: string;
  originState?: string;
  destinationState?: string;
  equipment?: string[];
  minRate?: number;
  maxRate?: number;
  minWeight?: number;
  maxWeight?: number;
  status?: string[];
  pickupDateFrom?: string;
  pickupDateTo?: string;
  postedBy?: string;
  bookedBy?: string;
}

export interface LoadSearchPayload {
  loads: Load[];
  pagination: PaginationParams;
  suggestions?: SearchSuggestion[];
}

export interface SearchSuggestion {
  type: 'origin' | 'destination' | 'equipment' | 'city';
  value: string;
  count: number;
}

export interface PopularSearch {
  term: string;
  count: number;
}

export const searchService = {
  async searchLoads(filters: LoadSearchFilters, page = 1, limit = 20): Promise<ApiResponse<LoadSearchPayload>> {
    const response = await api.post<ApiResponse<LoadSearchPayload>>('/search/loads', { ...filters, page, limit });
    return response.data;
  },

  async autocomplete(query: string, type: 'origin' | 'destination' = 'origin', limit: number = 10): Promise<ApiResponse<string[]>> {
    const response = await api.get<ApiResponse<string[]>>(
      `/search/autocomplete?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`
    );
    return response.data;
  },

  async getPopularSearches(limit: number = 20): Promise<ApiResponse<PopularSearch[]>> {
    const response = await api.get<ApiResponse<PopularSearch[]>>(`/search/popular?limit=${limit}`);
    return response.data;
  },

  async getRecentSearches(limit: number = 10): Promise<ApiResponse<string[]>> {
    const response = await api.get<ApiResponse<string[]>>(`/search/recent?limit=${limit}`);
    return response.data;
  },

  async getSuggestions(query: string, limit: number = 10): Promise<ApiResponse<SearchSuggestion[]>> {
    const response = await api.get<ApiResponse<SearchSuggestion[]>>(
      `/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data;
  }
};

