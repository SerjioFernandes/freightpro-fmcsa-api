import { Router } from 'express';
import { pushController } from '../controllers/push.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Get VAPID public key (public route)
router.get('/public-key', pushController.getPublicKey);

// Subscribe to push notifications
router.post('/subscribe', authenticateToken, pushController.subscribe);

// Unsubscribe from push notifications
router.post('/unsubscribe', authenticateToken, pushController.unsubscribe);

// Send test notification
router.post('/test', authenticateToken, pushController.sendTestNotification);

export default router;

