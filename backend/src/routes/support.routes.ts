import { Router } from 'express';
import * as supportController from '../controllers/support.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/chat', supportController.chat);
router.use(authenticateToken);
router.get('/tickets', supportController.listTickets);
router.post('/tickets', supportController.createTicket);

export default router;

