import mongoose, { Schema, Model } from 'mongoose';
import type { ISupportTicket } from '../types/index.js';

const supportTicketSchema = new Schema<ISupportTicket>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open', index: true },
  response: { type: String },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

supportTicketSchema.pre('save', function preSave(next) {
  this.updatedAt = new Date();
  next();
});

supportTicketSchema.pre('findOneAndUpdate', function preUpdate(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export const SupportTicket: Model<ISupportTicket> = mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);


