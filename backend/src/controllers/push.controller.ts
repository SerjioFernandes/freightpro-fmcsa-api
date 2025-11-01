import { Request, Response } from 'express';
import { PushSubscription } from '../models/PushSubscription.model.js';
import { pushService } from '../services/push.service.js';
import { logger } from '../utils/logger.js';

export const pushController = {
  /**
   * Get VAPID public key
   */
  async getPublicKey(_req: Request, res: Response): Promise<void> {
    try {
      const publicKey = pushService.getPublicKey();
      res.json({ publicKey });
    } catch (error: any) {
      logger.error('Error getting VAPID public key', { error: error.message });
      res.status(500).json({ error: 'Failed to get public key' });
    }
  },

  /**
   * Subscribe to push notifications
   */
  async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const subscription = req.body;

      // Validate subscription
      if (!pushService.isValidSubscription(subscription)) {
        res.status(400).json({ error: 'Invalid subscription object' });
        return;
      }

      // Check if subscription already exists
      const existing = await PushSubscription.findOne({
        userId,
        endpoint: subscription.endpoint
      });

      if (existing) {
        // Update existing subscription
        existing.keys = subscription.keys;
        await existing.save();
        logger.info('Push subscription updated', { userId, endpoint: subscription.endpoint });
      } else {
        // Create new subscription
        await PushSubscription.create({
          userId,
          endpoint: subscription.endpoint,
          keys: subscription.keys
        });
        logger.info('New push subscription created', { userId });
      }

      res.json({ success: true, message: 'Subscribed to push notifications' });
    } catch (error: any) {
      logger.error('Error subscribing to push notifications', { error: error.message });
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  },

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { endpoint } = req.body;

      if (!endpoint) {
        res.status(400).json({ error: 'Endpoint is required' });
        return;
      }

      await PushSubscription.deleteOne({ userId, endpoint });
      logger.info('Push subscription removed', { userId, endpoint });

      res.json({ success: true, message: 'Unsubscribed from push notifications' });
    } catch (error: any) {
      logger.error('Error unsubscribing from push notifications', { error: error.message });
      res.status(500).json({ error: 'Failed to unsubscribe' });
    }
  },

  /**
   * Send test notification (for testing purposes)
   */
  async sendTestNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user's subscriptions
      const subscriptions = await PushSubscription.find({ userId });

      if (subscriptions.length === 0) {
        res.status(404).json({ error: 'No push subscriptions found' });
        return;
      }

      // Send test notification
      const results = await pushService.sendNotificationToMany(
        subscriptions.map(sub => ({
          endpoint: sub.endpoint,
          keys: sub.keys
        })),
        {
          title: 'CargoLume Test Notification',
          body: 'This is a test notification from CargoLume!',
          data: { type: 'test', timestamp: Date.now() }
        }
      );

      res.json({ 
        success: true, 
        message: 'Test notification sent',
        results 
      });
    } catch (error: any) {
      logger.error('Error sending test notification', { error: error.message });
      res.status(500).json({ error: 'Failed to send test notification' });
    }
  }
};

