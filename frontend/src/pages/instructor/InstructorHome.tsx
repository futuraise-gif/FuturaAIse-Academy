import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '@/services/instructorService';
import DashboardLayout from '@/components/DashboardLayout';

interface DashboardStats {
  total_programs: number;
  total_courses: number;
  total_students: number;
  active_courses: number;
  pending_submissions: number;
}

export default function InstructorHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await analyticsService.getInstructorDashboard();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Programs',
      description: 'Manage training programs',
      icon: '📚',
      path: '/instructor/programs',
      color: 'bg-blue-500',
    },
    {
      title: 'Courses',
      description: 'Create and manage courses',
      icon: '📖',
      path: '/instructor/courses',
      color: 'bg-green-500',
    },
    {
      title: 'Attendance',
      description: 'Mark & track attendance',
      icon: '✓',
      path: '/instructor/attendance',
      color: 'bg-purple-500',
    },
    {
      title: 'Assignments',
      description: 'Create & grade assignments',
      icon: '📝',
      path: '/instructor/assignments',
      color: 'bg-orange-500',
    },
    {
      title: 'Analytics',
      description: 'View student progress',
      icon: '📊',
      path: '/instructor/analytics',
      color: 'bg-pink-500',
    },
    {
      title: 'Announcements',
      description: 'Send announcements',
      icon: '📢',
      path: '/instructor/announcements',
      color: 'bg-indigo-500',
    },
  ];

  const statCards = [
    {
      title: 'Total Programs',
      value: stats?.total_programs || 0,
      icon: '📚',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Courses',
      value: stats?.total_courses || 0,
      icon: '📖',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Students',
      value: stats?.total_students || 0,
      icon: '👥',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Courses',
      value: stats?.active_courses || 0,
      icon: '🎯',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Pending Submissions',
      value: stats?.pending_submissions || 0,
      icon: '⏳',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your programs, courses, and student progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</p>
                </div>
                <div className={`text-4xl ${stat.bgColor} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${action.color} text-white p-3 rounded-lg text-2xl group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Getting Started with FuturaAI LMS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">1</span>
                Create a Program
              </h3>
              <p className="text-blue-100 text-sm">Start by creating a program (e.g., "Generative AI Bootcamp") that will contain your courses.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">2</span>
                Build Courses
              </h3>
              <p className="text-blue-100 text-sm">Add courses to your program with modules, videos, PDFs, and Jupyter notebooks.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">3</span>
                Schedule Live Classes
              </h3>
              <p className="text-blue-100 text-sm">Schedule live sessions with Zoom/Google Meet links and track attendance automatically.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">4</span>
                Track Progress
              </h3>
              <p className="text-blue-100 text-sm">Monitor student progress, grade assignments, and view comprehensive analytics.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/instructor/programs')}
            className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Create Your First Program →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
