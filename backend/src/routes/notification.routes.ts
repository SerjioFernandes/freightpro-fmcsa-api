import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

// All notification routes require authentication
router.use(authenticateToken);

// GET /api/notifications - Get all notifications
router.get('/', asyncHandler(notificationController.getNotifications.bind(notificationController)));

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', asyncHandler(notificationController.markAsRead.bind(notificationController)));

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', asyncHandler(notificationController.markAllAsRead.bind(notificationController)));

// PUT /api/notifications/:id/important - Toggle important status
router.put('/:id/important', asyncHandler(notificationController.toggleImportant.bind(notificationController)));

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', asyncHandler(notificationController.deleteNotification.bind(notificationController)));

// DELETE /api/notifications - Delete all notifications
router.delete('/', asyncHandler(notificationController.deleteAllNotifications.bind(notificationController)));

// GET /api/notifications/preferences - Get notification preferences
router.get('/preferences', asyncHandler(notificationController.getPreferences.bind(notificationController)));

export default router;

