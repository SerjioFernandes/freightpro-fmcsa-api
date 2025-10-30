import { Router } from 'express';
import { loadController } from '../controllers/load.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireBrokerOrCarrier, requireBroker, requireCarrier } from '../middleware/authorization.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

// All load routes require authentication
router.use(authenticateToken);

// GET /api/loads - View loads (carriers & brokers only)
router.get('/', requireBrokerOrCarrier, asyncHandler(loadController.getLoads.bind(loadController)));

// POST /api/loads - Post new load (brokers only)
router.post('/', requireBroker, asyncHandler(loadController.postLoad.bind(loadController)));

// POST /api/loads/:id/book - Book a load (carriers only)
router.post('/:id/book', requireCarrier, asyncHandler(loadController.bookLoad.bind(loadController)));

export default router;




