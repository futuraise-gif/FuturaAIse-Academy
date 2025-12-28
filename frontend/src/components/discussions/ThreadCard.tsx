import { DiscussionThread, ThreadCategory, ThreadStatus } from '@/types/discussion.types';
import { formatDistanceToNow } from 'date-fns';

interface ThreadCardProps {
  thread: DiscussionThread;
  onClick: () => void;
  onPin?: () => void;
  onLock?: () => void;
  onDelete?: () => void;
}

export default function ThreadCard({ thread, onClick, onPin, onLock, onDelete }: ThreadCardProps) {
  const categoryColors: Record<ThreadCategory, string> = {
    [ThreadCategory.GENERAL]: 'bg-gray-100 text-gray-800',
    [ThreadCategory.QUESTION]: 'bg-blue-100 text-blue-800',
    [ThreadCategory.ANNOUNCEMENT]: 'bg-purple-100 text-purple-800',
    [ThreadCategory.TECHNICAL]: 'bg-green-100 text-green-800',
    [ThreadCategory.ASSIGNMENT_HELP]: 'bg-yellow-100 text-yellow-800',
    [ThreadCategory.EXAM_PREP]: 'bg-red-100 text-red-800',
  };

  const statusColors: Record<ThreadStatus, string> = {
    [ThreadStatus.OPEN]: 'bg-green-100 text-green-800',
    [ThreadStatus.RESOLVED]: 'bg-blue-100 text-blue-800',
    [ThreadStatus.LOCKED]: 'bg-red-100 text-red-800',
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
        thread.is_pinned
          ? 'border-yellow-500'
          : thread.is_announcement
          ? 'border-purple-500'
          : 'border-transparent'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            {thread.is_pinned && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                📌 Pinned
              </span>
            )}
            {thread.is_announcement && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                📢 Announcement
              </span>
            )}
            {thread.is_locked && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                🔒 Locked
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryColors[thread.category]}`}>
              {thread.category.replace('_', ' ')}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[thread.status]}`}>
              {thread.status}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-indigo-600">
            {thread.title}
          </h3>

          {/* Content Preview */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{thread.content}</p>

          {/* Tags */}
          {thread.tags.length > 0 && (
            <div className="flex gap-2 mb-3">
              {thread.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-700">{thread.author_name}</span>
              {thread.author_role === 'instructor' && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                  Instructor
                </span>
              )}
            </div>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
            <span>•</span>
            <span>👁 {thread.view_count} views</span>
            <span>•</span>
            <span>💬 {thread.reply_count} replies</span>
            {thread.last_reply_at && (
              <>
                <span>•</span>
                <span>
                  Last reply by {thread.last_reply_by}{' '}
                  {formatDistanceToNow(new Date(thread.last_reply_at), { addSuffix: true })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        {(onPin || onLock || onDelete) && (
          <div className="flex gap-2 ml-4">
            {onPin && (
              <button
                onClick={(e) => handleAction(e, onPin)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  thread.is_pinned
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={thread.is_pinned ? 'Unpin thread' : 'Pin thread'}
              >
                {thread.is_pinned ? 'Unpin' : 'Pin'}
              </button>
            )}
            {onLock && (
              <button
                onClick={(e) => handleAction(e, onLock)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  thread.is_locked
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={thread.is_locked ? 'Unlock thread' : 'Lock thread'}
              >
                {thread.is_locked ? 'Unlock' : 'Lock'}
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => handleAction(e, onDelete)}
                className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                title="Delete thread"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
