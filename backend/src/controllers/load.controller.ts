import { Response } from 'express';
import { Load } from '../models/Load.model.js';
import { User } from '../models/User.model.js';
import { Shipment } from '../models/Shipment.model.js';
import { AuthRequest } from '../types/index.js';
import { PAGINATION } from '../utils/constants.js';
import { validateState, validatePostalCode } from '../utils/validators.js';
import { logger } from '../utils/logger.js';
import { websocketService } from '../services/websocket.service.js';

export class LoadController {
  async getLoads(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, status = 'available' } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let query: any = { status };

      // Authority-based filtering for carriers
      if (req.user?.accountType === 'carrier') {
        const carrier = await User.findById(req.user.userId);
        if (carrier && !carrier.hasMC) {
          query.isInterstate = false;
        }
      }

      const loads = await Load.find(query)
        .populate('postedBy', 'company email accountType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string));

      const total = await Load.countDocuments(query);

      res.json({
        success: true,
        loads,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error: any) {
      logger.error('Get loads failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch loads' });
    }
  }

  async postLoad(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user?.accountType !== 'broker' && req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Only brokers can post loads' });
        return;
      }

      const { shipmentId, origin, destination, pickupDate, deliveryDate } = req.body;

      if (!origin || !destination || !pickupDate || !deliveryDate) {
        res.status(400).json({ error: 'Origin, destination, pickup date, and delivery date are required' });
        return;
      }

      // Validate locations
      if (!validateState(origin.state, origin.country || 'US')) {
        res.status(400).json({ error: 'Invalid origin state/province' });
        return;
      }

      if (!validateState(destination.state, destination.country || 'US')) {
        res.status(400).json({ error: 'Invalid destination state/province' });
        return;
      }

      if (!validatePostalCode(origin.zip, origin.country || 'US')) {
        res.status(400).json({ error: 'Invalid origin postal code' });
        return;
      }

      if (!validatePostalCode(destination.zip, destination.country || 'US')) {
        res.status(400).json({ error: 'Invalid destination postal code' });
        return;
      }

      // Authority validation
      const isInterstate = origin.state !== destination.state;
      const broker = await User.findById(req.user.userId);

      if (isInterstate && broker && !broker.hasMC) {
        res.status(403).json({
          error: 'MC number required for interstate loads. Brokers with only USDOT can post intrastate loads only.'
        });
        return;
      }

      let shipmentRef = null;
      let unlinked = true;

      if (shipmentId) {
        const shipment = await Shipment.findOne({ shipmentId, status: 'open' });
        if (!shipment) {
          res.status(400).json({ error: 'Invalid or closed shipmentId' });
          return;
        }
        shipmentRef = shipment._id;
        unlinked = false;
      }

      const loadData = {
        ...req.body,
        origin: {
          city: origin.city,
          state: origin.state.toUpperCase(),
          zip: origin.zip,
          country: origin.country || 'US'
        },
        destination: {
          city: destination.city,
          state: destination.state.toUpperCase(),
          zip: destination.zip,
          country: destination.country || 'US'
        },
        shipmentId: shipmentId || '',
        unlinked,
        isInterstate,
        shipment: shipmentRef,
        postedBy: req.user.userId
      };

      const load = new Load(loadData);
      await load.save();

      // Broadcast new load via WebSocket
      websocketService.notifyNewLoad(load);

      res.status(201).json({
        success: true,
        message: 'Load posted successfully',
        load
      });
    } catch (error: any) {
      logger.error('Post load failed', { error: error.message });
      res.status(500).json({ error: 'Failed to post load' });
    }
  }

  async bookLoad(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user?.accountType !== 'carrier' && req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Only carriers can book loads' });
        return;
      }

      const loadToBook = await Load.findById(req.params.id);
      if (!loadToBook) {
        res.status(404).json({ error: 'Load not found' });
        return;
      }

      // Authority validation
      const carrier = await User.findById(req.user.userId);
      if (loadToBook.isInterstate && carrier && !carrier.hasMC) {
        res.status(403).json({
          error: 'MC number required for interstate loads. Carriers with only USDOT can book intrastate loads only.'
        });
        return;
      }

      // Atomic update
      const load = await Load.findOneAndUpdate(
        { _id: req.params.id, status: 'available' },
        { $set: { status: 'booked', bookedBy: req.user.userId, updatedAt: new Date() } },
        { new: true }
      );

      if (!load) {
        res.status(409).json({ error: 'Load already booked or not available' });
        return;
      }

      // Broadcast load booking via WebSocket
      websocketService.notifyLoadUpdate(load._id.toString(), {
        status: load.status,
        bookedBy: load.bookedBy
      });

      res.json({
        success: true,
        message: 'Load booked successfully',
        load
      });
    } catch (error: any) {
      logger.error('Book load failed', { error: error.message });
      res.status(500).json({ error: 'Failed to book load' });
    }
  }
}

export const loadController = new LoadController();




