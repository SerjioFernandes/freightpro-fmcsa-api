import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../types/index.js';
import { FriendRequest } from '../models/FriendRequest.model.js';
import { User } from '../models/User.model.js';
import { logger } from '../utils/logger.js';

const toObjectId = (value: string | undefined, field: string): mongoose.Types.ObjectId => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`Invalid ObjectId for ${field}`);
  }
  return new mongoose.Types.ObjectId(value);
};

export const sendFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { recipientId } = req.body as { recipientId?: string };

    if (!userId || !recipientId) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    const requesterObjectId = toObjectId(userId, 'requester');
    const recipientObjectId = toObjectId(recipientId, 'recipient');

    if (requesterObjectId.equals(recipientObjectId)) {
      res.status(400).json({ success: false, error: 'You cannot connect with yourself' });
      return;
    }

    const recipientExists = await User.exists({ _id: recipientObjectId });
    if (!recipientExists) {
      res.status(404).json({ success: false, error: 'Recipient not found' });
      return;
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { requester: requesterObjectId, recipient: recipientObjectId },
        { requester: recipientObjectId, recipient: requesterObjectId },
      ],
    });

    if (existing) {
      if (existing.status === 'pending') {
        res.status(400).json({ success: false, error: 'Friend request already pending' });
        return;
      }

      if (existing.status === 'accepted') {
        res.status(400).json({ success: false, error: 'You are already connected' });
        return;
      }

      existing.requester = requesterObjectId;
      existing.recipient = recipientObjectId;
      existing.status = 'pending';
      existing.respondedAt = undefined;
      await existing.save();

      res.status(201).json({ success: true, message: 'Friend request resent', data: existing });
      return;
    }

    const request = await FriendRequest.create({
      requester: requesterObjectId,
      recipient: recipientObjectId,
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Friend request sent', data: request });
  } catch (error: any) {
    logger.error('Send friend request failed', {
      error: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });
    res.status(500).json({ success: false, error: 'Failed to send friend request' });
  }
};

export const sendFriendRequestByUniqueId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { uniqueUserId } = req.body as { uniqueUserId?: string };
    if (!uniqueUserId) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const normalizedId = uniqueUserId.trim().toUpperCase();
    const recipient = await User.findOne({ uniqueUserId: normalizedId });
    if (!recipient) {
      res.status(404).json({ success: false, error: 'User ID not found' });
      return;
    }

    req.body.recipientId = recipient._id.toString();
    await sendFriendRequest(req, res);
  } catch (error: any) {
    logger.error('Send friend request by ID failed', {
      error: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });
    res.status(500).json({ success: false, error: 'Failed to send friend request' });
  }
};

export const respondToFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { requestId } = req.params;
    const { action } = req.body as { action: 'accept' | 'decline' };

    if (!userId || !requestId || !action) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }

    if (request.recipient.toString() !== userId) {
      res.status(403).json({ success: false, error: 'Not authorized to respond to this request' });
      return;
    }

    if (request.status !== 'pending') {
      res.status(400).json({ success: false, error: 'Request already processed' });
      return;
    }

    request.status = action === 'accept' ? 'accepted' : 'declined';
    request.respondedAt = new Date();
    await request.save();

    res.json({ success: true, message: `Request ${action}ed`, data: request });
  } catch (error: any) {
    logger.error('Respond to friend request failed', {
      error: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });
    res.status(500).json({ success: false, error: 'Failed to update friend request' });
  }
};

export const cancelFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { requestId } = req.params;

    if (!userId || !requestId) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }

    if (request.requester.toString() !== userId) {
      res.status(403).json({ success: false, error: 'Not authorized to cancel this request' });
      return;
    }

    await request.deleteOne();

    res.json({ success: true, message: 'Request cancelled' });
  } catch (error: any) {
    logger.error('Cancel friend request failed', {
      error: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });
    res.status(500).json({ success: false, error: 'Failed to cancel request' });
  }
};

export const listFriendRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { type = 'incoming' } = req.query as { type?: 'incoming' | 'outgoing' | 'all' };

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const userObjectId = toObjectId(userId, 'user');

    const filter: Record<string, unknown>[] = [];

    if (type === 'incoming' || type === 'all') {
      filter.push({ recipient: userObjectId, status: 'pending' });
    }

    if (type === 'outgoing' || type === 'all') {
      filter.push({ requester: userObjectId, status: 'pending' });
    }

    const query = filter.length > 0 ? { $or: filter } : { status: 'pending' };

    const requests = await FriendRequest.find(query)
      .populate('requester', 'company email accountType')
      .populate('recipient', 'company email accountType')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error: any) {
    logger.error('List friend requests failed', {
      error: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });
    res.status(500).json({ success: false, error: 'Failed to fetch requests' });
  }
};

export const listFriends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const userObjectId = toObjectId(userId, 'user');

    const connections = await FriendRequest.find({
      status: 'accepted',
      $or: [
        { requester: userObjectId },
        { recipient: userObjectId },
      ],
    })
      .populate('requester', 'company email accountType')
      .populate('recipient', 'company email accountType')
      .sort({ respondedAt: -1, createdAt: -1 })
      .lean();

    const friends = connections.map((connection: any) => {
      const friend = connection.requester._id.toString() === userObjectId.toString()
        ? connection.recipient
        : connection.requester;
      return {
        connectionId: connection._id,
        friendId: friend._id,
        company: friend.company,
        email: friend.email,
        accountType: friend.accountType,
        connectedAt: connection.respondedAt || connection.createdAt,
      };
    });

    res.json({ success: true, data: friends });
  } catch (error: any) {
    logger.error('List friends failed', {
      error: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });
    res.status(500).json({ success: false, error: 'Failed to fetch connections' });
  }
};

export const checkFriendship = async (userA: string, userB: string): Promise<boolean> => {
  if (!userA || !userB) return false;
  const record = await FriendRequest.findOne({
    status: 'accepted',
    $or: [
      { requester: userA, recipient: userB },
      { requester: userB, recipient: userA },
    ],
  }).lean();
  return !!record;
};

