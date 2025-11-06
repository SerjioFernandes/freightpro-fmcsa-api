import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../utils/constants';

type SocketEventCallback = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<SocketEventCallback>> = new Map();
  private connectionAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Initialize socket connection
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      if (import.meta.env.DEV) console.log('[WebSocket] Already connected');
      return;
    }

    // Get backend WebSocket URL (same as API without /api)
    const wsUrl = API_BASE_URL.replace('/api', '').trim();

    if (import.meta.env.DEV) console.log('[WebSocket] Connecting to server', { url: wsUrl });

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventHandlers();
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      if (import.meta.env.DEV) console.log('[WebSocket] Connected', { socketId: this.socket?.id });
      this.connectionAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      if (import.meta.env.DEV) console.warn('[WebSocket] Disconnected', { reason });
      
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      // Always log connection errors as they're important
      console.error('[WebSocket] Connection error', { message: error.message });
      this.connectionAttempts++;
      
      if (this.connectionAttempts >= this.maxReconnectAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached');
      }
    });

    // Listen for real-time events
    this.socket.on('new_load', (data: any) => {
      this.emitToListeners('new_load', data);
    });

    this.socket.on('load_updated', (data: any) => {
      this.emitToListeners('load_updated', data);
    });

    this.socket.on('new_message', (data: any) => {
      this.emitToListeners('new_message', data);
    });

    this.socket.on('message_updated', (data: any) => {
      this.emitToListeners('message_updated', data);
    });

    this.socket.on('message_deleted', (data: any) => {
      this.emitToListeners('message_deleted', data);
    });

    this.socket.on('notification', (data: any) => {
      this.emitToListeners('notification', data);
    });
  }

  /**
   * Emit event to listeners
   */
  private emitToListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Subscribe to socket event
   */
  on(event: string, callback: SocketEventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Join a room
   */
  joinRoom(roomName: string): void {
    if (this.socket?.connected) {
      if (roomName.startsWith('load_')) {
        this.socket.emit('join_load_room', roomName.replace('load_', ''));
      } else if (roomName.startsWith('conversation_')) {
        this.socket.emit('join_conversation', roomName.replace('conversation_', ''));
      }
      if (import.meta.env.DEV) console.log('[WebSocket] Joined room', roomName);
    }
  }

  /**
   * Leave a room
   */
  leaveRoom(roomName: string): void {
    if (this.socket?.connected) {
      if (roomName.startsWith('load_')) {
        this.socket.emit('leave_load_room', roomName.replace('load_', ''));
      } else if (roomName.startsWith('conversation_')) {
        this.socket.emit('leave_conversation', roomName.replace('conversation_', ''));
      }
      if (import.meta.env.DEV) console.log('[WebSocket] Left room', roomName);
    }
  }

  /**
   * Emit typing start
   */
  emitTypingStart(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  /**
   * Emit typing stop
   */
  emitTypingStop(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      if (import.meta.env.DEV) console.log('[WebSocket] Disconnected');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();

