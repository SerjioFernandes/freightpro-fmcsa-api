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
    const unsubscribeNewLoad = subscribe('new_load', (load) => {
      addLoad(load);
      addNotification({
        type: 'info',
        message: `New load available: ${load.title}`,
        duration: 5000
      });
    });

    // Subscribe to load updates
    const unsubscribeLoadUpdate = subscribe('load_updated', (data) => {
      updateLoad(data.loadId || data._id, data);
      addNotification({
        type: 'info',
        message: 'Load updated',
        duration: 3000
      });
    });

    // Subscribe to new messages
    const unsubscribeNewMessage = subscribe('new_message', (message) => {
      addMessage(message);
      if (user && message.receiver._id !== user.id) {
        addNotification({
          type: 'info',
          message: `New message from ${message.sender.company || message.sender.email}`,
          duration: 5000
        });
      }
    });

    // Subscribe to message updates
    const unsubscribeMessageUpdate = subscribe('message_updated', (message) => {
      updateMessage(message);
    });

    // Subscribe to message deletion
    const unsubscribeMessageDelete = subscribe('message_deleted', (data) => {
      deleteMessage(data.messageId);
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

