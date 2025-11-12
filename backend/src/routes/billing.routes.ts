import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as billingController from '../controllers/billing.controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/invoices/ready', billingController.listReadyInvoices);
router.get('/invoices/load/:id/preview', billingController.previewInvoiceForLoad);

export default router;

