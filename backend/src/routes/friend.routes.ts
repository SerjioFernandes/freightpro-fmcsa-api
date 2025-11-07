import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  sendFriendRequest,
  respondToFriendRequest,
  listFriends,
  listFriendRequests,
  cancelFriendRequest,
} from '../controllers/friend.controller.js';

const router = Router();

router.use(authenticateToken);

router.post('/request', sendFriendRequest);
router.post('/request/:requestId/respond', respondToFriendRequest);
router.delete('/request/:requestId', cancelFriendRequest);
router.get('/requests', listFriendRequests);
router.get('/', listFriends);

export default router;


