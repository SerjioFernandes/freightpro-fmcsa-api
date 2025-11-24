import { Response } from 'express';
import { Document } from '../models/Document.model.js';
import { AuthRequest } from '../types/index.js';
import { DocumentFilter } from '../types/query.types.js';
import { getFileUrl, deleteFile } from '../middleware/upload.middleware.js';
import path from 'path';
import { logger } from '../utils/logger.js';
import { Types } from 'mongoose';

const allowedDocumentTypes = ['BOL', 'POD', 'INSURANCE', 'LICENSE', 'CARRIER_AUTHORITY', 'W9', 'OTHER'];

const sanitizeTags = (raw: unknown): string[] => {
  if (!raw) return [];

  let values: string[] = [];

  if (Array.isArray(raw)) {
    values = raw as string[];
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        values = parsed as string[];
      } else {
        values = trimmed.split(',');
      }
    } catch {
      values = trimmed.split(',');
    }
  }

  return Array.from(
    new Set(
      values
        .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
        .filter(Boolean)
        .map((tag) => (tag.length > 32 ? tag.slice(0, 32) : tag))
    )
  );
};

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { type, loadId, shipmentId } = req.body;
    const userId = req.user?.userId;

    if (!type || !userId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!allowedDocumentTypes.includes(type)) {
      res.status(400).json({ error: 'Invalid document type' });
      return;
    }

    const tags = sanitizeTags(req.body.tags);

    // Create document record
    const document = await Document.create({
      userId,
      loadId: loadId || undefined,
      shipmentId: shipmentId || undefined,
      type,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: getFileUrl(req.file.filename, 'document'),
      isVerified: false,
      tags
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error: any) {
    logger.error('Upload document failed', { error: error.message });
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

export const listDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { type, loadId, shipmentId, tag } = req.query;

    const filter: DocumentFilter = { userId: userId || '' };
    if (type && typeof type === 'string') filter.type = type;
    if (loadId && typeof loadId === 'string') filter.loadId = loadId;
    if (shipmentId && typeof shipmentId === 'string') filter.shipmentId = shipmentId;
    if (tag && typeof tag === 'string') filter.tags = tag;

    const documents = await Document.find(filter)
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      data: documents
    });
  } catch (error: any) {
    logger.error('List documents failed', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

export const getDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check ownership or admin
    if (document.userId.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error: any) {
    logger.error('Get document failed', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

export const downloadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check ownership or admin
    if (document.userId.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const filepath = path.join(process.cwd(), 'uploads', 'documents', document.filename);
    res.download(filepath, document.originalName);
  } catch (error: any) {
    logger.error('Download document failed', { error: error.message });
    res.status(500).json({ error: 'Failed to download document' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check ownership or admin
    if (document.userId.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Delete file from disk
    const filepath = path.join(process.cwd(), 'uploads', 'documents', document.filename);
    deleteFile(filepath);

    // Delete from database
    await document.deleteOne();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error: any) {
    logger.error('Delete document failed', { error: error.message });
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

export const linkToLoad = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const { loadId } = req.body;
    document.loadId = loadId;
    await document.save();

    res.json({
      success: true,
      message: 'Document linked to load successfully',
      data: document
    });
  } catch (error: any) {
    logger.error('Link document to load failed', { error: error.message });
    res.status(500).json({ error: 'Failed to link document' });
  }
};

export const linkToShipment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const { shipmentId } = req.body;
    document.shipmentId = shipmentId;
    await document.save();

    res.json({
      success: true,
      message: 'Document linked to shipment successfully',
      data: document
    });
  } catch (error: any) {
    logger.error('Link document to shipment failed', { error: error.message });
    res.status(500).json({ error: 'Failed to link document' });
  }
};

export const updateDocumentMetadata = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && document.userId.toString() !== req.user?.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { type, isVerified, expiresAt, loadId, shipmentId, tags } = req.body ?? {};

    if (type && !allowedDocumentTypes.includes(type)) {
      res.status(400).json({ error: 'Invalid document type' });
      return;
    }

    if (type) document.type = type;

    if (typeof isVerified === 'boolean') {
      document.isVerified = isVerified;
      if (isVerified) {
        document.verifiedBy = req.user?.userId ? (req.user.userId as unknown as Types.ObjectId) : document.verifiedBy;
        document.verifiedAt = new Date();
      } else {
        document.verifiedBy = undefined;
        document.verifiedAt = undefined;
      }
    }

    if (expiresAt !== undefined) {
      document.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
    }

    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'loadId')) {
      document.loadId = loadId || undefined;
    }

    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'shipmentId')) {
      document.shipmentId = shipmentId || undefined;
    }

    if (tags !== undefined) {
      document.tags = sanitizeTags(tags);
    }

    await document.save();

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error: any) {
    logger.error('Update document metadata failed', { error: error.message });
    res.status(500).json({ error: 'Failed to update document' });
  }
};

export const bulkUpdateDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentIds, action, tags } = req.body ?? {};

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      res.status(400).json({ error: 'documentIds must be a non-empty array' });
      return;
    }

    const documents = await Document.find({ _id: { $in: documentIds } });
    if (documents.length === 0) {
      res.status(404).json({ error: 'No documents found for the provided IDs' });
      return;
    }

    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?.userId;

    if (!isAdmin) {
      const unauthorized = documents.some((doc) => doc.userId.toString() !== userId);
      if (unauthorized) {
        res.status(403).json({ error: 'Access denied for one or more documents' });
        return;
      }
    }

    let affected = 0;

    switch (action) {
      case 'verify': {
        const result = await Document.updateMany(
          { _id: { $in: documentIds } },
          {
            $set: {
              isVerified: true,
              verifiedBy: userId,
              verifiedAt: new Date(),
            },
          }
        );
        affected = result.modifiedCount ?? result.matchedCount ?? 0;
        break;
      }
      case 'unverify': {
        const result = await Document.updateMany(
          { _id: { $in: documentIds } },
          {
            $set: { isVerified: false },
            $unset: { verifiedBy: '', verifiedAt: '' },
          }
        );
        affected = result.modifiedCount ?? result.matchedCount ?? 0;
        break;
      }
      case 'delete': {
        for (const doc of documents) {
          const filepath = path.join(process.cwd(), 'uploads', 'documents', doc.filename);
          deleteFile(filepath);
          await doc.deleteOne();
          affected += 1;
        }
        break;
      }
      case 'tag': {
        const sanitizedTags = sanitizeTags(tags);
        const result = await Document.updateMany(
          { _id: { $in: documentIds } },
          { $set: { tags: sanitizedTags } }
        );
        affected = result.modifiedCount ?? result.matchedCount ?? 0;
        break;
      }
      default:
        res.status(400).json({ error: 'Unsupported bulk action' });
        return;
    }

    res.json({
      success: true,
      message: 'Bulk document action completed successfully',
      data: { affected },
    });
  } catch (error: any) {
    logger.error('Bulk document update failed', { error: error.message });
    res.status(500).json({ error: 'Failed to process bulk document action' });
  }
};

