export declare enum ThreadCategory {
    GENERAL = "general",
    QUESTIONS = "questions",
    ANNOUNCEMENTS = "announcements",
    STUDY_GROUP = "study_group",
    TECHNICAL_HELP = "technical_help",
    CUSTOM = "custom"
}
export declare enum ThreadStatus {
    OPEN = "open",
    LOCKED = "locked",
    ARCHIVED = "archived"
}
export declare enum ReactionType {
    LIKE = "like",
    HELPFUL = "helpful",
    THANKS = "thanks",
    INSIGHTFUL = "insightful"
}
export interface DiscussionThread {
    id: string;
    course_id: string;
    title: string;
    content: string;
    category: ThreadCategory;
    author_id: string;
    author_name: string;
    author_role: string;
    is_pinned: boolean;
    is_locked: boolean;
    is_announcement: boolean;
    status: ThreadStatus;
    locked_by?: string;
    locked_at?: string;
    lock_reason?: string;
    pinned_by?: string;
    pinned_at?: string;
    reply_count: number;
    view_count: number;
    last_reply_at?: string;
    last_reply_by?: string;
    tags?: string[];
    created_at: string;
    updated_at: string;
    edited?: boolean;
    edited_at?: string;
}
export interface DiscussionReply {
    id: string;
    thread_id: string;
    course_id: string;
    content: string;
    author_id: string;
    author_name: string;
    author_role: string;
    parent_reply_id?: string;
    depth: number;
    reaction_counts: {
        [key in ReactionType]?: number;
    };
    is_instructor_reply: boolean;
    is_endorsed: boolean;
    endorsed_by?: string;
    endorsed_at?: string;
    created_at: string;
    updated_at: string;
    edited: boolean;
    edited_at?: string;
    is_hidden: boolean;
    hidden_by?: string;
    hidden_reason?: string;
}
export interface UserReaction {
    user_id: string;
    reply_id: string;
    type: ReactionType;
    created_at: string;
}
export interface ThreadView {
    thread_id: string;
    user_id: string;
    viewed_at: string;
}
export interface DiscussionStats {
    course_id: string;
    total_threads: number;
    total_replies: number;
    active_discussions: number;
    most_active_users: {
        user_id: string;
        user_name: string;
        post_count: number;
    }[];
}
export interface CreateThreadDTO {
    course_id: string;
    title: string;
    content: string;
    category: ThreadCategory;
    tags?: string[];
    is_announcement?: boolean;
}
export interface UpdateThreadDTO {
    title?: string;
    content?: string;
    category?: ThreadCategory;
    tags?: string[];
}
export interface CreateReplyDTO {
    content: string;
    parent_reply_id?: string;
}
export interface UpdateReplyDTO {
    content: string;
}
export interface ModerateThreadDTO {
    action: 'pin' | 'unpin' | 'lock' | 'unlock' | 'archive' | 'delete';
    reason?: string;
}
//# sourceMappingURL=discussion.types.d.ts.map