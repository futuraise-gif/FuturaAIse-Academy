import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore.firebase';
import { UserRole } from '@/types';
import { useState, useEffect, useRef } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    if (isLeftSwipe) {
      onClose();
    }
  };

  // Close sidebar when navigating (better mobile UX)
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', roles: [UserRole.STUDENT, UserRole.ADMIN] },
    { path: '/superadmin/dashboard', label: 'Super Admin Panel', icon: '🔐', roles: [UserRole.SUPER_ADMIN] },
    { path: '/superadmin/courses', label: 'All Courses', icon: '📚', roles: [UserRole.SUPER_ADMIN] },
    { path: '/instructor', label: 'Instructor Panel', icon: '👨‍🏫', roles: [UserRole.INSTRUCTOR] },
    { path: '/admin/students', label: 'All Students', icon: '👥', roles: [UserRole.ADMIN] },
    { path: '/admin/instructors', label: 'All Instructors', icon: '👨‍🏫', roles: [UserRole.ADMIN] },
    { path: '/admin/student-registration', label: 'Student Registration', icon: '📋', roles: [UserRole.ADMIN] },
    { path: '/admin/crm', label: 'CRM Dashboard', icon: '📊', roles: [UserRole.ADMIN] },
    { path: '/admin/crm/leads', label: 'Lead Management', icon: '🎯', roles: [UserRole.ADMIN] },
    { path: '/admin/crm/invoices', label: 'Invoices', icon: '📄', roles: [UserRole.ADMIN] },
    { path: '/admin/crm/payments', label: 'Payments', icon: '💰', roles: [UserRole.ADMIN] },
    { path: '/admin/crm/tasks', label: 'Tasks & Follow-ups', icon: '✅', roles: [UserRole.ADMIN] },
    { path: '/admin/beta-testing', label: 'Beta Testing', icon: '🧪', roles: [UserRole.ADMIN] },
    { path: '/courses', label: 'Courses', icon: '📚', roles: [UserRole.STUDENT, UserRole.INSTRUCTOR] },
    { path: '/announcements', label: 'Announcements', icon: '📢', roles: [UserRole.STUDENT, UserRole.INSTRUCTOR] },
    { path: '/assignments', label: 'Assignments', icon: '📝', roles: [UserRole.STUDENT, UserRole.INSTRUCTOR] },
    { path: '/grades', label: 'Grades', icon: '📊', roles: [UserRole.STUDENT] },
    { path: '/live-classes', label: 'Live Classes', icon: '🎥', roles: [UserRole.STUDENT] },
    { path: '/student/beta-testing', label: 'Beta Testing', icon: '🧪', roles: [UserRole.STUDENT] },
    { path: '/instructor/live-classes', label: 'Live Classes', icon: '🎥', roles: [UserRole.INSTRUCTOR] },
    { path: '/instructor/beta-testing', label: 'Beta Testing', icon: '🧪', roles: [UserRole.INSTRUCTOR] },
    { path: '/calendar', label: 'Calendar', icon: '📅', roles: [UserRole.STUDENT, UserRole.INSTRUCTOR] },
    { path: '/discussions', label: 'Discussions', icon: '💬', roles: [UserRole.STUDENT, UserRole.INSTRUCTOR] },
    { path: '/users', label: 'Manage Users', icon: '🔧', roles: [UserRole.ADMIN] },
    { path: '/profile', label: 'Profile', icon: '⚙️', roles: [UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  ];

  const filteredNavItems = navItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`
          fixed left-0 top-0 h-full w-64 bg-indigo-900 text-white z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          shadow-2xl
        `}
      >
        {/* Header */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">FuturaAIse</h1>
              <p className="text-indigo-300 text-xs sm:text-sm mt-1">Learning Management System</p>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden text-white hover:bg-indigo-800 rounded-md p-1"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2 sm:mt-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center px-4 sm:px-6 py-2.5 sm:py-3 text-sm transition-colors ${
                isActive(item.path)
                  ? 'bg-indigo-800 border-l-4 border-white'
                  : 'hover:bg-indigo-800'
              }`}
            >
              <span className="mr-3 text-base sm:text-lg">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 w-full p-4 sm:p-6 border-t border-indigo-800 bg-indigo-900">
          <div className="text-xs text-indigo-300">
            <p className="truncate font-medium">{user?.first_name} {user?.last_name}</p>
            <p className="capitalize text-indigo-400">{user?.role}</p>
          </div>
        </div>
      </div>
    </>
  );
}
