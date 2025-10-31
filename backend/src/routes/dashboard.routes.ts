import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// GET /api/dashboard/stats - Get account-specific stats
router.get('/stats', asyncHandler(dashboardController.getStats.bind(dashboardController)));

export default router;
