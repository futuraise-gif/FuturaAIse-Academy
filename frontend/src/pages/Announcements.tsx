import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { announcementService } from '@/services/announcementService';
import {
  Announcement,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementStatus,
} from '@/types/announcement.types';
import { useAuthStore } from '@/store/authStore.firebase';
import { UserRole } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import CreateAnnouncementModal from '@/components/announcements/CreateAnnouncementModal';

export default function Announcements() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const isInstructorOrAdmin = user?.role === UserRole.INSTRUCTOR || user?.role === UserRole.ADMIN;
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    fetchAnnouncements();
  }, [filterType, filterPriority, courseId]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (filterType !== 'all') {
        filters.type = filterType;
      }
      if (filterPriority !== 'all') {
        filters.priority = filterPriority;
      }
      if (courseId) {
        filters.course_id = courseId;
        filters.type = AnnouncementType.COURSE;
      }

      const { announcements: data } = await announcementService.getAnnouncements(filters);
      setAnnouncements(data);
    } catch (error: any) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnnouncementCreated = () => {
    setShowCreateModal(false);
    fetchAnnouncements();
  };

  const getPriorityColor = (priority: AnnouncementPriority) => {
    switch (priority) {
      case AnnouncementPriority.URGENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case AnnouncementPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case AnnouncementPriority.NORMAL:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case AnnouncementPriority.LOW:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: AnnouncementPriority) => {
    switch (priority) {
      case AnnouncementPriority.URGENT:
        return '🚨';
      case AnnouncementPriority.HIGH:
        return '⚠️';
      case AnnouncementPriority.NORMAL:
        return '📢';
      case AnnouncementPriority.LOW:
        return '📌';
      default:
        return '📌';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
              <p className="text-gray-600 mt-1">
                {courseId ? 'Course announcements and updates' : 'Latest announcements and updates'}
              </p>
            </div>
            {isInstructorOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
              >
                + New Announcement
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!courseId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Types</option>
                    <option value={AnnouncementType.GLOBAL}>Global</option>
                    <option value={AnnouncementType.COURSE}>Course</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Priorities</option>
                  <option value={AnnouncementPriority.URGENT}>Urgent</option>
                  <option value={AnnouncementPriority.HIGH}>High</option>
                  <option value={AnnouncementPriority.NORMAL}>Normal</option>
                  <option value={AnnouncementPriority.LOW}>Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No announcements yet</p>
            {isInstructorOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Create First Announcement
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                onClick={() => navigate(`/announcements/${announcement.id}`)}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {announcement.pinned && (
                      <span className="text-yellow-500 text-xl">📌</span>
                    )}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                        announcement.priority
                      )}`}
                    >
                      {getPriorityIcon(announcement.priority)} {announcement.priority.toUpperCase()}
                    </span>
                    {announcement.type === AnnouncementType.COURSE && announcement.course_title && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {announcement.course_title}
                      </span>
                    )}
                    {announcement.type === AnnouncementType.GLOBAL && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        🌐 Global
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{announcement.content}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>By {announcement.author_name}</span>
                  <span>•</span>
                  <span>{announcement.author_role}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <CreateAnnouncementModal
          courseId={courseId || undefined}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleAnnouncementCreated}
        />
      )}
    </DashboardLayout>
  );
}
