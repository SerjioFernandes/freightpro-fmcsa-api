import { Notification, INotification } from '../models/Notification.model.js';
import { Types } from 'mongoose';
import { logger } from '../utils/logger.js';

export interface CreateNotificationData {
  userId: string;
  type: INotification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
  isImportant?: boolean;
  actionUrl?: string;
  expiresIn?: number; // Optional: days until expiration
}

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationData): Promise<INotification> {
    try {
      const notificationData: any = {
        userId: new Types.ObjectId(data.userId),
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        isImportant: data.isImportant || false,
        actionUrl: data.actionUrl
      };

      // Set expiration date if provided
      if (data.expiresIn) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + data.expiresIn);
        notificationData.expiresAt = expiresAt;
      }

      const notification = new Notification(notificationData);
      await notification.save();

      logger.info('Notification created', { userId: data.userId, type: data.type });
      return notification;
    } catch (error: any) {
      logger.error('Failed to create notification', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all notifications for a user (paginated)
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 50,
    filters?: { isRead?: boolean; type?: string; isImportant?: boolean }
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    try {
      const skip = (page - 1) * limit;
      const query: any = { userId: new Types.ObjectId(userId) };

      // Apply filters
      if (filters?.isRead !== undefined) {
        query.isRead = filters.isRead;
      }
      if (filters?.type) {
        query.type = filters.type;
      }
      if (filters?.isImportant !== undefined) {
        query.isImportant = filters.isImportant;
      }

      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .sort({ isImportant: -1, createdAt: -1 }) // Important first, then newest
          .skip(skip)
          .limit(limit),
        Notification.countDocuments(query)
      ]);

      // Get unread count
      const unreadCount = await Notification.countDocuments({ userId: new Types.ObjectId(userId), isRead: false });

      return { notifications: notifications as INotification[], total, unreadCount };
    } catch (error: any) {
      logger.error('Failed to get user notifications', { error: error.message });
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await Notification.findOneAndUpdate(
        { _id: notificationId, userId: new Types.ObjectId(userId) },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      return !!result;
    } catch (error: any) {
      logger.error('Failed to mark notification as read', { error: error.message });
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await Notification.updateMany(
        { userId: new Types.ObjectId(userId), isRead: false },
        { isRead: true, readAt: new Date() }
      );

      logger.info('Marked all notifications as read', { userId, count: result.modifiedCount });
      return result.modifiedCount || 0;
    } catch (error: any) {
      logger.error('Failed to mark all notifications as read', { error: error.message });
      return 0;
    }
  }

  /**
   * Toggle important status
   */
  async toggleImportant(notificationId: string, userId: string): Promise<INotification | null> {
    try {
      const notification = await Notification.findOne({ _id: notificationId, userId: new Types.ObjectId(userId) });
      if (!notification) return null;

      notification.isImportant = !notification.isImportant;
      await notification.save();

      return notification;
    } catch (error: any) {
      logger.error('Failed to toggle notification important status', { error: error.message });
      return null;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await Notification.findOneAndDelete({ _id: notificationId, userId: new Types.ObjectId(userId) });
      return !!result;
    } catch (error: any) {
      logger.error('Failed to delete notification', { error: error.message });
      return false;
    }
  }

  /**
   * Delete all notifications for a user (optional: filter by type or read status)
   */
  async deleteAllNotifications(userId: string, filters?: { isRead?: boolean; type?: string }): Promise<number> {
    try {
      const query: any = { userId: new Types.ObjectId(userId) };
      if (filters?.isRead !== undefined) query.isRead = filters.isRead;
      if (filters?.type) query.type = filters.type;

      const result = await Notification.deleteMany(query);
      logger.info('Deleted notifications', { userId, count: result.deletedCount });
      return result.deletedCount || 0;
    } catch (error: any) {
      logger.error('Failed to delete all notifications', { error: error.message });
      return 0;
    }
  }

  /**
   * Get notification preferences for a user (from User model)
   */
  async getNotificationPreferences(_userId: string): Promise<any> {
    try {
      // This will be implemented by fetching from User model
      // For now, return default preferences
      return {
        emailLoads: true,
        emailBids: true,
        emailRates: false,
        emailUpdates: true,
        emailMarketing: false,
        frequency: 'instant'
      };
    } catch (error: any) {
      logger.error('Failed to get notification preferences', { error: error.message });
      throw error;
    }
  }
}

export const notificationService = new NotificationService();

