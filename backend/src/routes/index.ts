import { Router } from 'express';
import authRoutes from './auth.routes.js';
import loadRoutes from './load.routes.js';
import shipmentRoutes from './shipment.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import healthRoutes from './health.routes.js';
import settingsRoutes from './settings.routes.js';
import messageRoutes from './message.routes.js';
import supportRoutes from './support.routes.js';
import documentRoutes from './document.routes.js';
import pushRoutes from './push.routes.js';
import locationRoutes from './location.routes.js';

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
router.use('/shipments', shipmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);
router.use('/settings', settingsRoutes);
router.use('/messages', messageRoutes);
router.use('/support', supportRoutes);
router.use('/documents', documentRoutes);
router.use('/push', pushRoutes);
router.use('/locations', locationRoutes);

export default router;

