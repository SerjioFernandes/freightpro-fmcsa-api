import { Router } from 'express';
import { shipmentController } from '../controllers/shipment.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireShipper, requireBroker, requireShipperOrBroker } from '../middleware/authorization.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

// All shipment routes require authentication
router.use(authenticateToken);

// GET /api/shipments - Get all shipments (shippers see only their own, brokers see all open)
router.get('/', requireShipperOrBroker, asyncHandler(shipmentController.getShipments.bind(shipmentController)));

// POST /api/shipments - Create new shipment (shippers only)
router.post('/', requireShipper, asyncHandler(shipmentController.createShipment.bind(shipmentController)));

// GET /api/shipments/:id - Get single shipment
router.get('/:id', requireShipperOrBroker, asyncHandler(shipmentController.getShipment.bind(shipmentController)));

// PUT /api/shipments/:id - Update shipment (shipper who created it only)
router.put('/:id', requireShipper, asyncHandler(shipmentController.updateShipment.bind(shipmentController)));

// DELETE /api/shipments/:id - Delete shipment (shipper who created it only)
router.delete('/:id', requireShipper, asyncHandler(shipmentController.deleteShipment.bind(shipmentController)));

// GET /api/shipments/requests/all - Get all shipment requests for current user
router.get('/requests/all', requireShipperOrBroker, asyncHandler(shipmentController.getShipmentRequests.bind(shipmentController)));

// POST /api/shipments/:id/request - Create request for shipment access (brokers only)
router.post('/:id/request', requireBroker, asyncHandler(shipmentController.createShipmentRequest.bind(shipmentController)));

// PUT /api/shipments/requests/:id/status - Approve/reject request (shippers only)
router.put('/requests/:id/status', requireShipper, asyncHandler(shipmentController.updateShipmentRequestStatus.bind(shipmentController)));

export default router;
