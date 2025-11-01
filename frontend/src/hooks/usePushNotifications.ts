import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

// Convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const { isAuthenticated } = useAuthStore();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if browser supports push notifications
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported && isAuthenticated) {
      checkSubscriptionStatus();
    }
  }, [isAuthenticated]);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking subscription status:', err);
    }
  };

  const subscribe = async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setError('Notification permission denied');
        setIsLoading(false);
        return;
      }

      // Get VAPID public key from backend
      const { data: { publicKey } } = await axios.get(`${API_URL}/push/public-key`);

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      });

      // Send subscription to backend
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/push/subscribe`,
        subscription.toJSON(),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setIsSubscribed(true);
      console.log('[Push] Successfully subscribed');
    } catch (err: any) {
      console.error('[Push] Subscription error:', err);
      setError(err.message || 'Failed to subscribe to push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!isSupported) return;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Notify backend
        const token = localStorage.getItem('token');
        await axios.post(
          `${API_URL}/push/unsubscribe`,
          { endpoint },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setIsSubscribed(false);
        console.log('[Push] Successfully unsubscribed');
      }
    } catch (err: any) {
      console.error('[Push] Unsubscribe error:', err);
      setError(err.message || 'Failed to unsubscribe from push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!isSubscribed) {
      setError('Not subscribed to push notifications');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/push/test`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('[Push] Test notification sent');
    } catch (err: any) {
      console.error('[Push] Test notification error:', err);
      setError(err.message || 'Failed to send test notification');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
};

