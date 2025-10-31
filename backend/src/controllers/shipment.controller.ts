import { Response } from 'express';
import { Shipment, ShipmentRequest } from '../models/Shipment.model.js';
import { AuthRequest } from '../types/index.js';
import { PAGINATION } from '../utils/constants.js';
import { validateState, validatePostalCode } from '../utils/validators.js';
import { logger } from '../utils/logger.js';

export class ShipmentController {
  async getShipments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let query: any = {};
      
      // Filter by status if provided
      if (status) {
        query.status = status;
      }

      // Shippers can only see their own shipments
      if (req.user?.accountType === 'shipper') {
        query.postedBy = req.user.userId;
      }

      const shipments = await Shipment.find(query)
        .populate('postedBy', 'company email accountType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string));

      const total = await Shipment.countDocuments(query);

      res.json({
        success: true,
        shipments,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error: any) {
      logger.error('Get shipments failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch shipments' });
    }
  }

  async createShipment(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user?.accountType !== 'shipper' && req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Only shippers can create shipments' });
        return;
      }

      const { title, description, pickup, delivery, status } = req.body;

      if (!title || !pickup || !delivery) {
        res.status(400).json({ error: 'Title, pickup, and delivery are required' });
        return;
      }

      // Validate locations
      if (!validateState(pickup.state, pickup.country || 'US')) {
        res.status(400).json({ error: 'Invalid pickup state/province' });
        return;
      }

      if (!validateState(delivery.state, delivery.country || 'US')) {
        res.status(400).json({ error: 'Invalid delivery state/province' });
        return;
      }

      if (!validatePostalCode(pickup.zip, pickup.country || 'US')) {
        res.status(400).json({ error: 'Invalid pickup postal code' });
        return;
      }

      if (!validatePostalCode(delivery.zip, delivery.country || 'US')) {
        res.status(400).json({ error: 'Invalid delivery postal code' });
        return;
      }

      // Generate unique shipment ID
      const shipmentId = `SH${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      const shipment = new Shipment({
        shipmentId,
        title,
        description: description || '',
        pickup,
        delivery,
        status: status || 'open',
        postedBy: req.user.userId
      });

      await shipment.save();
      await shipment.populate('postedBy', 'company email accountType');

      logger.info('Shipment created successfully', { shipmentId, userId: req.user?.userId });

      res.status(201).json({
        success: true,
        message: 'Shipment created successfully',
        shipment
      });
    } catch (error: any) {
      logger.error('Create shipment failed', { error: error.message });
      res.status(500).json({ error: 'Failed to create shipment' });
    }
  }

  async getShipment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const shipment = await Shipment.findById(id).populate('postedBy', 'company email accountType');

      if (!shipment) {
        res.status(404).json({ error: 'Shipment not found' });
        return;
      }

      // Shippers can only view their own shipments unless they're admins
      if (req.user?.accountType === 'shipper' && shipment.postedBy._id.toString() !== req.user.userId && req.user?.role !== 'admin') {
        res.status(403).json({ error: 'You do not have permission to view this shipment' });
        return;
      }

      res.json({
        success: true,
        shipment
      });
    } catch (error: any) {
      logger.error('Get shipment failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch shipment' });
    }
  }

  async updateShipment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const shipment = await Shipment.findById(id);

      if (!shipment) {
        res.status(404).json({ error: 'Shipment not found' });
        return;
      }

      // Only shipper who posted can update or admin
      if (shipment.postedBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        res.status(403).json({ error: 'You do not have permission to update this shipment' });
        return;
      }

      const { title, description, pickup, delivery, status } = req.body;

      // Update allowed fields
      if (title) shipment.title = title;
      if (description !== undefined) shipment.description = description;
      if (pickup) {
        if (!validateState(pickup.state, pickup.country || 'US')) {
          res.status(400).json({ error: 'Invalid pickup state/province' });
          return;
        }
        if (!validatePostalCode(pickup.zip, pickup.country || 'US')) {
          res.status(400).json({ error: 'Invalid pickup postal code' });
          return;
        }
        shipment.pickup = pickup;
      }
      if (delivery) {
        if (!validateState(delivery.state, delivery.country || 'US')) {
          res.status(400).json({ error: 'Invalid delivery state/province' });
          return;
        }
        if (!validatePostalCode(delivery.zip, delivery.country || 'US')) {
          res.status(400).json({ error: 'Invalid delivery postal code' });
          return;
        }
        shipment.delivery = delivery;
      }
      if (status) shipment.status = status;

      shipment.updatedAt = new Date();
      await shipment.save();
      await shipment.populate('postedBy', 'company email accountType');

      logger.info('Shipment updated successfully', { shipmentId: shipment.shipmentId, userId: req.user?.userId });

      res.json({
        success: true,
        message: 'Shipment updated successfully',
        shipment
      });
    } catch (error: any) {
      logger.error('Update shipment failed', { error: error.message });
      res.status(500).json({ error: 'Failed to update shipment' });
    }
  }

  async deleteShipment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const shipment = await Shipment.findById(id);

      if (!shipment) {
        res.status(404).json({ error: 'Shipment not found' });
        return;
      }

      // Only shipper who posted can delete or admin
      if (shipment.postedBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        res.status(403).json({ error: 'You do not have permission to delete this shipment' });
        return;
      }

      // Delete associated shipment requests
      await ShipmentRequest.deleteMany({ shipmentId: id });

      await Shipment.deleteOne({ _id: id });

      logger.info('Shipment deleted successfully', { shipmentId: shipment.shipmentId, userId: req.user?.userId });

      res.json({
        success: true,
        message: 'Shipment deleted successfully'
      });
    } catch (error: any) {
      logger.error('Delete shipment failed', { error: error.message });
      res.status(500).json({ error: 'Failed to delete shipment' });
    }
  }

  async getShipmentRequests(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.query;

      let query: any = {};

      if (req.user?.accountType === 'broker') {
        query.brokerId = req.user.userId;
      } else if (req.user?.accountType === 'shipper') {
        query.shipperId = req.user.userId;
      } else if (req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      if (status) {
        query.status = status;
      }

      const requests = await ShipmentRequest.find(query)
        .populate('shipmentId', 'title pickup delivery status shipmentId')
        .populate('brokerId', 'company email accountType usdotNumber mcNumber')
        .populate('shipperId', 'company email accountType')
        .sort({ requestedAt: -1 });

      res.json({
        success: true,
        requests
      });
    } catch (error: any) {
      logger.error('Get shipment requests failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch shipment requests' });
    }
  }

  async createShipmentRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user?.accountType !== 'broker' && req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Only brokers can create shipment requests' });
        return;
      }

      const { shipmentId, brokerMessage } = req.body;

      if (!shipmentId) {
        res.status(400).json({ error: 'Shipment ID is required' });
        return;
      }

      const shipment = await Shipment.findById(shipmentId);

      if (!shipment) {
        res.status(404).json({ error: 'Shipment not found' });
        return;
      }

      if (shipment.status !== 'open') {
        res.status(400).json({ error: 'This shipment is no longer accepting requests' });
        return;
      }

      // Check if request already exists
      const existingRequest = await ShipmentRequest.findOne({
        shipmentId,
        brokerId: req.user.userId
      });

      if (existingRequest) {
        res.status(400).json({ error: 'You have already submitted a request for this shipment' });
        return;
      }

      const request = new ShipmentRequest({
        shipmentId,
        brokerId: req.user.userId,
        shipperId: shipment.postedBy,
        brokerMessage: brokerMessage || ''
      });

      await request.save();
      await request.populate([
        { path: 'shipmentId', select: 'title pickup delivery status shipmentId' },
        { path: 'brokerId', select: 'company email accountType usdotNumber mcNumber' },
        { path: 'shipperId', select: 'company email accountType' }
      ]);

      logger.info('Shipment request created successfully', { requestId: request._id, userId: req.user?.userId });

      res.status(201).json({
        success: true,
        message: 'Shipment request submitted successfully',
        request
      });
    } catch (error: any) {
      logger.error('Create shipment request failed', { error: error.message });
      res.status(500).json({ error: 'Failed to create shipment request' });
    }
  }

  async updateShipmentRequestStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, shipperResponse } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be approved or rejected' });
        return;
      }

      const request = await ShipmentRequest.findById(id);

      if (!request) {
        res.status(404).json({ error: 'Request not found' });
        return;
      }

      // Only shipper can approve/reject
      if (request.shipperId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        res.status(403).json({ error: 'You do not have permission to update this request' });
        return;
      }

      request.status = status;
      request.respondedAt = new Date();
      if (shipperResponse) {
        request.shipperResponse = shipperResponse;
      }

      await request.save();
      await request.populate([
        { path: 'shipmentId', select: 'title pickup delivery status shipmentId' },
        { path: 'brokerId', select: 'company email accountType usdotNumber mcNumber' },
        { path: 'shipperId', select: 'company email accountType' }
      ]);

      logger.info('Shipment request status updated', { requestId: request._id, status, userId: req.user?.userId });

      res.json({
        success: true,
        message: `Request ${status} successfully`,
        request
      });
    } catch (error: any) {
      logger.error('Update shipment request status failed', { error: error.message });
      res.status(500).json({ error: 'Failed to update request status' });
    }
  }
}

export const shipmentController = new ShipmentController();
