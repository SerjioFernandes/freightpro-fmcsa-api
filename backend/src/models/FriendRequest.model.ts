import mongoose, { Schema, Model } from 'mongoose';

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

interface IFriendRequest {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: FriendRequestStatus;
  respondedAt?: Date;
  createdAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending', index: true },
    respondedAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

friendRequestSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const FriendRequest: Model<IFriendRequest> = mongoose.model<IFriendRequest>('FriendRequest', friendRequestSchema);

export type { IFriendRequest };


