import { User } from '../models/User.model.js';
import { Types } from 'mongoose';
import { logger } from '../utils/logger.js';

export interface SessionData {
  token: string;
  device: string;
  ip: string;
  userAgent?: string;
}

class SessionService {
  /**
   * Create a new session for a user
   */
  async createSession(userId: string, sessionData: SessionData): Promise<boolean> {
    try {
      const session = {
        token: sessionData.token,
        device: sessionData.device,
        ip: sessionData.ip,
        userAgent: sessionData.userAgent,
        lastActivity: new Date(),
        createdAt: new Date()
      };

      await User.findByIdAndUpdate(
        new Types.ObjectId(userId),
        { $push: { sessions: session } },
        { new: true }
      );

      logger.info('Session created', { userId, device: sessionData.device });
      return true;
    } catch (error: any) {
      logger.error('Failed to create session', { error: error.message });
      return false;
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<any[]> {
    try {
      const user = await User.findById(new Types.ObjectId(userId)).select('sessions');
      return user?.sessions || [];
    } catch (error: any) {
      logger.error('Failed to get user sessions', { error: error.message });
      return [];
    }
  }

  /**
   * Update session last activity
   */
  async updateSessionActivity(userId: string, token: string): Promise<boolean> {
    try {
      const user = await User.findById(new Types.ObjectId(userId));
      if (!user) return false;

      const sessionIndex = user.sessions.findIndex((s: any) => s.token === token);
      if (sessionIndex === -1) return false;

      user.sessions[sessionIndex].lastActivity = new Date();
      await user.save();

      return true;
    } catch (error: any) {
      logger.error('Failed to update session activity', { error: error.message });
      return false;
    }
  }

  /**
   * Delete a specific session (logout from one device)
   */
  async deleteSession(userId: string, token: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndUpdate(
        new Types.ObjectId(userId),
        { $pull: { sessions: { token } } },
        { new: true }
      );

      logger.info('Session deleted', { userId });
      return !!result;
    } catch (error: any) {
      logger.error('Failed to delete session', { error: error.message });
      return false;
    }
  }

  /**
   * Delete all sessions for a user (logout from all devices)
   */
  async deleteAllSessions(userId: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndUpdate(
        new Types.ObjectId(userId),
        { $set: { sessions: [] } },
        { new: true }
      );

      logger.info('All sessions deleted', { userId });
      return !!result;
    } catch (error: any) {
      logger.error('Failed to delete all sessions', { error: error.message });
      return false;
    }
  }

  /**
   * Get session details for display
   */
  getSessionDisplayData(sessions: any[]): Array<{
    token: string;
    device: string;
    ip: string;
    userAgent?: string;
    lastActivity: Date;
    createdAt: Date;
    isCurrent?: boolean;
  }> {
    return sessions.map(s => ({
      token: s.token,
      device: s.device,
      ip: s.ip,
      userAgent: s.userAgent,
      lastActivity: s.lastActivity,
      createdAt: s.createdAt
    }));
  }

  /**
   * Detect device type from user agent
   */
  detectDevice(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile Device';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    }
    if (ua.includes('desktop') || ua.includes('windows') || ua.includes('mac') || ua.includes('linux')) {
      return 'Desktop';
    }
    
    return 'Unknown Device';
  }

  /**
   * Check if IP address is suspicious (rate limiting, etc.)
   */
  isSuspiciousActivity(_ip: string, sessions: any[]): boolean {
    // Simple check: if there are too many sessions from different IPs in a short time
    const uniqueIPs = new Set(sessions.map((s: any) => s.ip));
    if (uniqueIPs.size > 10) {
      return true;
    }
    return false;
  }

  /**
   * Clean up old inactive sessions (older than 30 days)
   */
  async cleanupOldSessions(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const users = await User.find({ 'sessions.lastActivity': { $lt: thirtyDaysAgo } });
      let cleaned = 0;

      for (const user of users) {
        const beforeCount = user.sessions.length;
        user.sessions = user.sessions.filter((s: any) => {
          const lastActivity = new Date(s.lastActivity);
          return lastActivity >= thirtyDaysAgo;
        });

        if (user.sessions.length < beforeCount) {
          await user.save();
          cleaned += (beforeCount - user.sessions.length);
        }
      }

      logger.info('Cleaned up old sessions', { count: cleaned });
      return cleaned;
    } catch (error: any) {
      logger.error('Failed to cleanup old sessions', { error: error.message });
      return 0;
    }
  }
}

export const sessionService = new SessionService();

