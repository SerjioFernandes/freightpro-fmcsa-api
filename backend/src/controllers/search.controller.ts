import { Response } from 'express';
import { searchService, SearchFilters } from '../services/search.service.js';
import { AuthRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class SearchController {
  /**
   * POST /api/search/loads
   * Advanced search for loads
   */
  async searchLoads(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.body.page || req.query.page as string) || 1;
      const limit = parseInt(req.body.limit || req.query.limit as string) || 20;
      
      const filters: SearchFilters = {
        query: req.body.query || req.query.query,
        originState: req.body.originState || req.query.originState,
        destinationState: req.body.destinationState || req.query.destinationState,
        equipment: req.body.equipment || req.query.equipment,
        minRate: req.body.minRate ? parseFloat(req.body.minRate) : undefined,
        maxRate: req.body.maxRate ? parseFloat(req.body.maxRate) : undefined,
        minWeight: req.body.minWeight ? parseFloat(req.body.minWeight) : undefined,
        maxWeight: req.body.maxWeight ? parseFloat(req.body.maxWeight) : undefined,
        status: req.body.status || req.query.status,
        pickupDateFrom: req.body.pickupDateFrom ? new Date(req.body.pickupDateFrom) : undefined,
        pickupDateTo: req.body.pickupDateTo ? new Date(req.body.pickupDateTo) : undefined,
        postedBy: req.body.postedBy || req.query.postedBy,
        bookedBy: req.body.bookedBy || req.query.bookedBy
      };

      const result = await searchService.searchLoads(filters, page, limit);

      res.json({
        success: true,
        data: {
          loads: result.loads,
          pagination: {
            page,
            limit,
            total: result.total,
            pages: Math.ceil(result.total / limit)
          },
          suggestions: result.suggestions
        }
      });
    } catch (error: any) {
      logger.error('Search loads failed', { error: error.message });
      res.status(500).json({ error: 'Failed to search loads' });
    }
  }

  /**
   * GET /api/search/autocomplete
   * Autocomplete for city/state searches
   */
  async autocomplete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = req.query.q as string || '';
      const type = (req.query.type as 'origin' | 'destination') || 'origin';
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || query.length < 2) {
        res.json({ success: true, data: [] });
        return;
      }

      const results = await searchService.autocompleteCityState(query, type, limit);

      res.json({ success: true, data: results });
    } catch (error: any) {
      logger.error('Autocomplete failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get autocomplete suggestions' });
    }
  }

  /**
   * GET /api/search/popular
   * Get popular search terms
   */
  async getPopularSearches(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      const results = await searchService.getPopularSearches(limit);

      res.json({ success: true, data: results });
    } catch (error: any) {
      logger.error('Get popular searches failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get popular searches' });
    }
  }

  /**
   * GET /api/search/recent
   * Get recent searches for the user
   */
  async getRecentSearches(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const results = await searchService.getRecentSearches(userId, limit);

      res.json({ success: true, data: results });
    } catch (error: any) {
      logger.error('Get recent searches failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get recent searches' });
    }
  }

  /**
   * GET /api/search/suggestions
   * Get search suggestions based on query
   */
  async getSuggestions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = req.query.q as string || '';
      const limit = parseInt(req.query.limit as string) || 10;

      const results = await searchService.generateSuggestions(query, limit);

      res.json({ success: true, data: results });
    } catch (error: any) {
      logger.error('Get suggestions failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get suggestions' });
    }
  }
}

export const searchController = new SearchController();

