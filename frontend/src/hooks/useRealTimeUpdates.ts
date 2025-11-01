import { useEffect } from 'react';
import { pollingService } from '../services/polling.service';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { loadService } from '../services/load.service';

/**
 * Hook for real-time updates using polling
 */
export const useRealTimeUpdates = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { addNotification } = useUIStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Poll for new loads every 30 seconds
    if (user?.accountType === 'carrier') {
      pollingService.start('loads', async () => {
        const data = await loadService.getLoads(1);
        
        // Check for new loads and notify
        if (data.success && data.data) {
          const newLoads = data.data.filter((load: any) => {
            const now = Date.now();
            const loadTime = new Date(load.createdAt).getTime();
            // Notify for loads created in last 60 seconds
            return (now - loadTime) < 60000;
          });

          if (newLoads.length > 0) {
            newLoads.forEach((load: any) => {
              addNotification({
                type: 'info',
                message: `New load available: ${load.title}`,
                duration: 5000
              });
            });
          }
        }

        return data.data;
      }, {
        interval: 30000, // 30 seconds
        onError: (error) => {
          console.error('[Polling] Load update error:', error);
        }
      });
    }

    // Poll for new messages every 15 seconds
    pollingService.start('messages', async () => {
      // TODO: Implement message polling when message service is ready
      return [];
    }, {
      interval: 15000, // 15 seconds
    });

    // Cleanup
    return () => {
      pollingService.stop('loads');
      pollingService.stop('messages');
    };
  }, [isAuthenticated, user?.accountType, addNotification]);
};

