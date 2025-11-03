import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { adminController } from '../controllers/admin.controller.js';

const router = Router();

/**
 * @route   GET /api/admin/seed-loads
 * @desc    Seed demo loads for testing
 * @access  Private (any authenticated user for now)
 */
router.get('/seed-loads', authenticateToken, adminController.seedLoads.bind(adminController));

export default router;

