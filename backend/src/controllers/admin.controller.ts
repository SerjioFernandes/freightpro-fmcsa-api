import { Response } from 'express';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { seedLoads } from '../scripts/seedLoads.js';
import { AuthRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.model.js';
import { Load } from '../models/Load.model.js';
import { Shipment } from '../models/Shipment.model.js';
import { Message } from '../models/Message.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { Document } from '../models/Document.model.js';

type PaginationResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

class AdminController {
  /**
   * Seed loads for testing/demo purposes
   * GET /api/admin/seed-loads
   */
  async seedLoads(req: AuthRequest, res: Response): Promise<void> {
    try {
      await this.logAction(req, 'SEED_LOADS_TRIGGERED', 'Admin triggered load seeding', { targetCollection: 'loads' });

      logger.info('Starting load seeding...');
      
      // Run synchronously and wait for completion
      await seedLoads();
      
      logger.info('Load seeding completed successfully');
      await this.logAction(req, 'SEED_LOADS_COMPLETED', 'Load seeding completed successfully', { targetCollection: 'loads' });

      res.json({
        success: true,
        message: '100 loads seeded successfully!'
      });
    } catch (error: any) {
      logger.error('Failed to seed loads', { error: error.message, stack: error.stack });
      await this.logAction(req, 'SEED_LOADS_FAILED', 'Load seeding failed', { error: error.message, targetCollection: 'loads' });
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to seed loads' 
      });
    }
  }

  /**
   * GET /api/admin/users
   */
  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '25', search, accountType, role, isActive } = req.query;
      const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
      const limitNum = Math.min(Math.max(parseInt(String(limit), 10) || 25, 1), 200);

      const filter: Record<string, unknown> = {};

      if (search && typeof search === 'string') {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { email: regex },
          { company: regex },
          { phone: regex },
          { usdotNumber: regex },
          { mcNumber: regex },
        ];
      }

      if (accountType && typeof accountType === 'string') {
        filter.accountType = accountType;
      }

      if (role && typeof role === 'string') {
        filter.role = role;
      }

      if (typeof isActive === 'string') {
        filter.isActive = isActive === 'true';
      }

      const total = await User.countDocuments(filter);
      const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();

      await this.logAction(req, 'VIEW_ALL_USERS', 'Viewed paginated users', {
        targetCollection: 'users',
        page: pageNum,
        limit: limitNum,
        total,
        filters: filter,
      });

      res.json({
        success: true,
        data: users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
      });
    } catch (error: any) {
      logger.error('Admin getAllUsers failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  }

  /**
   * GET /api/admin/users/:id
   */
  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, error: 'Invalid user ID' });
        return;
      }

      const user = await User.findById(id).lean();
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      await this.logAction(req, 'VIEW_USER', 'Viewed user details', { targetCollection: 'users', targetUserId: id });

      res.json({ success: true, data: user });
    } catch (error: any) {
      logger.error('Admin getUserById failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
  }

  /**
   * PUT /api/admin/users/:id
   */
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, error: 'Invalid user ID' });
        return;
      }

      const payload = { ...req.body } as Record<string, unknown>;

      if (payload.password && typeof payload.password === 'string') {
        const hashedPassword = await bcryptjs.hash(String(payload.password), 12);
        payload.password = hashedPassword;
      }

      const updatedUser = await User.findByIdAndUpdate(id, payload, { new: true, lean: true });
      if (!updatedUser) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const changeMetadata = { ...payload };
      if (payload.password) changeMetadata.password = '[updated]';

      await this.logAction(req, 'UPDATE_USER', 'Updated user account', { targetCollection: 'users', targetUserId: id, changes: changeMetadata });

      res.json({ success: true, data: updatedUser });
    } catch (error: any) {
      logger.error('Admin updateUser failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to update user' });
    }
  }

  /**
   * DELETE /api/admin/users/:id
   */
  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, error: 'Invalid user ID' });
        return;
      }

      const deletedUser = await User.findByIdAndDelete(id).lean();
      if (!deletedUser) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      await this.logAction(req, 'DELETE_USER', 'Deleted user account', { targetCollection: 'users', targetUserId: id });

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      logger.error('Admin deleteUser failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
  }

  /**
   * GET /api/admin/export/users
   */
  async exportAllData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const format = typeof req.query.format === 'string' ? req.query.format.toLowerCase() : 'json';
      const users = await User.find({}).lean();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      await this.logAction(req, 'EXPORT_USERS', 'Exported all users', { targetCollection: 'users', format, count: users.length });

      if (format === 'csv') {
        const fields = Object.keys(users[0] || {});
        const csvRows = [fields.join(',')];
        for (const user of users) {
          const row = fields.map(field => {
            const value = (user as Record<string, unknown>)[field];
            if (value === undefined || value === null) return '';
            if (typeof value === 'object') {
              return JSON.stringify(value).replace(/"/g, '""');
            }
            return String(value).replace(/"/g, '""');
          });
          csvRows.push(row.map(col => (col.includes(',') ? `"${col}"` : col)).join(','));
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="users-${timestamp}.csv"`);
        res.status(200).send(csvRows.join('\n'));
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="users-${timestamp}.json"`);
      res.status(200).send(JSON.stringify({ exportDate: new Date().toISOString(), totalUsers: users.length, users }));
    } catch (error: any) {
      logger.error('Admin exportAllData failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to export users' });
    }
  }

  async exportLoads(req: AuthRequest, res: Response): Promise<void> {
    try {
      const format = typeof req.query.format === 'string' ? req.query.format.toLowerCase() : 'json';
      const loads = await Load.find({}).lean();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      const exportRecords = loads.map((load) => ({
        title: load.title,
        status: load.status,
        equipmentType: load.equipmentType,
        weight: load.weight,
        rate: load.rate,
        rateType: load.rateType,
        originCity: load.origin?.city,
        originState: load.origin?.state,
        originZip: load.origin?.zip,
        destinationCity: load.destination?.city,
        destinationState: load.destination?.state,
        destinationZip: load.destination?.zip,
        pickupDate: load.pickupDate ? new Date(load.pickupDate).toISOString() : '',
        deliveryDate: load.deliveryDate ? new Date(load.deliveryDate).toISOString() : '',
        bookedAt: load.bookedAt ? new Date(load.bookedAt).toISOString() : '',
        billingStatus: load.billingStatus,
        createdAt: load.createdAt ? new Date(load.createdAt).toISOString() : '',
        updatedAt: load.updatedAt ? new Date(load.updatedAt).toISOString() : '',
      }));

      await this.logAction(req, 'EXPORT_LOADS', 'Exported loads report', {
        targetCollection: 'loads',
        format,
        count: exportRecords.length,
      });

      if (format === 'csv') {
        const fields = Object.keys(exportRecords[0] || {});
        const csvRows = [fields.join(',')];
        for (const record of exportRecords) {
          const row = fields.map((field) => {
            const value = (record as Record<string, unknown>)[field];
            if (value === undefined || value === null) return '';
            return String(value).replace(/"/g, '""');
          });
          csvRows.push(row.map((column) => (column.includes(',') ? `"${column}"` : column)).join(','));
        }
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="loads-${timestamp}.csv"`);
        res.status(200).send(csvRows.join('\n'));
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="loads-${timestamp}.json"`);
      res.status(200).send(JSON.stringify({ exportDate: new Date().toISOString(), totalLoads: exportRecords.length, loads: exportRecords }));
    } catch (error: any) {
      logger.error('Admin exportLoads failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to export loads' });
    }
  }

  async exportShipments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const format = typeof req.query.format === 'string' ? req.query.format.toLowerCase() : 'json';
      const shipments = await Shipment.find({}).lean();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      const exportRecords = shipments.map((shipment) => ({
        shipmentId: shipment.shipmentId,
        title: shipment.title,
        status: shipment.status,
        description: shipment.description || '',
        pickupCity: shipment.pickup?.city,
        pickupState: shipment.pickup?.state,
        pickupZip: shipment.pickup?.zip,
        deliveryCity: shipment.delivery?.city,
        deliveryState: shipment.delivery?.state,
        deliveryZip: shipment.delivery?.zip,
        createdAt: shipment.createdAt ? new Date(shipment.createdAt).toISOString() : '',
        updatedAt: shipment.updatedAt ? new Date(shipment.updatedAt).toISOString() : '',
      }));

      await this.logAction(req, 'EXPORT_SHIPMENTS', 'Exported shipments report', {
        targetCollection: 'shipments',
        format,
        count: exportRecords.length,
      });

      if (format === 'csv') {
        const fields = Object.keys(exportRecords[0] || {});
        const csvRows = [fields.join(',')];
        for (const record of exportRecords) {
          const row = fields.map((field) => {
            const value = (record as Record<string, unknown>)[field];
            if (value === undefined || value === null) return '';
            return String(value).replace(/"/g, '""');
          });
          csvRows.push(row.map((column) => (column.includes(',') ? `"${column}"` : column)).join(','));
        }
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="shipments-${timestamp}.csv"`);
        res.status(200).send(csvRows.join('\n'));
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="shipments-${timestamp}.json"`);
      res.status(200).send(
        JSON.stringify({
          exportDate: new Date().toISOString(),
          totalShipments: exportRecords.length,
          shipments: exportRecords,
        }),
      );
    } catch (error: any) {
      logger.error('Admin exportShipments failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to export shipments' });
    }
  }

  /**
   * GET /api/admin/system-stats
   */
  async getSystemStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const [
        totalUsers,
        activeUsers,
        adminUsers,
        carrierCount,
        brokerCount,
        shipperCount,
        totalLoads,
        openLoads,
        bookedLoads,
        inTransitLoads,
        deliveredLoads,
        readyForBillingLoads,
        totalShipments,
        openShipments,
        totalMessages,
        totalDocuments,
        verifiedDocuments,
        laneAggregation,
        bookingSpeedAggregation,
      ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ accountType: 'carrier' }),
        User.countDocuments({ accountType: 'broker' }),
        User.countDocuments({ accountType: 'shipper' }),
        Load.countDocuments({}),
        Load.countDocuments({ status: 'available' }),
        Load.countDocuments({ status: 'booked' }),
        Load.countDocuments({ status: 'in_transit' }),
        Load.countDocuments({ status: 'delivered' }),
        Load.countDocuments({ billingStatus: { $in: ['ready', 'invoiced'] } }),
        Shipment.countDocuments({}),
        Shipment.countDocuments({ status: 'open' }),
        Message.countDocuments({}),
        Document.countDocuments({}),
        Document.countDocuments({ isVerified: true }),
        Load.aggregate([
          {
            $match: {
              status: { $in: ['available', 'booked', 'in_transit'] },
            },
          },
          {
            $group: {
              _id: {
                origin: '$origin.state',
                destination: '$destination.state',
              },
            },
          },
          {
            $count: 'count',
          },
        ]),
        Load.aggregate([
          {
            $match: {
              bookedAt: { $ne: null },
              createdAt: { $ne: null },
            },
          },
          {
            $project: {
              durationHours: {
                $divide: [
                  { $subtract: ['$bookedAt', '$createdAt'] },
                  1000 * 60 * 60,
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              averageHours: { $avg: '$durationHours' },
            },
          },
        ]),
      ]);

      const activeLaneCount = laneAggregation[0]?.count ?? 0;
      const averageHoursToBook = bookingSpeedAggregation[0]?.averageHours ?? 0;
      const conversionRate = totalLoads > 0 ? Number(((bookedLoads / totalLoads) * 100).toFixed(1)) : 0;
      const documentVerificationRate =
        totalDocuments > 0 ? Number(((verifiedDocuments / totalDocuments) * 100).toFixed(1)) : 0;

      const stats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          admin: adminUsers,
          carriers: carrierCount,
          brokers: brokerCount,
          shippers: shipperCount,
        },
        loads: {
          total: totalLoads,
          open: openLoads,
          booked: bookedLoads,
          inTransit: inTransitLoads,
          delivered: deliveredLoads,
          readyForBilling: readyForBillingLoads,
        },
        shipments: {
          total: totalShipments,
          open: openShipments,
        },
        messages: {
          total: totalMessages,
        },
        documents: {
          total: totalDocuments,
          verified: verifiedDocuments,
          pending: Math.max(totalDocuments - verifiedDocuments, 0),
          verificationRate: documentVerificationRate,
        },
        analytics: {
          conversionRate,
          activeLaneCount,
          averageHoursToBook,
          readyForBilling: readyForBillingLoads,
        },
        generatedAt: new Date().toISOString(),
      };

      await this.logAction(req, 'VIEW_SYSTEM_STATS', 'Viewed system statistics', { targetCollection: 'system' });

      res.json({ success: true, data: stats });
    } catch (error: any) {
      logger.error('Admin getSystemStats failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch system stats' });
    }
  }

  /**
   * GET /api/admin/audit-logs
   */
  async getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '50', action, collection, adminId, startDate, endDate, search } = req.query;
      const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
      const limitNum = Math.min(Math.max(parseInt(String(limit), 10) || 50, 1), 200);

      const filter: Record<string, unknown> = {};
      if (action && typeof action === 'string') {
        filter.action = new RegExp(action, 'i');
      }

      if (collection && typeof collection === 'string') {
        filter.targetCollection = new RegExp(collection, 'i');
      }

      if (adminId && typeof adminId === 'string') {
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
          res.status(400).json({ success: false, error: 'Invalid admin ID filter' });
          return;
        }
        filter.admin = adminId;
      }

      if ((startDate && typeof startDate === 'string') || (endDate && typeof endDate === 'string')) {
        filter.createdAt = {};
        if (startDate && typeof startDate === 'string') {
          const start = new Date(startDate);
          if (Number.isNaN(start.getTime())) {
            res.status(400).json({ success: false, error: 'Invalid startDate filter' });
            return;
          }
          filter.createdAt.$gte = start;
        }
        if (endDate && typeof endDate === 'string') {
          const endDt = new Date(endDate);
          if (Number.isNaN(endDt.getTime())) {
            res.status(400).json({ success: false, error: 'Invalid endDate filter' });
            return;
          }
          filter.createdAt.$lte = endDt;
        }
      }

      if (search && typeof search === 'string') {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { description: regex },
          { action: regex },
          { targetCollection: regex },
          { ipAddress: regex },
        ];
      }

      const total = await AuditLog.countDocuments(filter);
      const logs = await AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('admin', 'email company')
        .lean();

      await this.logAction(req, 'VIEW_AUDIT_LOGS', 'Viewed audit logs', {
        targetCollection: 'auditLogs',
        actionFilter: action,
        collectionFilter: collection,
        adminFilter: adminId,
        startDate,
        endDate,
        search,
      });

      const response: PaginationResult<Record<string, unknown>> = {
        data: logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
      };

      res.json({ success: true, ...response });
    } catch (error: any) {
      logger.error('Admin getAuditLogs failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
    }
  }

  async purgeAuditLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { days } = req.params;
      const retentionDays = parseInt(days ?? '', 10);
      if (Number.isNaN(retentionDays) || retentionDays <= 0) {
        res.status(400).json({ success: false, error: 'Retention days must be a positive integer' });
        return;
      }

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - retentionDays);

      const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });

      await this.logAction(req, 'PURGE_AUDIT_LOGS', 'Purged audit logs by retention policy', {
        targetCollection: 'auditLogs',
        retentionDays,
        deletedCount: result.deletedCount ?? 0,
      });

      res.json({ success: true, deleted: result.deletedCount ?? 0 });
    } catch (error: any) {
      logger.error('Admin purgeAuditLogs failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to purge audit logs' });
    }
  }

  private async logAction(req: AuthRequest, action: string, description: string, metadata: Record<string, unknown> = {}): Promise<void> {
    try {
      if (!req.user?.userId) return;

      await AuditLog.create({
        admin: req.user.userId,
        action,
        description,
        targetCollection: metadata.targetCollection as string | undefined,
        targetId: metadata.targetUserId as string | undefined,
        metadata,
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
        userAgent: req.headers['user-agent'],
      });
    } catch (error) {
      logger.warn('Failed to create audit log', { error });
    }
  }
}

export const adminController = new AdminController();

