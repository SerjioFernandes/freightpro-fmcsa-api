import { useEffect, useCallback } from 'react';
import { websocketService } from '../services/websocket.service';
import { useAuthStore } from '../store/authStore';

/**
 * Hook for WebSocket integration
 * Automatically connects/disconnects based on auth state
 */
export const useWebSocket = () => {
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      websocketService.connect(token);
      
      return () => {
        websocketService.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  const joinRoom = useCallback((roomName: string) => {
    websocketService.joinRoom(roomName);
  }, []);

  const leaveRoom = useCallback((roomName: string) => {
    websocketService.leaveRoom(roomName);
  }, []);

  const subscribe = useCallback(<T,>(event: string, callback: (data: T) => void) => {
    return websocketService.on<T>(event, callback);
  }, []);

  const emitTypingStart = useCallback((conversationId: string) => {
    websocketService.emitTypingStart(conversationId);
  }, []);

  const emitTypingStop = useCallback((conversationId: string) => {
    websocketService.emitTypingStop(conversationId);
  }, []);

  return {
    isConnected: websocketService.isConnected(),
    joinRoom,
    leaveRoom,
    subscribe,
    emitTypingStart,
    emitTypingStop,
  };
};

