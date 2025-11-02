import { Load } from '../models/Load.model.js';
import { Shipment } from '../models/Shipment.model.js';
import { logger } from '../utils/logger.js';
import type { AccountType } from '../types/index.js';

export interface TimeSeriesData {
  date: string;
  value: number;
  count?: number;
}

export interface RevenueAnalytics {
  total: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface LoadAnalytics {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

class AnalyticsService {
  /**
   * Get revenue time series for a carrier
   */
  async getCarrierRevenueTimeSeries(carrierId: string, days: number = 30): Promise<TimeSeriesData[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const loads = await Load.find({
        bookedBy: carrierId,
        status: { $nin: ['available', 'cancelled'] },
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      // Group by date
      const dataMap = new Map<string, number>();

      loads.forEach(load => {
        const date = new Date(load.createdAt).toISOString().split('T')[0];
        const currentValue = dataMap.get(date) || 0;
        dataMap.set(date, currentValue + (load.rate || 0));
      });

      // Fill missing dates with 0
      const result: TimeSeriesData[] = [];
      const today = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          value: dataMap.get(dateStr) || 0,
          count: 0
        });
      }

      return result;
    } catch (error: any) {
      logger.error('Get carrier revenue time series failed', { error: error.message });
      return [];
    }
  }

  /**
   * Get load count time series for a carrier
   */
  async getCarrierLoadCountTimeSeries(carrierId: string, days: number = 30): Promise<TimeSeriesData[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const loads = await Load.find({
        bookedBy: carrierId,
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      // Group by date
      const dataMap = new Map<string, number>();

      loads.forEach(load => {
        const date = new Date(load.createdAt).toISOString().split('T')[0];
        const currentCount = dataMap.get(date) || 0;
        dataMap.set(date, currentCount + 1);
      });

      // Fill missing dates with 0
      const result: TimeSeriesData[] = [];
      const today = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          value: 0,
          count: dataMap.get(dateStr) || 0
        });
      }

      return result;
    } catch (error: any) {
      logger.error('Get carrier load count time series failed', { error: error.message });
      return [];
    }
  }

  /**
   * Get revenue analytics for a carrier
   */
  async getCarrierRevenueAnalytics(carrierId: string, days: number = 30): Promise<RevenueAnalytics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const currentPeriodLoads = await Load.find({
        bookedBy: carrierId,
        status: { $nin: ['available', 'cancelled'] },
        createdAt: { $gte: startDate }
      });

      const previousStartDate = new Date();
      previousStartDate.setDate(previousStartDate.getDate() - (days * 2));

      const previousPeriodLoads = await Load.find({
        bookedBy: carrierId,
        status: { $nin: ['available', 'cancelled'] },
        createdAt: { $gte: previousStartDate, $lt: startDate }
      });

      const currentTotal = currentPeriodLoads.reduce((sum, load) => sum + (load.rate || 0), 0);
      const previousTotal = previousPeriodLoads.reduce((sum, load) => sum + (load.rate || 0), 0);
      const average = currentPeriodLoads.length > 0 ? Math.round(currentTotal / currentPeriodLoads.length) : 0;
      const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (change > 5) trend = 'up';
      else if (change < -5) trend = 'down';

      return {
        total: currentTotal,
        average,
        trend,
        change: Math.round(change * 10) / 10
      };
    } catch (error: any) {
      logger.error('Get carrier revenue analytics failed', { error: error.message });
      return { total: 0, average: 0, trend: 'stable', change: 0 };
    }
  }

  /**
   * Get load analytics for a carrier
   */
  async getCarrierLoadAnalytics(carrierId: string, days: number = 30): Promise<LoadAnalytics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const currentPeriodLoads = await Load.find({
        bookedBy: carrierId,
        createdAt: { $gte: startDate }
      });

      const previousStartDate = new Date();
      previousStartDate.setDate(previousStartDate.getDate() - (days * 2));

      const previousPeriodLoads = await Load.find({
        bookedBy: carrierId,
        createdAt: { $gte: previousStartDate, $lt: startDate }
      });

      const active = currentPeriodLoads.filter(load => ['booked', 'in_transit'].includes(load.status)).length;
      const completed = currentPeriodLoads.filter(load => load.status === 'delivered').length;
      const cancelled = currentPeriodLoads.filter(load => load.status === 'cancelled').length;
      const change = previousPeriodLoads.length > 0 ? ((currentPeriodLoads.length - previousPeriodLoads.length) / previousPeriodLoads.length) * 100 : 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (change > 5) trend = 'up';
      else if (change < -5) trend = 'down';

      return {
        total: currentPeriodLoads.length,
        active,
        completed,
        cancelled,
        trend,
        change: Math.round(change * 10) / 10
      };
    } catch (error: any) {
      logger.error('Get carrier load analytics failed', { error: error.message });
      return { total: 0, active: 0, completed: 0, cancelled: 0, trend: 'stable', change: 0 };
    }
  }

  /**
   * Get broker posted loads time series
   */
  async getBrokerLoadsTimeSeries(brokerId: string, days: number = 30): Promise<TimeSeriesData[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const loads = await Load.find({
        postedBy: brokerId,
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      const dataMap = new Map<string, number>();

      loads.forEach(load => {
        const date = new Date(load.createdAt).toISOString().split('T')[0];
        const currentCount = dataMap.get(date) || 0;
        dataMap.set(date, currentCount + 1);
      });

      const result: TimeSeriesData[] = [];
      const today = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          value: 0,
          count: dataMap.get(dateStr) || 0
        });
      }

      return result;
    } catch (error: any) {
      logger.error('Get broker loads time series failed', { error: error.message });
      return [];
    }
  }

  /**
   * Get shipper shipments time series
   */
  async getShipperShipmentsTimeSeries(shipperId: string, days: number = 30): Promise<TimeSeriesData[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const shipments = await Shipment.find({
        postedBy: shipperId,
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      const dataMap = new Map<string, number>();

      shipments.forEach(shipment => {
        const date = new Date(shipment.createdAt).toISOString().split('T')[0];
        const currentCount = dataMap.get(date) || 0;
        dataMap.set(date, currentCount + 1);
      });

      const result: TimeSeriesData[] = [];
      const today = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          value: 0,
          count: dataMap.get(dateStr) || 0
        });
      }

      return result;
    } catch (error: any) {
      logger.error('Get shipper shipments time series failed', { error: error.message });
      return [];
    }
  }

  /**
   * Get top equipment types by usage
   */
  async getTopEquipmentTypes(userId: string, accountType: AccountType, limit: number = 5): Promise<Array<{ type: string; count: number }>> {
    try {
      if (accountType === 'carrier') {
        const loads = await Load.find({
          bookedBy: userId,
          status: { $nin: ['available', 'cancelled'] }
        });

        const equipmentCounts = new Map<string, number>();

        loads.forEach(load => {
          const type = load.equipmentType || 'Unknown';
          equipmentCounts.set(type, (equipmentCounts.get(type) || 0) + 1);
        });

        return Array.from(equipmentCounts.entries())
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      } else if (accountType === 'broker') {
        const loads = await Load.find({
          postedBy: userId
        });

        const equipmentCounts = new Map<string, number>();

        loads.forEach(load => {
          const type = load.equipmentType || 'Unknown';
          equipmentCounts.set(type, (equipmentCounts.get(type) || 0) + 1);
        });

        return Array.from(equipmentCounts.entries())
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      }

      return [];
    } catch (error: any) {
      logger.error('Get top equipment types failed', { error: error.message });
      return [];
    }
  }
}

export const analyticsService = new AnalyticsService();

