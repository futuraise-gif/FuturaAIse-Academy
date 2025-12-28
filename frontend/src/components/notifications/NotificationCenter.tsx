import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/services/notificationService';
import { Notification, NotificationPriority, NotificationStats } from '@/types/notification.types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  onClose: () => void;
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const filters: any = { limit: 50 };
      if (filter === 'unread') {
        filters.is_read = false;
      }

      const { notifications: data } = await notificationService.getMyNotifications(filters);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { stats: data } = await notificationService.getNotificationStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await notificationService.markAsRead(notification.id);
        fetchNotifications();
        fetchStats();
      }

      if (notification.link) {
        navigate(notification.link);
        onClose();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to mark all as read');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all read notifications?')) return;

    try {
      await notificationService.deleteAllRead();
      fetchNotifications();
      fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete notifications');
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await notificationService.deleteNotification(id);
      fetchNotifications();
      fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete notification');
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'border-l-4 border-red-500 bg-red-50';
      case NotificationPriority.HIGH:
        return 'border-l-4 border-orange-500 bg-orange-50';
      case NotificationPriority.NORMAL:
        return 'border-l-4 border-blue-500 bg-blue-50';
      case NotificationPriority.LOW:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return '📢';
      case 'assignment':
        return '📝';
      case 'grade':
        return '📊';
      case 'discussion':
        return '💬';
      case 'course':
        return '📚';
      case 'system':
        return '⚙️';
      default:
        return '📬';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
              {stats && (
                <p className="text-sm text-gray-600 mt-1">
                  {stats.unread} unread of {stats.total} total
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === 'unread'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Unread ({stats?.unread || 0})
              </button>
            </div>

            <div className="flex-1"></div>

            {stats && stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Mark all as read
              </button>
            )}

            {stats && stats.total > 0 && (
              <button
                onClick={handleDeleteAll}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No notifications</p>
              <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? getPriorityColor(notification.priority) : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium ${
                            notification.is_read ? 'text-gray-700' : 'text-gray-900'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => handleDeleteNotification(notification.id, e)}
                          className="text-gray-400 hover:text-red-600 flex-shrink-0"
                        >
                          ×
                        </button>
                      </div>
                      <p
                        className={`text-sm mt-1 line-clamp-2 ${
                          notification.is_read ? 'text-gray-500' : 'text-gray-700'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
