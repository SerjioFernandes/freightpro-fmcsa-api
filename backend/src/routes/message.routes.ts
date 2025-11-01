import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as messageController from '../controllers/message.controller.js';

const router = Router();

// All message routes require authentication
router.use(authenticateToken);

router.get('/conversations', messageController.getConversations);
router.get('/conversation/:userId', messageController.getConversation);
router.post('/send', messageController.sendMessage);
router.get('/unread-count', messageController.getUnreadCount);
router.put('/:id/edit', messageController.editMessage);
router.delete('/:id', messageController.deleteMessage);

export default router;

