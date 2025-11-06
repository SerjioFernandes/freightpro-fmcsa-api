import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jsonwebtoken from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import { config } from '../config/environment.js';
import { JWTPayload } from '../types/index.js';
import { User } from '../models/User.model.js';

interface SocketUser {
  userId: string;
  email: string;
  accountType: string;
  company: string;
}

interface Room {
  users: Set<string>;
  name: string;
  type: 'user' | 'load' | 'conversation';
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private rooms: Map<string, Room> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private socketUsers: Map<string, SocketUser> = new Map(); // socketId -> user

  /**
   * Initialize Socket.IO server
   */
  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          
          // Allow all origins (handled by CORS on express level)
          callback(null, true);
        },
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));

    logger.info('WebSocket server initialized');
  }

  /**
   * Authenticate socket connection
   */
  private async authenticateSocket(socket: Socket, next: (err?: Error) => void): Promise<void> {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jsonwebtoken.verify(token, config.JWT_SECRET) as JWTPayload;

      // Fetch user from database to get company name
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user to socket data
      socket.data.user = {
        userId: decoded.userId,
        email: decoded.email,
        accountType: decoded.accountType,
        company: user.company || ''
      };

      next();
    } catch (error: any) {
      logger.error('Socket authentication failed', { error: error.message });
      next(new Error('Authentication error'));
    }
  }

  /**
   * Handle new socket connection
   */
  private handleConnection(socket: Socket): void {
    const user = socket.data.user as SocketUser;
    
    logger.info('Socket connected', { userId: user.userId, socketId: socket.id });

    // Store socket mapping
    this.userSockets.set(user.userId, socket.id);
    this.socketUsers.set(socket.id, user);

    // Join user-specific room
    this.joinRoom(`user_${user.userId}`, socket, 'user');

    // Join account type room
    this.joinRoom(`account_${user.accountType}`, socket, 'user');

    // Handle events
    this.setupEventHandlers(socket, user);

    // Handle disconnect
    socket.on('disconnect', () => {
      this.handleDisconnect(socket, user);
    });
  }

  /**
   * Setup event handlers for socket
   */
  private setupEventHandlers(socket: Socket, user: SocketUser): void {
    // Load events
    socket.on('join_load_room', (loadId: string) => {
      this.joinRoom(`load_${loadId}`, socket, 'load');
    });

    socket.on('leave_load_room', (loadId: string) => {
      this.leaveRoom(`load_${loadId}`, socket);
    });

    // Conversation events
    socket.on('join_conversation', (conversationId: string) => {
      this.joinRoom(`conversation_${conversationId}`, socket, 'conversation');
    });

    socket.on('leave_conversation', (conversationId: string) => {
      this.leaveRoom(`conversation_${conversationId}`, socket);
    });

    // Typing indicators
    socket.on('typing_start', (data: { conversationId: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: user.userId,
        company: user.company
      });
    });

    socket.on('typing_stop', (data: { conversationId: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_stopped_typing', {
        userId: user.userId
      });
    });
  }

  /**
   * Join a room
   */
  private joinRoom(roomName: string, socket: Socket, type: 'user' | 'load' | 'conversation'): void {
    socket.join(roomName);

    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, {
        users: new Set(),
        name: roomName,
        type
      });
    }

    this.rooms.get(roomName)!.users.add(socket.id);
    logger.debug('Socket joined room', { socketId: socket.id, room: roomName });
  }

  /**
   * Leave a room
   */
  private leaveRoom(roomName: string, socket: Socket): void {
    socket.leave(roomName);
    const room = this.rooms.get(roomName);
    if (room) {
      room.users.delete(socket.id);
      if (room.users.size === 0) {
        this.rooms.delete(roomName);
      }
    }
    logger.debug('Socket left room', { socketId: socket.id, room: roomName });
  }

  /**
   * Handle socket disconnection
   */
  private handleDisconnect(socket: Socket, user: SocketUser): void {
    logger.info('Socket disconnected', { userId: user.userId, socketId: socket.id });

    // Clean up mappings
    this.userSockets.delete(user.userId);
    this.socketUsers.delete(socket.id);

    // Leave all rooms
    this.rooms.forEach((room, roomName) => {
      room.users.delete(socket.id);
      if (room.users.size === 0) {
        this.rooms.delete(roomName);
      }
    });
  }

  /**
   * Emit event to room
   */
  emitToRoom(roomName: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(roomName).emit(event, data);
    logger.debug('Emitted to room', { room: roomName, event, count: this.io.sockets.adapter.rooms.get(roomName)?.size || 0 });
  }

  /**
   * Emit event to user
   */
  emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      logger.debug('Emitted to user', { userId, socketId, event });
    }
  }

  /**
   * Broadcast new load to relevant users
   */
  notifyNewLoad(load: any): void {
    if (!this.io) return;
    
    // Notify all carriers and brokers
    this.io.to('account_carrier').emit('new_load', load);
    this.io.to('account_broker').emit('new_load', load);

    logger.info('Notified new load', { loadId: load._id });
  }

  /**
   * Broadcast load update
   */
  notifyLoadUpdate(loadId: string, updates: any): void {
    if (!this.io) return;
    this.io.to(`load_${loadId}`).emit('load_updated', updates);
    logger.debug('Notified load update', { loadId, updates });
  }

  /**
   * Broadcast new message to conversation room
   */
  notifyNewMessage(message: any): void {
    if (!this.io) return;
    const conversationId = message.conversationId || (message.sender && message.receiver 
      ? [message.sender._id || message.sender, message.receiver._id || message.receiver].sort().join('_')
      : null);
    
    if (conversationId) {
      this.io.to(`conversation_${conversationId}`).emit('new_message', message);
      logger.debug('Notified new message to conversation room', { conversationId, messageId: message._id });
    }
  }

  /**
   * Broadcast notification
   */
  notifyUser(userId: string, notification: any): void {
    this.emitToUser(userId, 'notification', notification);
    logger.debug('Notified user', { userId, notificationId: notification._id });
  }

  /**
   * Get server instance
   */
  getServer(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.io?.sockets.sockets.size || 0;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}

export const websocketService = new WebSocketService();

