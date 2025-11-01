import webpush from 'web-push';
import { config } from '../config/environment.js';
import { logger } from '../utils/logger.js';

// Generate VAPID keys (run once and store in environment variables)
// const vapidKeys = webpush.generateVAPIDKeys();
// console.log('VAPID Public Key:', vapidKeys.publicKey);
// console.log('VAPID Private Key:', vapidKeys.privateKey);

const VAPID_PUBLIC_KEY = config.VAPID_PUBLIC_KEY || 'BGm9l0q2qJxDN-HbG4wV3XPq5xBd8q3jUxfS7yh9DZvJzW5F8HjKdN3QrLpW6XtY4vZ1Aa2Bb3Cc4Dd5Ee6Ff7Gg8';
const VAPID_PRIVATE_KEY = config.VAPID_PRIVATE_KEY || 'GENERATE_YOUR_OWN_VAPID_KEYS';
const VAPID_SUBJECT = config.VAPID_SUBJECT || 'mailto:admin@cargolume.com';

// Configure web-push
webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{ action: string; title: string }>;
}

class PushService {
  /**
   * Send push notification to a specific subscription
   */
  async sendNotification(
    subscription: PushSubscription,
    notification: PushNotification
  ): Promise<void> {
    try {
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/assets/icons/icon-192.png',
        badge: notification.badge || '/assets/icons/badge-72.png',
        data: notification.data || {},
        actions: notification.actions || []
      });

      await webpush.sendNotification(subscription, payload);
      logger.info('Push notification sent successfully', { 
        endpoint: subscription.endpoint.substring(0, 50) + '...'
      });
    } catch (error: any) {
      logger.error('Failed to send push notification', { error: error.message });
      
      // Handle different error codes
      if (error.statusCode === 410) {
        logger.warn('Push subscription expired', { endpoint: subscription.endpoint });
        // TODO: Remove expired subscription from database
      }
      
      throw error;
    }
  }

  /**
   * Send notification to multiple subscriptions
   */
  async sendNotificationToMany(
    subscriptions: PushSubscription[],
    notification: PushNotification
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = subscriptions.map(async (subscription) => {
      try {
        await this.sendNotification(subscription, notification);
        success++;
      } catch (error) {
        failed++;
      }
    });

    await Promise.all(promises);

    logger.info('Batch push notification complete', { success, failed });
    return { success, failed };
  }

  /**
   * Get VAPID public key for frontend
   */
  getPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }

  /**
   * Validate subscription object
   */
  isValidSubscription(subscription: any): subscription is PushSubscription {
    return (
      subscription &&
      typeof subscription.endpoint === 'string' &&
      subscription.keys &&
      typeof subscription.keys.p256dh === 'string' &&
      typeof subscription.keys.auth === 'string'
    );
  }
}

export const pushService = new PushService();

