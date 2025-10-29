import { useUIStore } from '../../store/uiStore';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const Notifications = () => {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 max-w-md">
      {notifications.map((notification) => {
        const icons = {
          success: <CheckCircle className="h-5 w-5 text-green-600" />,
          error: <XCircle className="h-5 w-5 text-red-600" />,
          warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          info: <Info className="h-5 w-5 text-blue-600" />,
        };

        const colors = {
          success: 'bg-green-50 border-green-200',
          error: 'bg-red-50 border-red-200',
          warning: 'bg-yellow-50 border-yellow-200',
          info: 'bg-blue-50 border-blue-200',
        };

        return (
          <div
            key={notification.id}
            className={`${colors[notification.type]} border rounded-lg p-4 shadow-lg flex items-start space-x-3 animate-slide-in`}
          >
            {icons[notification.type]}
            <p className="flex-1 text-sm font-medium text-gray-900">
              {notification.message}
            </p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Notifications;

