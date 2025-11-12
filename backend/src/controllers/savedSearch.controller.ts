import { Response } from 'express';
import { SavedSearch } from '../models/SavedSearch.model.js';
import { AuthRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class SavedSearchController {
  /**
   * Get all saved searches for current user
   * GET /api/searches
   */
  async getSearches(req: AuthRequest, res: Response): Promise<void> {
    try {
      const searches = await SavedSearch.find({ userId: req.user?.userId })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: searches
      });
    } catch (error: any) {
      logger.error('Get saved searches failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch saved searches' });
    }
  }

  /**
   * Create a new saved search
   * POST /api/searches
   */
  async createSearch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, filters, alertEnabled, frequency } = req.body;

      if (!name || !filters) {
        res.status(400).json({ error: 'Name and filters are required' });
        return;
      }

      const search = new SavedSearch({
        userId: req.user?.userId,
        name,
        filters,
        alertEnabled: alertEnabled !== undefined ? alertEnabled : true,
        frequency: frequency || 'instant'
      });

      await search.save();

      res.status(201).json({
        success: true,
        message: 'Saved search created successfully',
        data: search
      });
    } catch (error: any) {
      logger.error('Create saved search failed', { error: error.message });
      res.status(500).json({ error: 'Failed to create saved search' });
    }
  }

  /**
   * Update a saved search
   * PUT /api/searches/:id
   */
  async updateSearch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, filters, alertEnabled, frequency } = req.body;

      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (filters !== undefined) updates.filters = filters;
      if (alertEnabled !== undefined) updates.alertEnabled = alertEnabled;
      if (frequency !== undefined) updates.frequency = frequency;

      const search = await SavedSearch.findOneAndUpdate(
        { _id: req.params.id, userId: req.user?.userId },
        updates,
        { new: true, runValidators: true }
      );

      if (!search) {
        res.status(404).json({ error: 'Saved search not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Saved search updated successfully',
        data: search
      });
    } catch (error: any) {
      logger.error('Update saved search failed', { error: error.message });
      res.status(500).json({ error: 'Failed to update saved search' });
    }
  }

  /**
   * Toggle alert for a saved search
   * PUT /api/searches/:id/alert
   */
  async toggleAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { enabled } = req.body;

      const search = await SavedSearch.findOneAndUpdate(
        { _id: req.params.id, userId: req.user?.userId },
        { alertEnabled: enabled },
        { new: true }
      );

      if (!search) {
        res.status(404).json({ error: 'Saved search not found' });
        return;
      }

      res.json({
        success: true,
        message: `Alerts ${enabled ? 'enabled' : 'disabled'} for saved search`,
        data: search
      });
    } catch (error: any) {
      logger.error('Toggle alert failed', { error: error.message });
      res.status(500).json({ error: 'Failed to toggle alert' });
    }
  }

  /**
   * Delete a saved search
   * DELETE /api/searches/:id
   */
  async deleteSearch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const search = await SavedSearch.findOneAndDelete({
        _id: req.params.id,
        userId: req.user?.userId
      });

      if (!search) {
        res.status(404).json({ error: 'Saved search not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Saved search deleted successfully'
      });
    } catch (error: any) {
      logger.error('Delete saved search failed', { error: error.message });
      res.status(500).json({ error: 'Failed to delete saved search' });
    }
  }
}

export const savedSearchController = new SavedSearchController();

