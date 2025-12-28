import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { discussionService } from '@/services/discussionService';
import {
  DiscussionThread,
  ThreadCategory,
  ThreadStatus,
} from '@/types/discussion.types';
import { useAuthStore } from '@/store/authStore';
import ThreadCard from '@/components/discussions/ThreadCard';
import CreateThreadModal from '@/components/discussions/CreateThreadModal';
import { UserRole } from '@/types';

export default function DiscussionBoard() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ThreadCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ThreadStatus | 'all'>('all');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  const isInstructor = user?.role === UserRole.INSTRUCTOR || user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (courseId) {
      loadThreads();
    }
  }, [courseId, selectedCategory, selectedStatus, showPinnedOnly]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }

      if (showPinnedOnly) {
        filters.is_pinned = true;
      }

      const { threads: data } = await discussionService.getThreads(courseId!, filters);
      setThreads(data);
    } catch (error: any) {
      console.error('Failed to load threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThreadCreated = () => {
    setShowCreateModal(false);
    loadThreads();
  };

  const handleThreadClick = (threadId: string) => {
    navigate(`/courses/${courseId}/discussions/${threadId}`);
  };

  const handlePinToggle = async (threadId: string, isPinned: boolean) => {
    try {
      await discussionService.pinThread(courseId!, threadId, !isPinned);
      loadThreads();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to pin thread');
    }
  };

  const handleLockToggle = async (threadId: string, isLocked: boolean) => {
    try {
      const reason = isLocked
        ? undefined
        : prompt('Please provide a reason for locking this thread:');

      if (!isLocked && !reason) return;

      await discussionService.lockThread(courseId!, threadId, !isLocked, reason);
      loadThreads();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to lock thread');
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('Are you sure you want to delete this thread?')) return;

    try {
      await discussionService.deleteThread(courseId!, threadId);
      loadThreads();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete thread');
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: ThreadCategory.GENERAL, label: 'General' },
    { value: ThreadCategory.QUESTION, label: 'Question' },
    { value: ThreadCategory.ANNOUNCEMENT, label: 'Announcement' },
    { value: ThreadCategory.TECHNICAL, label: 'Technical' },
    { value: ThreadCategory.ASSIGNMENT_HELP, label: 'Assignment Help' },
    { value: ThreadCategory.EXAM_PREP, label: 'Exam Prep' },
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: ThreadStatus.OPEN, label: 'Open' },
    { value: ThreadStatus.RESOLVED, label: 'Resolved' },
    { value: ThreadStatus.LOCKED, label: 'Locked' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discussion Board</h1>
              <p className="text-gray-600 mt-1">
                Ask questions, share ideas, and collaborate with your classmates
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              + New Thread
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPinnedOnly}
                  onChange={(e) => setShowPinnedOnly(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Pinned only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Threads List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : threads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No discussions yet</p>
            <p className="text-gray-400 mt-2">Be the first to start a conversation</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Create Thread
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onClick={() => handleThreadClick(thread.id)}
                onPin={isInstructor ? () => handlePinToggle(thread.id, thread.is_pinned) : undefined}
                onLock={isInstructor ? () => handleLockToggle(thread.id, thread.is_locked) : undefined}
                onDelete={
                  isInstructor || thread.author_id === user?.uid
                    ? () => handleDeleteThread(thread.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Thread Modal */}
      {showCreateModal && (
        <CreateThreadModal
          courseId={courseId!}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleThreadCreated}
          canCreateAnnouncement={isInstructor}
        />
      )}
    </div>
  );
}
