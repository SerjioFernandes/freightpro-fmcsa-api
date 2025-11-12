import mongoose, { Schema, Model } from 'mongoose';
import { IDocument } from '../types/index.js';

const documentSchema = new Schema<IDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  loadId: { type: Schema.Types.ObjectId, ref: 'Load' },
  shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment' },
  type: {
    type: String,
    enum: ['BOL', 'POD', 'INSURANCE', 'LICENSE', 'CARRIER_AUTHORITY', 'W9', 'OTHER'],
    required: true
  },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  tags: { type: [String], default: [] }
});

// Indexes for performance
documentSchema.index({ userId: 1, uploadedAt: -1 });
documentSchema.index({ loadId: 1 });
documentSchema.index({ shipmentId: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ tags: 1 });

export const Document: Model<IDocument> = mongoose.model<IDocument>('Document', documentSchema);

