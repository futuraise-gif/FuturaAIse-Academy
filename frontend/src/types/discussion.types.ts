export enum ThreadCategory {
  GENERAL = 'general',
  QUESTION = 'question',
  ANNOUNCEMENT = 'announcement',
  TECHNICAL = 'technical',
  ASSIGNMENT_HELP = 'assignment_help',
  EXAM_PREP = 'exam_prep',
}

export enum ThreadStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  LOCKED = 'locked',
}

export enum ReactionType {
  LIKE = 'like',
  HELPFUL = 'helpful',
  THANKS = 'thanks',
}

export interface DiscussionThread {
  id: string;
  course_id: string;
  title: string;
  content: string;
  category: ThreadCategory;

  // Author
  author_id: string;
  author_name: string;
  author_role: string;

  // Moderation
  is_pinned: boolean;
  is_locked: boolean;
  is_announcement: boolean;
  status: ThreadStatus;

  pinned_by?: string;
  pinned_at?: string;
  locked_by?: string;
  locked_at?: string;
  lock_reason?: string;

  // Stats
  reply_count: number;
  view_count: number;

  // Last Reply
  last_reply_at?: string;
  last_reply_by?: string;

  // Tags
  tags: string[];

  // Metadata
  created_at: string;
  updated_at: string;
  edited: boolean;
  edited_at?: string;
}

export interface DiscussionReply {
  id: string;
  thread_id: string;
  course_id: string;
  content: string;

  // Author
  author_id: string;
  author_name: string;
  author_role: string;

  // Threading
  parent_reply_id?: string;
  depth: number;

  // Reactions
  reaction_counts: { [key in ReactionType]?: number };

  // Moderation
  is_instructor_reply: boolean;
  is_endorsed: boolean;
  is_hidden: boolean;

  endorsed_by?: string;
  endorsed_at?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  edited: boolean;
  edited_at?: string;
}

export interface UserReaction {
  user_id: string;
  reply_id: string;
  type: ReactionType;
  created_at: string;
}

// DTOs
export interface CreateThreadDTO {
  course_id: string;
  title: string;
  content: string;
  category: ThreadCategory;
  is_announcement?: boolean;
  tags?: string[];
}

export interface UpdateThreadDTO {
  title?: string;
  content?: string;
  category?: ThreadCategory;
  status?: ThreadStatus;
  tags?: string[];
}

export interface CreateReplyDTO {
  content: string;
  parent_reply_id?: string;
}

export interface UpdateReplyDTO {
  content: string;
}
