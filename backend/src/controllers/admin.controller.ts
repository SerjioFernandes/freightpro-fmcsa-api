import { Response } from 'express';
import { seedLoads } from '../scripts/seedLoads.js';
import { AuthRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class AdminController {
  /**
   * Seed loads for testing/demo purposes
   * GET /api/admin/seed-loads
   */
  async seedLoads(_req: AuthRequest, res: Response): Promise<void> {
    try {
      logger.info('Admin seed loads triggered');
      
      // Run seed in background
      seedLoads().catch((error: any) => {
        logger.error('Seed loads failed', { error });
      });
      
      res.json({
        success: true,
        message: 'Load seeding started in background. This may take a few minutes.'
      });
    } catch (error: any) {
      logger.error('Failed to start seed loads', { error: error.message });
      res.status(500).json({ 
        success: false,
        error: 'Failed to start seed loads' 
      });
    }
  }
}

export const adminController = new AdminController();

