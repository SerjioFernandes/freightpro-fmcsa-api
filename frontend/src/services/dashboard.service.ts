import api from './api';

export interface DashboardStats {
  stats: {
    totalBooked?: number;
    totalEarnings?: number;
    totalMiles?: number;
    activeLoads?: number;
    averageRate?: number;
    rating?: string;
    totalPosted?: number;
    carrierRequests?: number;
    potentialRevenue?: number;
    totalShipments?: number;
    activeShipments?: number;
    totalProposals?: number;
    totalSpend?: number;
  };
  analytics?: {
    revenue?: {
      total: number;
      average: number;
      trend: 'up' | 'down' | 'stable';
      change: number;
    };
    loads?: {
      total: number;
      active: number;
      completed: number;
      cancelled: number;
      trend: 'up' | 'down' | 'stable';
      change: number;
    };
  };
  timeSeries?: {
    revenue?: Array<{ date: string; value: number }>;
    loads?: Array<{ date: string; count: number }>;
  };
  topEquipment?: Array<{ type: string; count: number }>;
  recentLoads?: any[];
  recentShipments?: any[];
  recentRequests?: any[];
}

export const dashboardService = {
  async getStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};

