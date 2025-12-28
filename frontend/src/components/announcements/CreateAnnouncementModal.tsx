import { useState } from 'react';
import { announcementService } from '@/services/announcementService';
import {
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementStatus,
  CreateAnnouncementDTO,
} from '@/types/announcement.types';
import { useAuthStore } from '@/store/authStore.firebase';
import { UserRole } from '@/types';

interface CreateAnnouncementModalProps {
  courseId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAnnouncementModal({
  courseId,
  onClose,
  onSuccess,
}: CreateAnnouncementModalProps) {
  const { user } = useAuthStore();
  const [type, setType] = useState<AnnouncementType>(
    courseId ? AnnouncementType.COURSE : AnnouncementType.GLOBAL
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>(AnnouncementPriority.NORMAL);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [visibleFrom, setVisibleFrom] = useState('');
  const [visibleUntil, setVisibleUntil] = useState('');
  const [pinned, setPinned] = useState(false);
  const [status, setStatus] = useState<AnnouncementStatus>(AnnouncementStatus.DRAFT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (type === AnnouncementType.GLOBAL && !isAdmin) {
      setError('Only admins can create global announcements');
      return;
    }

    try {
      setLoading(true);

      const data: CreateAnnouncementDTO = {
        type,
        course_id: type === AnnouncementType.COURSE ? courseId : undefined,
        title: title.trim(),
        content: content.trim(),
        priority,
        send_email: sendEmail,
        send_notification: sendNotification,
        visible_from: visibleFrom || undefined,
        visible_until: visibleUntil || undefined,
        pinned,
        status,
      };

      await announcementService.createAnnouncement(data);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Announcement</h2>
          <p className="text-sm text-gray-600 mt-1">Share important information with your audience</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Type */}
          {!courseId && isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AnnouncementType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                <option value={AnnouncementType.GLOBAL}>🌐 Global Announcement</option>
                <option value={AnnouncementType.COURSE}>📚 Course Announcement</option>
              </select>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            >
              <option value={AnnouncementPriority.LOW}>📌 Low</option>
              <option value={AnnouncementPriority.NORMAL}>📢 Normal</option>
              <option value={AnnouncementPriority.HIGH}>⚠️ High</option>
              <option value={AnnouncementPriority.URGENT}>🚨 Urgent</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              maxLength={200}
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter announcement content"
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              maxLength={50000}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/50000 characters</p>
          </div>

          {/* Visibility Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visible From (optional)
              </label>
              <input
                type="datetime-local"
                value={visibleFrom}
                onChange={(e) => setVisibleFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visible Until (optional)
              </label>
              <input
                type="datetime-local"
                value={visibleUntil}
                onChange={(e) => setVisibleUntil(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                disabled={loading}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Send in-app notification
              </span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                disabled={loading}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Send email notification</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                disabled={loading}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Pin announcement</span>
            </label>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            >
              <option value={AnnouncementStatus.DRAFT}>Draft (Save without publishing)</option>
              <option value={AnnouncementStatus.PUBLISHED}>
                Published (Send notifications immediately)
              </option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
