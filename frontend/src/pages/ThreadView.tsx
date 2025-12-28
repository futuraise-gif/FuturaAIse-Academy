import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { discussionService } from '@/services/discussionService';
import { DiscussionThread, DiscussionReply } from '@/types/discussion.types';
import { useAuthStore } from '@/store/authStore';
import ReplyCard from '@/components/discussions/ReplyCard';
import ReplyEditor from '@/components/discussions/ReplyEditor';
import { UserRole } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function ThreadView() {
  const { courseId, threadId } = useParams<{ courseId: string; threadId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [thread, setThread] = useState<DiscussionThread | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const isInstructor = user?.role === UserRole.INSTRUCTOR || user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (courseId && threadId) {
      loadThread();
      loadReplies();
    }
  }, [courseId, threadId]);

  const loadThread = async () => {
    try {
      const { thread: data } = await discussionService.getThreadById(courseId!, threadId!);
      setThread(data);
    } catch (error: any) {
      console.error('Failed to load thread:', error);
      alert('Thread not found');
      navigate(`/courses/${courseId}/discussions`);
    }
  };

  const loadReplies = async () => {
    try {
      setLoading(true);
      const { replies: data } = await discussionService.getReplies(courseId!, threadId!);
      setReplies(data);
    } catch (error: any) {
      console.error('Failed to load replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyCreated = () => {
    setReplyingTo(null);
    loadReplies();
    loadThread(); // Reload to update reply count
  };

  const handleEndorse = async (replyId: string) => {
    try {
      await discussionService.endorseReply(courseId!, threadId!, replyId);
      loadReplies();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to endorse reply');
    }
  };

  const handleReaction = async (replyId: string, type: string) => {
    try {
      // Check if user already reacted (this would need more state management for real implementation)
      await discussionService.addReaction(courseId!, threadId!, replyId, type as any);
      loadReplies();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add reaction');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      await discussionService.deleteReply(courseId!, threadId!, replyId);
      loadReplies();
      loadThread(); // Reload to update reply count
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete reply');
    }
  };

  // Build threaded reply structure
  const buildReplyTree = () => {
    const replyMap = new Map<string, DiscussionReply & { children: DiscussionReply[] }>();
    const rootReplies: (DiscussionReply & { children: DiscussionReply[] })[] = [];

    // Initialize all replies with children array
    replies.forEach((reply) => {
      replyMap.set(reply.id, { ...reply, children: [] });
    });

    // Build tree structure
    replies.forEach((reply) => {
      const replyWithChildren = replyMap.get(reply.id)!;
      if (reply.parent_reply_id) {
        const parent = replyMap.get(reply.parent_reply_id);
        if (parent) {
          parent.children.push(replyWithChildren);
        } else {
          rootReplies.push(replyWithChildren);
        }
      } else {
        rootReplies.push(replyWithChildren);
      }
    });

    return rootReplies;
  };

  const threadedReplies = buildReplyTree();

  if (!thread) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/courses/${courseId}/discussions`)}
          className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
        >
          ← Back to Discussions
        </button>

        {/* Thread Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
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
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {thread.category.replace('_', ' ')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{thread.title}</h1>

          {/* Author Info */}
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{thread.author_name}</span>
            {thread.author_role === 'instructor' && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                Instructor
              </span>
            )}
            <span>•</span>
            <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
            {thread.edited && (
              <>
                <span>•</span>
                <span className="italic">edited</span>
              </>
            )}
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-4">
            <p className="text-gray-800 whitespace-pre-wrap">{thread.content}</p>
          </div>

          {/* Tags */}
          {thread.tags.length > 0 && (
            <div className="flex gap-2 mb-4">
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

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500 border-t pt-4">
            <span>👁 {thread.view_count} views</span>
            <span>•</span>
            <span>💬 {thread.reply_count} replies</span>
          </div>

          {/* Lock Reason */}
          {thread.is_locked && thread.lock_reason && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                <strong>Locked:</strong> {thread.lock_reason}
              </p>
            </div>
          )}
        </div>

        {/* Reply Editor (main thread) */}
        {!thread.is_locked && (
          <div className="mb-6">
            <ReplyEditor
              courseId={courseId!}
              threadId={threadId!}
              parentReplyId={null}
              onSuccess={handleReplyCreated}
              onCancel={() => {}}
              placeholder="Write your reply..."
            />
          </div>
        )}

        {/* Replies */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Replies ({thread.reply_count})
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : replies.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No replies yet</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to reply to this thread</p>
            </div>
          ) : (
            threadedReplies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                courseId={courseId!}
                threadId={threadId!}
                onReply={(replyId) => setReplyingTo(replyId)}
                onEndorse={isInstructor ? handleEndorse : undefined}
                onReaction={handleReaction}
                onDelete={
                  isInstructor || reply.author_id === user?.uid
                    ? () => handleDeleteReply(reply.id)
                    : undefined
                }
                replyingTo={replyingTo}
                onReplySuccess={handleReplyCreated}
                onCancelReply={() => setReplyingTo(null)}
                isThreadLocked={thread.is_locked}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
