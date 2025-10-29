import { Router } from 'express';
import authRoutes from './auth.routes.js';
import loadRoutes from './load.routes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'CargoLume Load Board API is running',
    service: 'CargoLume Load Board API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/loads', loadRoutes);

export default router;

