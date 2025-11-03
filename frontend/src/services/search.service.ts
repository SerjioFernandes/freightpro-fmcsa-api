import api from './api';

export const searchService = {
  async searchLoads(filters: any, page: number = 1, limit: number = 20): Promise<any> {
    const response = await api.post('/search/loads', { ...filters, page, limit });
    return response.data;
  },

  async autocomplete(query: string, type: 'origin' | 'destination' = 'origin', limit: number = 10): Promise<any> {
    const response = await api.get(`/search/autocomplete?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
    return response.data;
  },

  async getPopularSearches(limit: number = 20): Promise<any> {
    const response = await api.get(`/search/popular?limit=${limit}`);
    return response.data;
  },

  async getRecentSearches(limit: number = 10): Promise<any> {
    const response = await api.get(`/search/recent?limit=${limit}`);
    return response.data;
  },

  async getSuggestions(query: string, limit: number = 10): Promise<any> {
    const response = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  }
};

