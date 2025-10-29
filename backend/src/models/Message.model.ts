import mongoose, { Schema, Model } from 'mongoose';
import { IMessage } from '../types/index.js';

const messageSchema = new Schema<IMessage>({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  load: { type: Schema.Types.ObjectId, ref: 'Load' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);




