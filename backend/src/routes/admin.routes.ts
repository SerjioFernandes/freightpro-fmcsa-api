import { Router } from 'express';
import { authenticateToken, authenticateAdmin } from '../middleware/auth.middleware.js';
import { adminController } from '../controllers/admin.controller.js';
import { adminRateLimiter } from '../middleware/adminRateLimit.middleware.js';
import { adminIpWhitelist } from '../middleware/adminIpWhitelist.middleware.js';

const router = Router();

// All admin routes require authentication, admin role, rate limiting, and optional IP whitelist
router.use(authenticateToken, authenticateAdmin, adminIpWhitelist, adminRateLimiter);

router.get('/seed-loads', adminController.seedLoads.bind(adminController));
router.get('/users', adminController.getAllUsers.bind(adminController));
router.get('/users/:id', adminController.getUserById.bind(adminController));
router.put('/users/:id', adminController.updateUser.bind(adminController));
router.delete('/users/:id', adminController.deleteUser.bind(adminController));
router.get('/export/users', adminController.exportAllData.bind(adminController));
router.get('/system-stats', adminController.getSystemStats.bind(adminController));
router.get('/audit-logs', adminController.getAuditLogs.bind(adminController));

export default router;

