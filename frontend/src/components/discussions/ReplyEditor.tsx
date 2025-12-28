import { useState } from 'react';
import { discussionService } from '@/services/discussionService';

interface ReplyEditorProps {
  courseId: string;
  threadId: string;
  parentReplyId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
  placeholder?: string;
}

export default function ReplyEditor({
  courseId,
  threadId,
  parentReplyId,
  onSuccess,
  onCancel,
  placeholder = 'Write your reply...',
}: ReplyEditorProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    if (content.length < 1) {
      setError('Reply must be at least 1 character');
      return;
    }

    try {
      setLoading(true);
      await discussionService.createReply(courseId, threadId, {
        content: content.trim(),
        parent_reply_id: parentReplyId || undefined,
      });

      setContent('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          maxLength={5000}
        />
        <p className="text-xs text-gray-500 mt-1">{content.length}/5000 characters</p>
      </div>

      <div className="flex justify-end gap-2">
        {parentReplyId && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 text-sm"
        >
          {loading ? 'Posting...' : 'Post Reply'}
        </button>
      </div>
    </form>
  );
}
