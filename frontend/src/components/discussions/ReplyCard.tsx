import { DiscussionReply, ReactionType } from '@/types/discussion.types';
import { formatDistanceToNow } from 'date-fns';
import ReplyEditor from './ReplyEditor';

interface ReplyCardProps {
  reply: DiscussionReply & { children?: DiscussionReply[] };
  courseId: string;
  threadId: string;
  onReply: (replyId: string) => void;
  onEndorse?: (replyId: string) => void;
  onReaction: (replyId: string, type: string) => void;
  onDelete?: () => void;
  replyingTo: string | null;
  onReplySuccess: () => void;
  onCancelReply: () => void;
  isThreadLocked: boolean;
  depth?: number;
}

export default function ReplyCard({
  reply,
  courseId,
  threadId,
  onReply,
  onEndorse,
  onReaction,
  onDelete,
  replyingTo,
  onReplySuccess,
  onCancelReply,
  isThreadLocked,
  depth = 0,
}: ReplyCardProps) {
  const maxDepth = 5; // Maximum nesting level
  const canReply = !isThreadLocked && depth < maxDepth;
  const isReplying = replyingTo === reply.id;

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-2 border-gray-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-900">{reply.author_name}</span>
            {reply.author_role === 'instructor' && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                Instructor
              </span>
            )}
            {reply.is_endorsed && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                ✓ Endorsed
              </span>
            )}
            <span className="text-gray-500">
              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
            </span>
            {reply.edited && <span className="text-gray-500 italic text-xs">edited</span>}
          </div>

          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>

        {/* Content */}
        <div className="prose max-w-none mb-3">
          <p className="text-gray-800 whitespace-pre-wrap">{reply.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 text-sm">
          {/* Reactions */}
          <button
            onClick={() => onReaction(reply.id, ReactionType.LIKE)}
            className="flex items-center gap-1 text-gray-600 hover:text-indigo-600"
          >
            👍 <span>{reply.reaction_counts[ReactionType.LIKE] || 0}</span>
          </button>
          <button
            onClick={() => onReaction(reply.id, ReactionType.HELPFUL)}
            className="flex items-center gap-1 text-gray-600 hover:text-green-600"
          >
            💡 <span>{reply.reaction_counts[ReactionType.HELPFUL] || 0}</span>
          </button>
          <button
            onClick={() => onReaction(reply.id, ReactionType.THANKS)}
            className="flex items-center gap-1 text-gray-600 hover:text-purple-600"
          >
            🙏 <span>{reply.reaction_counts[ReactionType.THANKS] || 0}</span>
          </button>

          {/* Reply Button */}
          {canReply && (
            <>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => onReply(reply.id)}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Reply
              </button>
            </>
          )}

          {/* Endorse Button (Instructor only) */}
          {onEndorse && !reply.is_endorsed && (
            <>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => onEndorse(reply.id)}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Endorse
              </button>
            </>
          )}
        </div>

        {/* Reply Editor */}
        {isReplying && (
          <div className="mt-4 border-t pt-4">
            <ReplyEditor
              courseId={courseId}
              threadId={threadId}
              parentReplyId={reply.id}
              onSuccess={onReplySuccess}
              onCancel={onCancelReply}
              placeholder={`Reply to ${reply.author_name}...`}
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {reply.children && reply.children.length > 0 && (
        <div className="mt-3">
          {reply.children.map((childReply: any) => (
            <ReplyCard
              key={childReply.id}
              reply={childReply}
              courseId={courseId}
              threadId={threadId}
              onReply={onReply}
              onEndorse={onEndorse}
              onReaction={onReaction}
              onDelete={
                onDelete ? () => onDelete() : undefined
              }
              replyingTo={replyingTo}
              onReplySuccess={onReplySuccess}
              onCancelReply={onCancelReply}
              isThreadLocked={isThreadLocked}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* Max depth message */}
      {depth >= maxDepth && (
        <p className="mt-2 ml-8 text-xs text-gray-500 italic">
          Maximum reply depth reached
        </p>
      )}
    </div>
  );
}
