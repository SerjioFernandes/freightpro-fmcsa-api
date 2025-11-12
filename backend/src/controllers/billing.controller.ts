import { Response } from 'express';
import { Load } from '../models/Load.model.js';
import { Document } from '../models/Document.model.js';
import { AuthRequest, InvoicePreview } from '../types/index.js';
import { logger } from '../utils/logger.js';

const computeLineHaulTotal = (
  rateType: 'per_mile' | 'flat_rate',
  baseRate: number,
  agreedRate: number | undefined,
  distance?: number | null
): number => {
  if (rateType === 'per_mile' && typeof distance === 'number' && distance > 0) {
    return (agreedRate ?? baseRate) * distance;
  }
  return agreedRate ?? baseRate;
};

type PartyLike = {
  company?: string;
  email?: string;
  phone?: string;
} | null | undefined;

const sanitizeParty = (party: PartyLike) => ({
  company: party?.company ?? '',
  email: party?.email ?? '',
  phone: party?.phone ?? '',
});

export const previewInvoiceForLoad = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const load = await Load.findById(id)
      .populate('postedBy', 'company email phone')
      .populate('bookedBy', 'company email phone');

    if (!load) {
      res.status(404).json({ error: 'Load not found' });
      return;
    }

    const userId = req.user?.userId;
    const accountType = req.user?.accountType;
    const isAdmin = req.user?.role === 'admin';
    const isBroker = accountType === 'broker' && load.postedBy?.toString?.() === userId;
    const isCarrier = accountType === 'carrier' && load.bookedBy?.toString?.() === userId;

    if (!isAdmin && !isBroker && !isCarrier) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const documents = await Document.find({ loadId: load._id }).sort({ uploadedAt: 1 });

    const preview: InvoicePreview = {
      loadId: load._id.toString(),
      title: load.title,
      pickupDate: load.pickupDate,
      deliveryDate: load.deliveryDate,
      rateType: load.rateType,
      rate: load.rate,
      agreedRate: load.agreedRate ?? undefined,
      distance: typeof load.distance === 'number' ? load.distance : null,
      totalDue: computeLineHaulTotal(load.rateType, load.rate, load.agreedRate ?? undefined, load.distance),
      billingStatus: load.billingStatus,
      broker: sanitizeParty(load.postedBy as PartyLike),
      carrier: load.bookedBy ? sanitizeParty(load.bookedBy as PartyLike) : undefined,
      documents: documents.map((doc) => ({
        id: doc._id.toString(),
        originalName: doc.originalName,
        type: doc.type,
        isVerified: doc.isVerified,
        uploadedAt: doc.uploadedAt,
      })),
      bookingNotes: load.bookingNotes ?? '',
    };

    res.json({
      success: true,
      data: preview,
    });
  } catch (error: any) {
    logger.error('Preview invoice failed', { error: error.message });
    res.status(500).json({ error: 'Failed to generate invoice preview' });
  }
};

export const listReadyInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: Record<string, any> = {
      billingStatus: { $in: ['ready', 'invoiced', 'paid'] },
    };

    if (req.user?.role !== 'admin' && req.user?.accountType === 'broker') {
      query.postedBy = req.user.userId;
    } else if (req.user?.role !== 'admin' && req.user?.accountType === 'carrier') {
      query.bookedBy = req.user.userId;
    }

    const loads = await Load.find(query)
      .select('title pickupDate deliveryDate rate rateType agreedRate billingStatus distance postedBy bookedBy')
      .sort({ updatedAt: -1 })
      .populate('postedBy', 'company')
      .populate('bookedBy', 'company');

    const invoices = loads.map((load) => ({
      loadId: load._id.toString(),
      title: load.title,
      pickupDate: load.pickupDate,
      deliveryDate: load.deliveryDate,
      totalDue: computeLineHaulTotal(load.rateType, load.rate, load.agreedRate ?? undefined, load.distance),
      billingStatus: load.billingStatus,
      broker: (load.postedBy as PartyLike)?.company ?? '',
      carrier: (load.bookedBy as PartyLike)?.company ?? '',
    }));

    res.json({
      success: true,
      data: invoices,
    });
  } catch (error: any) {
    logger.error('List ready invoices failed', { error: error.message });
    res.status(500).json({ error: 'Failed to list billing records' });
  }
};

