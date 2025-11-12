import { Response } from 'express';
import { Message } from '../models/Message.model.js';
import { User } from '../models/User.model.js';
import { AuthRequest } from '../types/index.js';
import mongoose from 'mongoose';
import { websocketService } from '../services/websocket.service.js';
import { logger } from '../utils/logger.js';
import { checkFriendship } from './friend.controller.js';

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get all unique users you've had conversations with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          userId: '$_id',
          company: '$user.company',
          email: '$user.email',
          accountType: '$user.accountType',
          lastMessage: {
            subject: '$lastMessage.subject',
            message: '$lastMessage.message',
            createdAt: '$lastMessage.createdAt'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json({
      success: true,
      data: conversations
    });
  } catch (error: any) {
    logger.error('Get conversations failed', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const otherUserId = req.params.userId;

    if (!userId || !otherUserId) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const isAdmin = req.user?.role === 'admin';
    const areFriends = await checkFriendship(userId, otherUserId);

    if (!isAdmin && !areFriends) {
      res.status(403).json({ error: 'You must be connected before viewing this conversation' });
      return;
    }

    const unreadMessages = await Message.find({
      sender: otherUserId,
      receiver: userId,
      isRead: false
    }).select('_id');

    // Get all messages between current user and other user
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
      .populate('sender', 'company email accountType')
      .populate('receiver', 'company email accountType')
      .sort({ createdAt: 1 });

    // Mark messages as read
    if (unreadMessages.length > 0) {
      await Message.updateMany(
        {
          sender: otherUserId,
          receiver: userId,
          isRead: false
        },
        {
          $set: { isRead: true }
        }
      );

      const conversationId = [userId, otherUserId].sort().join('_');
      websocketService.emitToRoom(`conversation_${conversationId}`, 'messages_read', {
        messageIds: unreadMessages.map((message) => message._id.toString()),
        readerId: userId,
      });
    }

    res.json({
      success: true,
      data: messages
    });
  } catch (error: any) {
    logger.error('Get conversation failed', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { receiverId, subject, message } = req.body;

    if (!userId || !receiverId || !subject || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(404).json({ error: 'Receiver not found' });
      return;
    }

    const isAdmin = req.user?.role === 'admin';
    const areFriends = await checkFriendship(userId, receiverId);

    if (!isAdmin && !areFriends) {
      res.status(403).json({ error: 'Send a connection request before messaging this user' });
      return;
    }

    // Create message
    const newMessage = await Message.create({
      sender: userId,
      receiver: receiverId,
      subject,
      message,
      isRead: false
    });

    // Populate before sending
    await newMessage.populate('sender', 'company email accountType');
    await newMessage.populate('receiver', 'company email accountType');

    // Generate conversation ID (consistent ordering: smaller ID first)
    const conversationId = [userId, receiverId].sort().join('_');
    
    // Broadcast new message via WebSocket to both sender and receiver
    websocketService.emitToUser(receiverId, 'new_message', {
      ...newMessage.toObject(),
      conversationId
    });
    websocketService.emitToUser(userId, 'new_message', {
      ...newMessage.toObject(),
      conversationId
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error: any) {
    logger.error('Send message failed', { error: error.message });
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.json({
      success: true,
      data: { count: unreadCount }
    });
  } catch (error: any) {
    logger.error('Get unread count failed', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

export const editMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { message } = req.body;

    const msg = await Message.findById(req.params.id);

    if (!msg) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    // Check if user is the sender
    if (msg.sender.toString() !== userId) {
      res.status(403).json({ error: 'You can only edit your own messages' });
      return;
    }

    // Only allow editing within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (msg.createdAt < fiveMinutesAgo) {
      res.status(400).json({ error: 'Messages can only be edited within 5 minutes' });
      return;
    }

    // Update message
    msg.message = message;
    msg.isEdited = true;
    msg.editedAt = new Date();
    await msg.save();

    // Broadcast message update via WebSocket
    websocketService.emitToUser(msg.receiver.toString(), 'message_updated', msg);

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: msg
    });
  } catch (error: any) {
    logger.error('Edit message failed', { error: error.message });
    res.status(500).json({ error: 'Failed to edit message' });
  }
};

export const getAvailableUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get all users except current user, limit to verified users only
    const users = await User.find({
      _id: { $ne: userId },
      isEmailVerified: true
    })
      .select('company email accountType usdotNumber mcNumber')
      .sort({ company: 1 })
      .limit(100);

    res.json({
      success: true,
      data: users
    });
  } catch (error: any) {
    logger.error('Get available users failed', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const msg = await Message.findById(req.params.id);

    if (!msg) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    // Check if user is the sender
    if (msg.sender.toString() !== userId) {
      res.status(403).json({ error: 'You can only delete your own messages' });
      return;
    }

    await msg.deleteOne();

    // Broadcast message deletion via WebSocket
    websocketService.emitToUser(msg.receiver.toString(), 'message_deleted', { 
      messageId: msg._id,
      conversationId: msg.sender === msg.receiver ? msg.sender.toString() : undefined
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error: any) {
    logger.error('Delete message failed', { error: error.message });
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

