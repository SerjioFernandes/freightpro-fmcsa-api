import api from './api';

export interface SavedSearchFilters {
  equipment: string[];
  priceMin?: number;
  priceMax?: number;
  originState?: string;
  destinationState?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  radius?: number;
}

export interface SavedSearch {
  _id: string;
  userId: string;
  name: string;
  filters: SavedSearchFilters;
  alertEnabled: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  lastAlertSent?: Date;
  createdAt: string;
}

export interface CreateSavedSearch {
  name: string;
  filters: SavedSearchFilters;
  alertEnabled?: boolean;
  frequency?: 'instant' | 'daily' | 'weekly';
}

export const savedSearchService = {
  async getSearches(): Promise<{ success: boolean; data: SavedSearch[] }> {
    const response = await api.get('/searches');
    return response.data;
  },

  async createSearch(data: CreateSavedSearch): Promise<{ success: boolean; data: SavedSearch }> {
    const response = await api.post('/searches', data);
    return response.data;
  },

  async updateSearch(id: string, data: Partial<CreateSavedSearch>): Promise<{ success: boolean; data: SavedSearch }> {
    const response = await api.put(`/searches/${id}`, data);
    return response.data;
  },

  async toggleAlert(id: string, enabled: boolean): Promise<{ success: boolean; data: SavedSearch }> {
    const response = await api.put(`/searches/${id}/alert`, { enabled });
    return response.data;
  },

  async deleteSearch(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/searches/${id}`);
    return response.data;
  }
};

