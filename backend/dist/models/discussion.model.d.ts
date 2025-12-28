import { DiscussionThread, DiscussionReply, ThreadStatus, ReactionType, CreateThreadDTO, UpdateThreadDTO, CreateReplyDTO, UpdateReplyDTO } from '../types/discussion.types';
export declare class DiscussionModel {
    /**
     * Create a new discussion thread
     */
    static createThread(userId: string, userName: string, userRole: string, data: CreateThreadDTO): Promise<DiscussionThread>;
    /**
     * Get all threads for a course
     */
    static getThreads(courseId: string, filters?: {
        category?: string;
        is_pinned?: boolean;
        status?: ThreadStatus;
    }): Promise<DiscussionThread[]>;
    /**
     * Get a single thread by ID
     */
    static getThreadById(courseId: string, threadId: string): Promise<DiscussionThread | null>;
    /**
     * Update thread
     */
    static updateThread(courseId: string, threadId: string, updates: UpdateThreadDTO): Promise<DiscussionThread | null>;
    /**
     * Increment view count
     */
    static incrementViewCount(courseId: string, threadId: string): Promise<void>;
    /**
     * Pin/Unpin thread
     */
    static pinThread(courseId: string, threadId: string, userId: string, pin: boolean): Promise<DiscussionThread | null>;
    /**
     * Lock/Unlock thread
     */
    static lockThread(courseId: string, threadId: string, userId: string, lock: boolean, reason?: string): Promise<DiscussionThread | null>;
    /**
     * Delete thread
     */
    static deleteThread(courseId: string, threadId: string): Promise<boolean>;
    /**
     * Create a reply to a thread
     */
    static createReply(courseId: string, threadId: string, userId: string, userName: string, userRole: string, data: CreateReplyDTO): Promise<DiscussionReply>;
    /**
     * Get all replies for a thread
     */
    static getReplies(courseId: string, threadId: string): Promise<DiscussionReply[]>;
    /**
     * Update reply
     */
    static updateReply(courseId: string, threadId: string, replyId: string, updates: UpdateReplyDTO): Promise<DiscussionReply | null>;
    /**
     * Endorse a reply (instructor marks as helpful)
     */
    static endorseReply(courseId: string, threadId: string, replyId: string, userId: string): Promise<DiscussionReply | null>;
    /**
     * Add reaction to a reply
     */
    static addReaction(courseId: string, threadId: string, replyId: string, userId: string, type: ReactionType): Promise<void>;
    /**
     * Remove reaction from a reply
     */
    static removeReaction(courseId: string, threadId: string, replyId: string, userId: string, type: ReactionType): Promise<void>;
    /**
     * Update reaction count
     */
    private static updateReactionCount;
    /**
     * Update thread reply statistics
     */
    private static updateThreadReplyStats;
    /**
     * Delete reply
     */
    static deleteReply(courseId: string, threadId: string, replyId: string): Promise<boolean>;
}
//# sourceMappingURL=discussion.model.d.ts.map