import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as settingsController from '../controllers/settings.controller.js';

const router = Router();

// All settings routes require authentication
router.use(authenticateToken);

router.get('/', settingsController.getSettings);
router.put('/profile', settingsController.updateProfile);

export default router;

