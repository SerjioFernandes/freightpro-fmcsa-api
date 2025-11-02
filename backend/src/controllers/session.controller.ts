import { Response } from 'express';
import { sessionService } from '../services/session.service.js';
import { AuthRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class SessionController {
  /**
   * GET /api/sessions
   * Get all active sessions for the authenticated user
   */
  async getSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const sessions = await sessionService.getUserSessions(userId);
      const displayData = sessionService.getSessionDisplayData(sessions);

      res.json({
        success: true,
        data: displayData
      });
    } catch (error: any) {
      logger.error('Get sessions failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }

  /**
   * DELETE /api/sessions/:token
   * Delete a specific session (logout from one device)
   */
  async deleteSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { token } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const success = await sessionService.deleteSession(userId, token);

      if (success) {
        res.json({ success: true, message: 'Session deleted successfully' });
      } else {
        res.status(404).json({ error: 'Session not found' });
      }
    } catch (error: any) {
      logger.error('Delete session failed', { error: error.message });
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }

  /**
   * DELETE /api/sessions
   * Delete all sessions (logout from all devices)
   */
  async deleteAllSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const success = await sessionService.deleteAllSessions(userId);

      if (success) {
        res.json({ success: true, message: 'All sessions deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to delete all sessions' });
      }
    } catch (error: any) {
      logger.error('Delete all sessions failed', { error: error.message });
      res.status(500).json({ error: 'Failed to delete all sessions' });
    }
  }

  /**
   * POST /api/sessions/refresh
   * Refresh session activity
   */
  async refreshSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!userId || !token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const success = await sessionService.updateSessionActivity(userId, token);

      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Session not found' });
      }
    } catch (error: any) {
      logger.error('Refresh session failed', { error: error.message });
      res.status(500).json({ error: 'Failed to refresh session' });
    }
  }

  /**
   * GET /api/sessions/security
   * Get security information for active sessions
   */
  async getSecurityInfo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const sessions = await sessionService.getUserSessions(userId);

      // Check for suspicious activity
      const suspiciousIPs: string[] = [];
      sessions.forEach((session: any) => {
        if (sessionService.isSuspiciousActivity(session.ip, sessions)) {
          suspiciousIPs.push(session.ip);
        }
      });

      res.json({
        success: true,
        data: {
          totalSessions: sessions.length,
          suspiciousIPs: Array.from(new Set(suspiciousIPs)),
          hasSuspiciousActivity: suspiciousIPs.length > 0
        }
      });
    } catch (error: any) {
      logger.error('Get security info failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch security info' });
    }
  }
}

export const sessionController = new SessionController();

