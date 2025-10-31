import { Response } from 'express';
import { Load } from '../models/Load.model.js';
import { Shipment, ShipmentRequest } from '../models/Shipment.model.js';
import { AuthRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class DashboardController {
  async getCarrierStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const carrierId = req.user?.userId;

      // Get booked loads
      const bookedLoads = await Load.find({ bookedBy: carrierId, status: { $ne: 'cancelled' } })
        .populate('postedBy', 'company email')
        .sort({ createdAt: -1 });

      // Calculate stats
      const totalBooked = bookedLoads.length;
      const totalEarnings = bookedLoads.reduce((sum, load) => sum + (load.rate || 0), 0);
      const totalMiles = bookedLoads.reduce((sum, load) => sum + (load.distance || 0), 0);
      const activeLoads = bookedLoads.filter(load => ['booked', 'in_transit'].includes(load.status)).length;

      res.json({
        success: true,
        stats: {
          totalBooked,
          totalEarnings,
          totalMiles,
          activeLoads,
          averageRate: totalBooked > 0 ? Math.round(totalEarnings / totalBooked) : 0,
          rating: '5.0' // Placeholder
        },
        recentLoads: bookedLoads.slice(0, 5)
      });
    } catch (error: any) {
      logger.error('Get carrier stats failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch carrier stats' });
    }
  }

  async getBrokerStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const brokerId = req.user?.userId;

      // Get posted loads
      const postedLoads = await Load.find({ postedBy: brokerId })
        .populate('bookedBy', 'company email')
        .sort({ createdAt: -1 });

      // Get shipment requests
      const shipmentRequests = await ShipmentRequest.find({ brokerId })
        .populate('shipmentId', 'title pickup delivery')
        .populate('shipperId', 'company email')
        .sort({ requestedAt: -1 });

      // Calculate stats
      const totalPosted = postedLoads.length;
      const activeLoads = postedLoads.filter(load => load.status === 'available').length;
      const bookedLoadsArray = postedLoads.filter(load => load.status === 'booked');
      const bookedLoads = bookedLoadsArray.length;
      const potentialRevenue = bookedLoadsArray.reduce((sum: number, load: any) => sum + (load.rate || 0), 0);
      const totalRequests = shipmentRequests.length;
      const pendingRequests = shipmentRequests.filter(req => req.status === 'pending').length;

      res.json({
        success: true,
        stats: {
          totalPosted,
          activeLoads,
          carrierRequests: bookedLoads,
          potentialRevenue,
          shipmentRequests: totalRequests,
          pendingRequests
        },
        recentLoads: postedLoads.slice(0, 5),
        recentShipmentRequests: shipmentRequests.slice(0, 5)
      });
    } catch (error: any) {
      logger.error('Get broker stats failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch broker stats' });
    }
  }

  async getShipperStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const shipperId = req.user?.userId;

      // Get shipments
      const shipments = await Shipment.find({ postedBy: shipperId })
        .sort({ createdAt: -1 });

      // Get shipment requests
      const shipmentRequests = await ShipmentRequest.find({ shipperId })
        .populate('brokerId', 'company email usdotNumber mcNumber')
        .populate('shipmentId', 'title pickup delivery')
        .sort({ requestedAt: -1 });

      // Get loads linked to shipments
      const shipmentIds = shipments.map(s => s._id);
      const loads = await Load.find({ shipment: { $in: shipmentIds } })
        .populate('bookedBy', 'company email')
        .sort({ createdAt: -1 });

      // Calculate stats
      const totalShipments = shipments.length;
      const activeShipments = shipments.filter(s => s.status === 'open').length;
      const totalProposals = shipmentRequests.length;
      const totalSpend = loads.reduce((sum, load) => sum + (load.rate || 0), 0);
      const pendingRequests = shipmentRequests.filter(req => req.status === 'pending').length;
      const approvedRequests = shipmentRequests.filter(req => req.status === 'approved').length;

      res.json({
        success: true,
        stats: {
          totalShipments,
          activeShipments,
          totalProposals,
          totalSpend,
          pendingRequests,
          approvedRequests
        },
        recentShipments: shipments.slice(0, 5),
        recentRequests: shipmentRequests.slice(0, 5)
      });
    } catch (error: any) {
      logger.error('Get shipper stats failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch shipper stats' });
    }
  }

  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const accountType = req.user?.accountType;

      switch (accountType) {
        case 'carrier':
          await this.getCarrierStats(req, res);
          break;
        case 'broker':
          await this.getBrokerStats(req, res);
          break;
        case 'shipper':
          await this.getShipperStats(req, res);
          break;
        default:
          res.status(400).json({ error: 'Invalid account type' });
      }
    } catch (error: any) {
      logger.error('Get stats failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
}

export const dashboardController = new DashboardController();
