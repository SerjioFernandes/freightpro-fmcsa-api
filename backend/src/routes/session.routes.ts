import { Router } from 'express';
import { sessionController } from '../controllers/session.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

// All session routes require authentication
router.use(authenticateToken);

// GET /api/sessions - Get all active sessions
router.get('/', asyncHandler(sessionController.getSessions.bind(sessionController)));

// DELETE /api/sessions/:token - Delete a specific session
router.delete('/:token', asyncHandler(sessionController.deleteSession.bind(sessionController)));

// DELETE /api/sessions - Delete all sessions
router.delete('/', asyncHandler(sessionController.deleteAllSessions.bind(sessionController)));

// POST /api/sessions/refresh - Refresh session activity
router.post('/refresh', asyncHandler(sessionController.refreshSession.bind(sessionController)));

// GET /api/sessions/security - Get security information
router.get('/security', asyncHandler(sessionController.getSecurityInfo.bind(sessionController)));

export default router;

