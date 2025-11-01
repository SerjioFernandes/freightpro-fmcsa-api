import { Response } from 'express';
import { Document } from '../models/Document.model.js';
import { AuthRequest } from '../types/index.js';
import { getFileUrl, deleteFile } from '../middleware/upload.middleware.js';
import path from 'path';

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
      isVerified: false
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error: any) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

export const listDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { type, loadId, shipmentId } = req.query;

    const filter: any = { userId };
    if (type) filter.type = type;
    if (loadId) filter.loadId = loadId;
    if (shipmentId) filter.shipmentId = shipmentId;

    const documents = await Document.find(filter)
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      data: documents
    });
  } catch (error: any) {
    console.error('List documents error:', error);
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
    console.error('Get document error:', error);
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
    console.error('Download document error:', error);
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
    console.error('Delete document error:', error);
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
    console.error('Link document error:', error);
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
    console.error('Link document error:', error);
    res.status(500).json({ error: 'Failed to link document' });
  }
};

