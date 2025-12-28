import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { announcementService } from '@/services/announcementService';
import { Announcement, AnnouncementPriority, AnnouncementStatus } from '@/types/announcement.types';
import { useAuthStore } from '@/store/authStore.firebase';
import { UserRole } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function AnnouncementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthor = announcement?.author_id === user?.id;
  const isAdmin = user?.role === UserRole.ADMIN;
  const canEdit = isAuthor || isAdmin;

  useEffect(() => {
    if (id) {
      fetchAnnouncement();
    }
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const { announcement: data } = await announcementService.getAnnouncementById(id!);
      setAnnouncement(data);
    } catch (error: any) {
      console.error('Failed to fetch announcement:', error);
      alert(error.response?.data?.error || 'Failed to fetch announcement');
      navigate('/announcements');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!announcement) return;

    try {
      await announcementService.publishAnnouncement(announcement.id);
      fetchAnnouncement();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to publish announcement');
    }
  };

  const handlePin = async () => {
    if (!announcement) return;

    try {
      await announcementService.pinAnnouncement(announcement.id, !announcement.pinned);
      fetchAnnouncement();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to pin announcement');
    }
  };

  const handleArchive = async () => {
    if (!announcement) return;
    if (!confirm('Are you sure you want to archive this announcement?')) return;

    try {
      await announcementService.archiveAnnouncement(announcement.id);
      fetchAnnouncement();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to archive announcement');
    }
  };

  const handleDelete = async () => {
    if (!announcement) return;
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) return;

    try {
      await announcementService.deleteAnnouncement(announcement.id);
      navigate('/announcements');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete announcement');
    }
  };

  const getPriorityColor = (priority: AnnouncementPriority) => {
    switch (priority) {
      case AnnouncementPriority.URGENT:
        return 'bg-red-100 text-red-800';
      case AnnouncementPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case AnnouncementPriority.NORMAL:
        return 'bg-blue-100 text-blue-800';
      case AnnouncementPriority.LOW:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!announcement) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Announcement Not Found</h2>
          <button
            onClick={() => navigate('/announcements')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Back to Announcements
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/announcements')}
          className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
        >
          ← Back to Announcements
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {announcement.pinned && <span className="text-yellow-500 text-2xl">📌</span>}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(announcement.priority)}`}>
                  {announcement.priority.toUpperCase()}
                </span>
                {announcement.course_title && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {announcement.course_title}
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    announcement.status === AnnouncementStatus.PUBLISHED
                      ? 'bg-green-100 text-green-800'
                      : announcement.status === AnnouncementStatus.DRAFT
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {announcement.status.toUpperCase()}
                </span>
              </div>

              {canEdit && (
                <div className="flex items-center gap-2">
                  {announcement.status === AnnouncementStatus.DRAFT && (
                    <button
                      onClick={handlePublish}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Publish
                    </button>
                  )}
                  {announcement.status === AnnouncementStatus.PUBLISHED && (
                    <button
                      onClick={handlePin}
                      className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                    >
                      {announcement.pinned ? 'Unpin' : 'Pin'}
                    </button>
                  )}
                  {announcement.status === AnnouncementStatus.PUBLISHED && (
                    <button
                      onClick={handleArchive}
                      className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{announcement.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{announcement.author_name}</span>
              <span>•</span>
              <span>{announcement.author_role}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}</span>
              {announcement.published_at && (
                <>
                  <span>•</span>
                  <span>
                    Published {formatDistanceToNow(new Date(announcement.published_at), { addSuffix: true })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-6">
            <div className="text-gray-800 whitespace-pre-wrap">{announcement.content}</div>
          </div>

          {/* Visibility */}
          {(announcement.visible_from || announcement.visible_until) && (
            <div className="border-t pt-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Visibility</p>
              {announcement.visible_from && (
                <p>From: {new Date(announcement.visible_from).toLocaleString()}</p>
              )}
              {announcement.visible_until && (
                <p>Until: {new Date(announcement.visible_until).toLocaleString()}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
