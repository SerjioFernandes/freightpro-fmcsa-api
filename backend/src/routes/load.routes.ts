import { Router } from 'express';
import { loadController } from '../controllers/load.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

// All load routes require authentication
router.use(authenticateToken);

router.get('/', asyncHandler(loadController.getLoads.bind(loadController)));
router.post('/', asyncHandler(loadController.postLoad.bind(loadController)));
router.post('/:id/book', asyncHandler(loadController.bookLoad.bind(loadController)));

export default router;




