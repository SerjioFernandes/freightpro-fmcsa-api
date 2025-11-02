import mongoose, { Schema, Model, Types } from 'mongoose';

export interface INotification extends mongoose.Document {
  userId: Types.ObjectId;
  type: 'info' | 'warning' | 'success' | 'error' | 'load_update' | 'message' | 'shipment' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>; // Extra context (loadId, messageId, etc.)
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string; // Optional URL to navigate when clicked
  expiresAt?: Date; // Optional expiry date
  createdAt: Date;
  readAt?: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    required: true,
    enum: ['info', 'warning', 'success', 'error', 'load_update', 'message', 'shipment', 'system'],
    index: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false, index: true },
  isImportant: { type: Boolean, default: false },
  actionUrl: { type: String },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date }
}, {
  timestamps: false // We're managing createdAt manually
});

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 }); // For fetching user notifications
notificationSchema.index({ userId: 1, isRead: 1, isImportant: 1 }); // For filtering
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);

