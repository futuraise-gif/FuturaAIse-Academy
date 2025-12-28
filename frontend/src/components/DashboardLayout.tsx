import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore.firebase';
import { notificationService } from '@/services/notificationService';
import Sidebar from './Sidebar';
import NotificationCenter from './notifications/NotificationCenter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { stats } = await notificationService.getNotificationStats();
      setUnreadCount(stats.unread);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationsClose = () => {
    setShowNotifications(false);
    fetchUnreadCount();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex justify-between items-center px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              {/* Hamburger menu for mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-md flex-shrink-0"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="min-w-0">
                <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                  Welcome back, {user?.first_name}!
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 flex-shrink-0">
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
                aria-label="Notifications"
              >
                <span className="text-lg sm:text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/announcements')}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full hidden sm:block"
                aria-label="Announcements"
              >
                <span className="text-lg sm:text-xl">📢</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-4 lg:p-8">
          {children}
        </main>
      </div>

      {showNotifications && <NotificationCenter onClose={handleNotificationsClose} />}
    </div>
  );
}
