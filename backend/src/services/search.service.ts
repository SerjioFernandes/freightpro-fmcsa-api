import { Load } from '../models/Load.model.js';
import { logger } from '../utils/logger.js';

export interface SearchFilters {
  query?: string;
  originState?: string;
  destinationState?: string;
  equipment?: string[];
  minRate?: number;
  maxRate?: number;
  minWeight?: number;
  maxWeight?: number;
  status?: string[];
  pickupDateFrom?: Date;
  pickupDateTo?: Date;
  postedBy?: string;
  bookedBy?: string;
}

export interface SearchSuggestion {
  type: 'origin' | 'destination' | 'equipment' | 'city';
  value: string;
  count: number;
}

class SearchService {
  /**
   * Advanced search with multiple filters and relevance scoring
   */
  async searchLoads(filters: SearchFilters, page: number = 1, limit: number = 20): Promise<{
    loads: any[];
    total: number;
    suggestions?: SearchSuggestion[];
  }> {
    try {
      const skip = (page - 1) * limit;
      const query: any = { status: { $ne: 'cancelled' } }; // Exclude cancelled loads by default

      // Text search
      if (filters.query) {
        query.$text = { $search: filters.query };
      }

      // Origin/Destination filters
      if (filters.originState) {
        query['origin.state'] = filters.originState;
      }
      if (filters.destinationState) {
        query['destination.state'] = filters.destinationState;
      }

      // Equipment type filter
      if (filters.equipment && filters.equipment.length > 0) {
        query.equipmentType = { $in: filters.equipment };
      }

      // Rate range filter
      if (filters.minRate || filters.maxRate) {
        query.rate = {};
        if (filters.minRate) query.rate.$gte = filters.minRate;
        if (filters.maxRate) query.rate.$lte = filters.maxRate;
      }

      // Weight range filter
      if (filters.minWeight || filters.maxWeight) {
        query.weight = {};
        if (filters.minWeight) query.weight.$gte = filters.minWeight;
        if (filters.maxWeight) query.weight.$lte = filters.maxWeight;
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        query.status = { $in: filters.status };
      }

      // Pickup date range filter
      if (filters.pickupDateFrom || filters.pickupDateTo) {
        query.pickupDate = {};
        if (filters.pickupDateFrom) query.pickupDate.$gte = filters.pickupDateFrom;
        if (filters.pickupDateTo) query.pickupDate.$lte = filters.pickupDateTo;
      }

      // Posted by filter
      if (filters.postedBy) {
        query.postedBy = filters.postedBy;
      }

      // Booked by filter
      if (filters.bookedBy) {
        query.bookedBy = filters.bookedBy;
      }

      // Execute search with relevance scoring if text search is used
      const sort: any = { createdAt: -1 };
      if (filters.query) {
        sort.score = { $meta: 'textScore' }; // Sort by relevance score
      }

      const [loads, total] = await Promise.all([
        Load.find(query)
          .populate('postedBy', 'company email accountType')
          .populate('bookedBy', 'company email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Load.countDocuments(query)
      ]);

      // Generate search suggestions based on popular results
      const suggestions = filters.query ? await this.generateSuggestions(filters.query) : undefined;

      return { loads, total, suggestions };
    } catch (error: any) {
      logger.error('Search loads failed', { error: error.message });
      return { loads: [], total: 0 };
    }
  }

  /**
   * Generate search suggestions based on query
   */
  async generateSuggestions(_query: string, _limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      const suggestions: SearchSuggestion[] = [];

      // Get popular origin states
      const originStates = await Load.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: '$origin.state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      suggestions.push(...originStates.map(s => ({
        type: 'origin' as const,
        value: s._id,
        count: s.count
      })));

      // Get popular destination states
      const destinationStates = await Load.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: '$destination.state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      suggestions.push(...destinationStates.map(s => ({
        type: 'destination' as const,
        value: s._id,
        count: s.count
      })));

      // Get popular equipment types
      const equipmentTypes = await Load.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: '$equipmentType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      suggestions.push(...equipmentTypes.map(s => ({
        type: 'equipment' as const,
        value: s._id,
        count: s.count
      })));

      return suggestions.slice(0, _limit);
    } catch (error: any) {
      logger.error('Generate search suggestions failed', { error: error.message });
      return [];
    }
  }

  /**
   * Autocomplete for city/state searches
   */
  async autocompleteCityState(query: string, type: 'origin' | 'destination' = 'origin', limit: number = 10): Promise<string[]> {
    try {
      const field = type === 'origin' ? 'origin' : 'destination';
      const regex = new RegExp(query, 'i');

      const results = await Load.aggregate([
        {
          $match: {
            status: { $ne: 'cancelled' },
            [`${field}.city`]: { $regex: regex }
          }
        },
        {
          $group: {
            _id: {
              city: `$${field}.city`,
              state: `$${field}.state`
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            _id: 0,
            value: { $concat: ['$_id.city', ', ', '$_id.state'] }
          }
        }
      ]);

      return results.map(r => r.value);
    } catch (error: any) {
      logger.error('Autocomplete city/state failed', { error: error.message });
      return [];
    }
  }

  /**
   * Get recently searched terms (requires a separate model if tracking searches)
   */
  async getRecentSearches(_userId: string, _limit: number = 10): Promise<string[]> {
    try {
      // TODO: Implement search history tracking
      // This would require a separate SearchHistory model
      return [];
    } catch (error: any) {
      logger.error('Get recent searches failed', { error: error.message });
      return [];
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearches(limit: number = 20): Promise<Array<{ term: string; count: number }>> {
    try {
      // Get popular equipment types
      const popularEquipment = await Load.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: '$equipmentType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);

      return popularEquipment.map(item => ({
        term: item._id,
        count: item.count
      }));
    } catch (error: any) {
      logger.error('Get popular searches failed', { error: error.message });
      return [];
    }
  }
}

export const searchService = new SearchService();

