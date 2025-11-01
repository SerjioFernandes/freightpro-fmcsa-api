import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { uploadDocument } from '../middleware/upload.middleware.js';
import * as documentController from '../controllers/document.controller.js';

const router = Router();

// All document routes require authentication
router.use(authenticateToken);

router.post('/upload', uploadDocument.single('file'), documentController.uploadDocument);
router.get('/', documentController.listDocuments);
router.get('/:id', documentController.getDocument);
router.get('/:id/download', documentController.downloadDocument);
router.delete('/:id', documentController.deleteDocument);
router.put('/:id/link-load', documentController.linkToLoad);
router.put('/:id/link-shipment', documentController.linkToShipment);

export default router;

