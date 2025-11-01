import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    // Show prompt again after 7 days
    if (dismissed && Date.now() - dismissedTime < sevenDaysInMs) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show install prompt
    await deferredPrompt.prompt();

    // Wait for user choice
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt');
      setIsInstalled(true);
    } else {
      console.log('[PWA] User dismissed install prompt');
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }

    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or prompt not available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-2xl p-6 text-white relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-4xl">🚛</span>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Install CargoLume</h3>
            <p className="text-sm text-blue-100 mb-4">
              Install our app for faster access, offline support, and push notifications!
            </p>

            <button
              onClick={handleInstall}
              className="w-full bg-white text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Install App</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-blue-200">
          <span>✓ Works offline</span>
          <span>✓ Fast & secure</span>
          <span>✓ No app store needed</span>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;

