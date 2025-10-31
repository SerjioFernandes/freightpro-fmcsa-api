import mongoose, { Schema, Model } from 'mongoose';
import { IShipment, IShipmentRequest } from '../types/index.js';

const shipmentSchema = new Schema<IShipment>({
  shipmentId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  pickup: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true }
  },
  delivery: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true }
  },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
shipmentSchema.index({ postedBy: 1, status: 1 }); // For shipper's shipments
shipmentSchema.index({ status: 1, createdAt: -1 }); // For filtering shipments
shipmentSchema.index({ createdAt: -1 }); // For recent shipments

const shipmentRequestSchema = new Schema<IShipmentRequest>({
  shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true },
  brokerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shipperId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  brokerMessage: { type: String, maxlength: 500, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
  shipperResponse: { type: String, maxlength: 500, default: '' }
});

// Indexes for performance
shipmentRequestSchema.index({ shipmentId: 1, status: 1 }); // For shipment requests
shipmentRequestSchema.index({ brokerId: 1, status: 1 }); // For broker's requests
shipmentRequestSchema.index({ shipperId: 1, status: 1 }); // For shipper's pending requests

export const Shipment: Model<IShipment> = mongoose.model<IShipment>('Shipment', shipmentSchema);
export const ShipmentRequest: Model<IShipmentRequest> = mongoose.model<IShipmentRequest>('ShipmentRequest', shipmentRequestSchema);




