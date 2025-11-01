import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide the indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-orange-500 text-white'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-5 w-5" />
          <span className="font-semibold">Back Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-5 w-5" />
          <span className="font-semibold">You're Offline</span>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;

