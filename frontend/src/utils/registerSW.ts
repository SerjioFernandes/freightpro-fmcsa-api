// Service Worker Registration Utility

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  // Service Worker registration
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      if (import.meta.env.DEV) console.log('[PWA] Service Worker registered:', registration.scope);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              if (import.meta.env.DEV) console.log('[PWA] New service worker available');
              // You can show a notification to the user here
              if (window.confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });

      // Handle controller change (when a new SW takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (import.meta.env.DEV) console.log('[PWA] Service Worker controller changed');
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (import.meta.env.DEV) {
          console.log('[PWA] Message from service worker:', event.data);
          if (event.data && event.data.type === 'SW_UPDATED') {
            console.log('[PWA] Service worker updated');
          }
        }
      });
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  });
}

// Expose service worker utilities
export const unregisterSW = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();
    if (success) {
      if (import.meta.env.DEV) console.log('[PWA] Service Worker unregistered');
    }
  }
};

export const checkSWUpdate = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  }
};

export default {};

