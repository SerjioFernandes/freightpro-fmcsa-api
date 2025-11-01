import mongoose, { Schema, Model } from 'mongoose';
import { ILoad } from '../types/index.js';

const loadSchema = new Schema<ILoad>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  origin: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'US', enum: ['US', 'CA'] },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  destination: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'US', enum: ['US', 'CA'] },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  pickupDate: { type: Date, required: true },
  deliveryDate: { type: Date, required: true },
  equipmentType: { type: String, required: true },
  weight: { type: Number, required: true },
  rate: { type: Number, required: true },
  rateType: { type: String, enum: ['per_mile', 'flat_rate'], default: 'per_mile' },
  distance: { type: Number },
  
  // Load Status
  status: { type: String, enum: ['available', 'booked', 'in_transit', 'delivered', 'cancelled'], default: 'available' },
  
  // Shipment Linkage
  shipmentId: { type: String, default: '' },
  unlinked: { type: Boolean, default: false },
  
  // Relationships
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  shipment: { type: Schema.Types.ObjectId, ref: 'Shipment' },
  
  // Authority validation
  isInterstate: { type: Boolean, default: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
loadSchema.index({ status: 1, pickupDate: 1 }); // For filtering loads by status and date
loadSchema.index({ postedBy: 1, status: 1 }); // For broker's posted loads
loadSchema.index({ bookedBy: 1, status: 1 }); // For carrier's booked loads
loadSchema.index({ 'origin.state': 1, 'destination.state': 1 }); // For route filtering
loadSchema.index({ equipmentType: 1, status: 1 }); // For equipment type filtering
loadSchema.index({ createdAt: -1 }); // For recent loads

// Geospatial indexes for map queries
loadSchema.index({ 'origin.coordinates.lat': 1, 'origin.coordinates.lng': 1 }); // 2dsphere not supported, use 2d compound
loadSchema.index({ 'destination.coordinates.lat': 1, 'destination.coordinates.lng': 1 });

export const Load: Model<ILoad> = mongoose.model<ILoad>('Load', loadSchema);




