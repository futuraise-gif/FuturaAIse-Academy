import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { announcementService, courseService } from '@/services/instructorService';
import {
  Announcement,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementStatus,
  Course
} from '@/types/instructor.types';

interface CreateAnnouncementDTO {
  type: AnnouncementType;
  course_id?: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  send_email: boolean;
  send_notification: boolean;
  pinned: boolean;
  visible_from?: string;
  visible_until?: string;
}

export default function InstructorAnnouncements() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCourseId, setFilterCourseId] = useState<string>('all');

  const [formData, setFormData] = useState<CreateAnnouncementDTO>({
    type: AnnouncementType.COURSE,
    course_id: '',
    title: '',
    content: '',
    priority: AnnouncementPriority.NORMAL,
    send_email: false,
    send_notification: true,
    pinned: false,
    visible_from: '',
    visible_until: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCourses();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [announcements, filterType, filterPriority, filterStatus, filterCourseId]);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getInstructorCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementService.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...announcements];

    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(a => a.priority === filterPriority);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    if (filterCourseId !== 'all') {
      filtered = filtered.filter(a => a.course_id === filterCourseId);
    }

    setFilteredAnnouncements(filtered);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }

    if (formData.type === AnnouncementType.COURSE && !formData.course_id) {
      errors.course_id = 'Course is required for course announcements';
    }

    if (formData.visible_from && formData.visible_until) {
      const from = new Date(formData.visible_from);
      const until = new Date(formData.visible_until);
      if (until <= from) {
        errors.visible_until = 'End date must be after start date';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        course_id: formData.type === AnnouncementType.COURSE ? formData.course_id : undefined,
      };

      if (editingAnnouncement) {
        await announcementService.updateAnnouncement(editingAnnouncement.id, dataToSubmit);
      } else {
        await announcementService.createAnnouncement(dataToSubmit);
      }

      setShowCreateModal(false);
      setEditingAnnouncement(null);
      fetchAnnouncements();
      resetForm();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      alert('Failed to save announcement');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      type: announcement.type,
      course_id: announcement.course_id || '',
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      send_email: announcement.send_email,
      send_notification: announcement.send_notification,
      pinned: announcement.pinned,
      visible_from: announcement.visible_from
        ? new Date(announcement.visible_from).toISOString().slice(0, 16)
        : '',
      visible_until: announcement.visible_until
        ? new Date(announcement.visible_until).toISOString().slice(0, 16)
        : '',
    });
    setShowCreateModal(true);
  };

  const handlePublish = async (id: string) => {
    if (!confirm('Are you sure you want to publish this announcement?')) return;

    try {
      await announcementService.publishAnnouncement(id);
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to publish announcement:', error);
      alert('Failed to publish announcement');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this announcement?')) return;

    try {
      await announcementService.archiveAnnouncement(id);
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to archive announcement:', error);
      alert('Failed to archive announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) return;

    try {
      await announcementService.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const resetForm = () => {
    setFormData({
      type: AnnouncementType.COURSE,
      course_id: '',
      title: '',
      content: '',
      priority: AnnouncementPriority.NORMAL,
      send_email: false,
      send_notification: true,
      pinned: false,
      visible_from: '',
      visible_until: '',
    });
    setFormErrors({});
  };

  const getPriorityColor = (priority: AnnouncementPriority): string => {
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

  const getStatusColor = (status: AnnouncementStatus): string => {
    switch (status) {
      case AnnouncementStatus.PUBLISHED:
        return 'bg-green-100 text-green-800';
      case AnnouncementStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-800';
      case AnnouncementStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading announcements...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600 mt-1">Create and manage announcements for your courses</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Announcement
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value={AnnouncementType.COURSE}>Course</option>
                <option value={AnnouncementType.GLOBAL}>Global</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value={AnnouncementPriority.LOW}>Low</option>
                <option value={AnnouncementPriority.NORMAL}>Normal</option>
                <option value={AnnouncementPriority.HIGH}>High</option>
                <option value={AnnouncementPriority.URGENT}>Urgent</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value={AnnouncementStatus.DRAFT}>Draft</option>
                <option value={AnnouncementStatus.PUBLISHED}>Published</option>
                <option value={AnnouncementStatus.ARCHIVED}>Archived</option>
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">📢</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements found</h3>
              <p className="text-gray-600 mb-6">
                {announcements.length === 0
                  ? "Create your first announcement to notify students"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border-l-4 ${
                  announcement.pinned ? 'border-yellow-500' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header with badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {announcement.pinned && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pinned
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(announcement.status)}`}>
                        {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {announcement.type === AnnouncementType.COURSE ? 'Course' : 'Global'}
                      </span>
                      {announcement.course_title && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {announcement.course_title}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {announcement.title}
                    </h3>

                    {/* Content Preview */}
                    <p className="text-gray-600 mb-3 whitespace-pre-line">
                      {truncateContent(announcement.content)}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>By {announcement.author_name}</span>
                      <span>•</span>
                      <span>{formatDate(announcement.created_at)}</span>
                      {announcement.published_at && (
                        <>
                          <span>•</span>
                          <span>Published {formatDate(announcement.published_at)}</span>
                        </>
                      )}
                    </div>

                    {/* Notification indicators */}
                    <div className="flex items-center gap-3 text-sm">
                      {announcement.send_email && (
                        <span className="inline-flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </span>
                      )}
                      {announcement.send_notification && (
                        <span className="inline-flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          Notification
                        </span>
                      )}
                    </div>

                    {/* Visibility Dates */}
                    {(announcement.visible_from || announcement.visible_until) && (
                      <div className="mt-2 text-sm text-gray-600">
                        {announcement.visible_from && (
                          <span>Visible from {formatDate(announcement.visible_from)}</span>
                        )}
                        {announcement.visible_from && announcement.visible_until && <span> • </span>}
                        {announcement.visible_until && (
                          <span>until {formatDate(announcement.visible_until)}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => setViewingAnnouncement(announcement)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    {announcement.status === AnnouncementStatus.DRAFT && (
                      <button
                        onClick={() => handlePublish(announcement.id)}
                        className="px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    {announcement.status === AnnouncementStatus.PUBLISHED && (
                      <button
                        onClick={() => handleArchive(announcement.id)}
                        className="px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
              </h2>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Announcement Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value={AnnouncementType.COURSE}
                      checked={formData.type === AnnouncementType.COURSE}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Course Announcement</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value={AnnouncementType.GLOBAL}
                      checked={formData.type === AnnouncementType.GLOBAL}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Global Announcement</span>
                  </label>
                </div>
              </div>

              {/* Course Selection (if Course type) */}
              {formData.type === AnnouncementType.COURSE && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course *
                  </label>
                  <select
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.course_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  {formErrors.course_id && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.course_id}</p>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter announcement title"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter announcement content"
                />
                {formErrors.content && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as AnnouncementPriority })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={AnnouncementPriority.LOW}>Low</option>
                  <option value={AnnouncementPriority.NORMAL}>Normal</option>
                  <option value={AnnouncementPriority.HIGH}>High</option>
                  <option value={AnnouncementPriority.URGENT}>Urgent</option>
                </select>
              </div>

              {/* Notification Options */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Notification Options
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.send_email}
                    onChange={(e) => setFormData({ ...formData, send_email: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Send Email Notification</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.send_notification}
                    onChange={(e) => setFormData({ ...formData, send_notification: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Send In-App Notification</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.pinned}
                    onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Pin Announcement (appears at top)</span>
                </label>
              </div>

              {/* Visibility Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visible From (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.visible_from}
                    onChange={(e) => setFormData({ ...formData, visible_from: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visible Until (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.visible_until}
                    onChange={(e) => setFormData({ ...formData, visible_until: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.visible_until ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.visible_until && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.visible_until}</p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAnnouncement(null);
                    resetForm();
                  }}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAnnouncement ? 'Update' : 'Create'} Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Announcement Details</h2>
              <button
                onClick={() => setViewingAnnouncement(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {viewingAnnouncement.pinned && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Pinned
                  </span>
                )}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingAnnouncement.status)}`}>
                  {viewingAnnouncement.status.charAt(0).toUpperCase() + viewingAnnouncement.status.slice(1)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded border text-sm font-medium ${getPriorityColor(viewingAnnouncement.priority)}`}>
                  {viewingAnnouncement.priority.charAt(0).toUpperCase() + viewingAnnouncement.priority.slice(1)} Priority
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {viewingAnnouncement.type === AnnouncementType.COURSE ? 'Course Announcement' : 'Global Announcement'}
                </span>
              </div>

              {/* Course Info */}
              {viewingAnnouncement.course_title && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-indigo-900">
                    Course: {viewingAnnouncement.course_title}
                  </p>
                </div>
              )}

              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {viewingAnnouncement.title}
                </h3>
              </div>

              {/* Content */}
              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-line">
                  {viewingAnnouncement.content}
                </div>
              </div>

              {/* Meta Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Author:</span>
                    <span className="ml-2 text-gray-600">{viewingAnnouncement.author_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Role:</span>
                    <span className="ml-2 text-gray-600">{viewingAnnouncement.author_role}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">{formatDate(viewingAnnouncement.created_at)}</span>
                  </div>
                  {viewingAnnouncement.published_at && (
                    <div>
                      <span className="font-medium text-gray-700">Published:</span>
                      <span className="ml-2 text-gray-600">{formatDate(viewingAnnouncement.published_at)}</span>
                    </div>
                  )}
                </div>

                {(viewingAnnouncement.visible_from || viewingAnnouncement.visible_until) && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Visibility:</span>
                    <div className="ml-2 text-gray-600">
                      {viewingAnnouncement.visible_from && (
                        <div>From: {formatDate(viewingAnnouncement.visible_from)}</div>
                      )}
                      {viewingAnnouncement.visible_until && (
                        <div>Until: {formatDate(viewingAnnouncement.visible_until)}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Settings */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Notification Settings:</p>
                <div className="flex gap-4 text-sm text-blue-800">
                  {viewingAnnouncement.send_email && (
                    <span className="inline-flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Sent
                    </span>
                  )}
                  {viewingAnnouncement.send_notification && (
                    <span className="inline-flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      In-App Notification Sent
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setViewingAnnouncement(null);
                    handleEdit(viewingAnnouncement);
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Announcement
                </button>
                <button
                  onClick={() => setViewingAnnouncement(null)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
