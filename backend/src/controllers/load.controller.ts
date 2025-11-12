import { Response } from 'express';
import { Load } from '../models/Load.model.js';
import { User } from '../models/User.model.js';
import { Shipment } from '../models/Shipment.model.js';
import { AuthRequest } from '../types/index.js';
import { PAGINATION } from '../utils/constants.js';
import { validateState, validatePostalCode } from '../utils/validators.js';
import { logger } from '../utils/logger.js';
import { websocketService } from '../services/websocket.service.js';
import { geocodingService } from '../services/geocoding.service.js';

const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const calculateDistanceMiles = (
  origin?: { lat?: number; lng?: number },
  destination?: { lat?: number; lng?: number }
): number | null => {
  if (
    !origin ||
    !destination ||
    typeof origin.lat !== 'number' ||
    typeof origin.lng !== 'number' ||
    typeof destination.lat !== 'number' ||
    typeof destination.lng !== 'number'
  ) {
    return null;
  }

  const dLat = toRadians(destination.lat - origin.lat);
  const dLon = toRadians(destination.lng - origin.lng);
  const lat1 = toRadians(origin.lat);
  const lat2 = toRadians(destination.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const miles = EARTH_RADIUS_MILES * c;

  if (!Number.isFinite(miles) || miles <= 0) {
    return null;
  }

  return Math.round(miles);
};

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

      // Geocode addresses to get coordinates
      const originCoords = await geocodingService.geocodeAddress(origin);
      const destCoords = await geocodingService.geocodeAddress(destination);

      const originCoordinates = originCoords
        ? { lat: originCoords.latitude, lng: originCoords.longitude }
        : undefined;
      const destinationCoordinates = destCoords
        ? { lat: destCoords.latitude, lng: destCoords.longitude }
        : undefined;

      const computedDistance = calculateDistanceMiles(originCoordinates, destinationCoordinates);

      const loadData = {
        ...req.body,
        origin: {
          city: origin.city,
          state: origin.state.toUpperCase(),
          zip: origin.zip,
          country: origin.country || 'US',
          coordinates: originCoordinates
        },
        destination: {
          city: destination.city,
          state: destination.state.toUpperCase(),
          zip: destination.zip,
          country: destination.country || 'US',
          coordinates: destinationCoordinates
        },
        shipmentId: shipmentId || '',
        unlinked,
        isInterstate,
        shipment: shipmentRef,
        postedBy: req.user.userId,
        billingStatus: 'not_ready',
        distance: computedDistance ?? undefined
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

      const { agreedRate, bookingNotes } = req.body ?? {};
      const finalAgreedRate =
        typeof agreedRate === 'number' && agreedRate > 0 ? agreedRate : loadToBook.rate;

      // Atomic update
      const updatePayload: Record<string, any> = {
        status: 'booked',
        bookedBy: req.user.userId,
        updatedAt: new Date(),
        bookedAt: new Date(),
        agreedRate: finalAgreedRate,
        billingStatus: 'ready',
      };

      if (typeof bookingNotes === 'string' && bookingNotes.trim().length > 0) {
        updatePayload.bookingNotes = bookingNotes.trim().slice(0, 1000);
      }

      const load = await Load.findOneAndUpdate(
        { _id: req.params.id, status: 'available' },
        { $set: updatePayload },
        { new: true }
      ).populate([
        { path: 'postedBy', select: 'company email accountType phone' },
        { path: 'bookedBy', select: 'company email accountType phone' },
      ]);

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




