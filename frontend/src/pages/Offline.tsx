import { WifiOff, RefreshCw } from 'lucide-react';

const Offline = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="h-10 w-10 text-orange-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            You're Offline
          </h1>
          
          <p className="text-gray-600 mb-6">
            It looks like you've lost your internet connection. Some features may be limited until you're back online.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">What you can still do:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• View previously loaded data</li>
              <li>• Access your cached loads and messages</li>
              <li>• Your changes will sync when online</li>
            </ul>
          </div>

          <button
            onClick={handleRetry}
            className="w-full btn btn-primary flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try Again</span>
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Waiting for connection to restore...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Offline;

