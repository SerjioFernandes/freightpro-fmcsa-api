import type { ApiResponse } from '../types/api.types';
import type { Load } from '../types/load.types';
import type { Shipment, ShipmentRequest } from '../types/shipment.types';
import api from './api';

export type DashboardTrendDirection = 'up' | 'down' | 'stable';

export interface DashboardTrendMetric {
  total: number;
  average?: number;
  active?: number;
  completed?: number;
  cancelled?: number;
  trend: DashboardTrendDirection;
  change: number;
}

export interface DashboardTimeSeriesPoint {
  date: string;
  value?: number;
  count?: number;
}

export interface DashboardSummary {
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
}

export interface DashboardStats {
  stats: DashboardSummary;
  analytics?: {
    revenue?: DashboardTrendMetric;
    loads?: DashboardTrendMetric;
  };
  timeSeries?: {
    revenue?: DashboardTimeSeriesPoint[];
    loads?: DashboardTimeSeriesPoint[];
  };
  topEquipment?: Array<{ type: string; count: number }>;
  recentLoads?: Load[];
  recentShipments?: Shipment[];
  recentRequests?: ShipmentRequest[];
}

export const dashboardService = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  }
};
