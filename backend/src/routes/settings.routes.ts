import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { uploadAvatar } from '../middleware/upload.middleware.js';
import * as settingsController from '../controllers/settings.controller.js';

const router = Router();

// All settings routes require authentication
router.use(authenticateToken);

router.get('/', settingsController.getSettings);
router.put('/profile', settingsController.updateProfile);
router.put('/password', settingsController.validatePassword, settingsController.changePassword);
router.put('/notifications', settingsController.updateNotificationSettings);
router.post('/avatar', uploadAvatar.single('avatar'), settingsController.uploadAvatar);

export default router;

