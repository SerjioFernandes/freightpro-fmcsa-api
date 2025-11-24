import { Response } from 'express';
import { notificationService } from '../services/notification.service.js';
import { AuthRequest } from '../types/index.js';
import { NotificationFilter } from '../types/query.types.js';
import { logger } from '../utils/logger.js';

export class NotificationController {
  /**
   * GET /api/notifications
   * Get all notifications for the authenticated user
   */
  async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const filters: NotificationFilter = {};

      if (req.query.isRead !== undefined) {
        filters.isRead = req.query.isRead === 'true';
      }
      if (req.query.type) {
        filters.type = typeof req.query.type === 'string' ? req.query.type : String(req.query.type);
      }
      if (req.query.isImportant !== undefined) {
        filters.isImportant = req.query.isImportant === 'true';
      }

      const result = await notificationService.getUserNotifications(userId, page, limit, filters);

      res.json({
        success: true,
        data: {
          notifications: result.notifications,
          pagination: {
            page,
            limit,
            total: result.total,
            pages: Math.ceil(result.total / limit)
          },
          unreadCount: result.unreadCount
        }
      });
    } catch (error: any) {
      logger.error('Get notifications failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  /**
   * PUT /api/notifications/:id/read
   * Mark a specific notification as read
   */
  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const success = await notificationService.markAsRead(id, userId);

      if (success) {
        res.json({ success: true, message: 'Notification marked as read' });
      } else {
        res.status(404).json({ error: 'Notification not found' });
      }
    } catch (error: any) {
      logger.error('Mark notification as read failed', { error: error.message });
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  /**
   * PUT /api/notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const count = await notificationService.markAllAsRead(userId);

      res.json({ success: true, message: 'All notifications marked as read', count });
    } catch (error: any) {
      logger.error('Mark all notifications as read failed', { error: error.message });
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }

  /**
   * PUT /api/notifications/:id/important
   * Toggle important status
   */
  async toggleImportant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const notification = await notificationService.toggleImportant(id, userId);

      if (notification) {
        res.json({ success: true, data: notification });
      } else {
        res.status(404).json({ error: 'Notification not found' });
      }
    } catch (error: any) {
      logger.error('Toggle notification important failed', { error: error.message });
      res.status(500).json({ error: 'Failed to toggle notification important status' });
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a specific notification
   */
  async deleteNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const success = await notificationService.deleteNotification(id, userId);

      if (success) {
        res.json({ success: true, message: 'Notification deleted' });
      } else {
        res.status(404).json({ error: 'Notification not found' });
      }
    } catch (error: any) {
      logger.error('Delete notification failed', { error: error.message });
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }

  /**
   * DELETE /api/notifications
   * Delete all notifications (optional filters)
   */
  async deleteAllNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const filters: NotificationFilter = {};
      if (req.query.isRead !== undefined) {
        filters.isRead = req.query.isRead === 'true';
      }
      if (req.query.type) {
        filters.type = typeof req.query.type === 'string' ? req.query.type : String(req.query.type);
      }

      const count = await notificationService.deleteAllNotifications(userId, filters);

      res.json({ success: true, message: 'Notifications deleted', count });
    } catch (error: any) {
      logger.error('Delete all notifications failed', { error: error.message });
      res.status(500).json({ error: 'Failed to delete notifications' });
    }
  }

  /**
   * GET /api/notifications/preferences
   * Get notification preferences for the user
   */
  async getPreferences(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const preferences = await notificationService.getNotificationPreferences(userId);

      res.json({ success: true, data: preferences });
    } catch (error: any) {
      logger.error('Get notification preferences failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch notification preferences' });
    }
  }
}

export const notificationController = new NotificationController();

