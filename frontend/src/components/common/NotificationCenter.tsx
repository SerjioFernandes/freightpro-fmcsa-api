import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Star, StarOff, Trash2, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { notificationService, type NotificationRecord } from '../../services/notification.service';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  onNotificationClick?: (notification: NotificationRecord) => void;
}

const NotificationCenter = ({ onNotificationClick }: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useUIStore();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      let response;
      
      if (filter === 'unread') {
        response = await notificationService.getNotifications(1, 50, { isRead: false });
      } else if (filter === 'important') {
        response = await notificationService.getNotifications(1, 50, { isImportant: true });
      } else {
        response = await notificationService.getNotifications(1, 50);
      }

      if (response.success && response.data) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error: unknown) {
      // Silently fail - notifications are optional
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      // Silently fail - marking as read is optional
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        addNotification({ type: 'success', message: 'All notifications marked as read' });
      }
    } catch (error) {
      // Silently fail - marking as read is optional
    }
  };

  const handleToggleImportant = async (id: string) => {
    try {
      const response = await notificationService.toggleImportant(id);
      if (response.success && response.data) {
        setNotifications(prev => prev.map(n => n._id === id ? response.data! : n));
      }
    } catch (error) {
      // Silently fail - toggling important is optional
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        const deletedNotif = notifications.find(n => n._id === id);
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      // Silently fail - deleting notification is optional
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return;
    
    try {
      const response = await notificationService.deleteAllNotifications();
      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
        addNotification({ type: 'success', message: 'All notifications deleted' });
      }
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const filteredNotifications = notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-gray-200 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-orange-accent text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-0.5 w-96 max-w-[95vw] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slide-down overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-white" />
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-orange-accent text-white text-xs font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-white">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm ${
                filter === 'unread' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('important')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm ${
                filter === 'important' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              Important
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-300 shadow-sm"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </button>
              </div>
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-300 shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-blue/30 border-t-orange-accent"></div>
                <p className="text-gray-600 mt-2 text-sm">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No notifications</p>
                <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    } ${notification.isImportant ? 'border-l-4 border-orange-accent' : ''}`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification._id);
                      }
                      if (onNotificationClick) {
                        onNotificationClick(notification);
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-lg ${
                        notification.type === 'success' ? 'bg-green-100 text-green-600' :
                        notification.type === 'error' ? 'bg-red-100 text-red-600' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <AlertCircle className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 h-2 w-2 bg-primary-blue rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleImportant(notification._id);
                          }}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          {notification.isImportant ? (
                            <Star className="h-4 w-4 text-orange-accent" />
                          ) : (
                            <StarOff className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          <Check className="h-4 w-4 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                          className="p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

