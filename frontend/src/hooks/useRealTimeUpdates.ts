import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useLoadStore } from '../store/loadStore';
import { useMessageStore } from '../store/messageStore';

/**
 * Hook for real-time updates using WebSocket
 */
export const useRealTimeUpdates = () => {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const { addLoad, updateLoad } = useLoadStore();
  const { addMessage, updateMessage, deleteMessage } = useMessageStore();
  const { subscribe } = useWebSocket();

  useEffect(() => {
    // Subscribe to new load events (carriers and brokers)
    const unsubscribeNewLoad = subscribe('new_load', (load: unknown) => {
      if (load && typeof load === 'object') {
        addLoad(load as Parameters<typeof addLoad>[0]);
        const loadObj = load as { title?: string };
        addNotification({
          type: 'info',
          message: `New load available: ${loadObj.title || 'Untitled'}`,
          duration: 5000
        });
      }
    });

    // Subscribe to load updates
    const unsubscribeLoadUpdate = subscribe('load_updated', (data: unknown) => {
      if (data && typeof data === 'object') {
        const dataObj = data as { loadId?: string; _id?: string; [key: string]: unknown };
        const loadId = dataObj.loadId || dataObj._id;
        if (loadId && typeof loadId === 'string') {
          updateLoad(loadId, data as Parameters<typeof updateLoad>[1]);
          addNotification({
            type: 'info',
            message: 'Load updated',
            duration: 3000
          });
        }
      }
    });

    // Subscribe to new messages
    const unsubscribeNewMessage = subscribe('new_message', (message: unknown) => {
      if (message && typeof message === 'object') {
        const msgObj = message as { 
          receiver?: { _id?: string } | string; 
          sender?: { company?: string; email?: string; _id?: string } | string;
          _id?: string;
        };
        
        // Extract IDs properly
        const receiverId = typeof msgObj.receiver === 'object' 
          ? msgObj.receiver._id?.toString() 
          : typeof msgObj.receiver === 'string' 
            ? msgObj.receiver 
            : null;
        const senderId = typeof msgObj.sender === 'object' 
          ? msgObj.sender._id?.toString() 
          : typeof msgObj.sender === 'string' 
            ? msgObj.sender 
            : null;
        
        // Only add message if user is involved
        if (user && (receiverId === user.id || senderId === user.id)) {
          addMessage(message as Parameters<typeof addMessage>[0]);
          
          // Only show notification if message is for current user (not sent by them)
          if (receiverId === user.id && senderId !== user.id) {
            const senderName = typeof msgObj.sender === 'object' 
              ? (msgObj.sender.company || msgObj.sender.email || 'Unknown')
              : 'Unknown';
            addNotification({
              type: 'info',
              message: `New message from ${senderName}`,
              duration: 5000
            });
          }
        }
      }
    });

    // Subscribe to message updates
    const unsubscribeMessageUpdate = subscribe('message_updated', (message: unknown) => {
      if (message && typeof message === 'object') {
        updateMessage(message as Parameters<typeof updateMessage>[0]);
      }
    });

    // Subscribe to message deletion
    const unsubscribeMessageDelete = subscribe('message_deleted', (data) => {
      if (data && typeof data === 'object' && 'messageId' in data && typeof (data as { messageId: unknown }).messageId === 'string') {
        deleteMessage((data as { messageId: string }).messageId);
      }
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeNewLoad();
      unsubscribeLoadUpdate();
      unsubscribeNewMessage();
      unsubscribeMessageUpdate();
      unsubscribeMessageDelete();
    };
  }, [subscribe, addLoad, updateLoad, addMessage, updateMessage, deleteMessage, addNotification, user]);
};

