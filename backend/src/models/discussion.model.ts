import { db } from '../config/firebase';
import {
  DiscussionThread,
  DiscussionReply,
  ThreadStatus,
  ReactionType,
  CreateThreadDTO,
  UpdateThreadDTO,
  CreateReplyDTO,
  UpdateReplyDTO,
  UserReaction
} from '../types/discussion.types';

const COURSES_COLLECTION = 'courses';
const DISCUSSIONS_SUBCOLLECTION = 'discussions';
const REPLIES_SUBCOLLECTION = 'replies';
const REACTIONS_SUBCOLLECTION = 'reactions';

export class DiscussionModel {
  /**
   * Create a new discussion thread
   */
  static async createThread(
    userId: string,
    userName: string,
    userRole: string,
    data: CreateThreadDTO
  ): Promise<DiscussionThread> {
    const threadRef = db
      .collection(COURSES_COLLECTION)
      .doc(data.course_id)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc();

    const thread: Omit<DiscussionThread, 'id'> = {
      course_id: data.course_id,
      title: data.title,
      content: data.content,
      category: data.category,
      author_id: userId,
      author_name: userName,
      author_role: userRole,
      is_pinned: false,
      is_locked: false,
      is_announcement: data.is_announcement ?? false,
      status: ThreadStatus.OPEN,
      reply_count: 0,
      view_count: 0,
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      edited: false,
    };

    await threadRef.set(thread);

    return {
      id: threadRef.id,
      ...thread,
    };
  }

  /**
   * Get all threads for a course
   */
  static async getThreads(courseId: string, filters?: {
    category?: string;
    is_pinned?: boolean;
    status?: ThreadStatus;
  }): Promise<DiscussionThread[]> {
    let query: any = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION);

    if (filters?.category) {
      query = query.where('category', '==', filters.category);
    }

    if (filters?.is_pinned !== undefined) {
      query = query.where('is_pinned', '==', filters.is_pinned);
    }

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    // Removed orderBy to avoid composite index requirement
    const snapshot = await query.get();
    let threads: DiscussionThread[] = [];

    snapshot.forEach((doc: any) => {
      threads.push({
        id: doc.id,
        ...doc.data(),
      } as DiscussionThread);
    });

    // Sort by pinned (desc) then updated_at (desc) in application layer
    threads.sort((a, b) => {
      // First sort by pinned
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      // Then sort by updated_at (most recent first)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return threads;
  }

  /**
   * Get a single thread by ID
   */
  static async getThreadById(courseId: string, threadId: string): Promise<DiscussionThread | null> {
    const doc = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as DiscussionThread;
  }

  /**
   * Update thread
   */
  static async updateThread(
    courseId: string,
    threadId: string,
    updates: UpdateThreadDTO
  ): Promise<DiscussionThread | null> {
    const threadRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId);

    const doc = await threadRef.get();

    if (!doc.exists) {
      return null;
    }

    await threadRef.update({
      ...updates,
      edited: true,
      edited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return this.getThreadById(courseId, threadId);
  }

  /**
   * Increment view count
   */
  static async incrementViewCount(courseId: string, threadId: string): Promise<void> {
    const threadRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId);

    await threadRef.update({
      view_count: (await threadRef.get()).data()?.view_count + 1 || 1,
    });
  }

  /**
   * Pin/Unpin thread
   */
  static async pinThread(
    courseId: string,
    threadId: string,
    userId: string,
    pin: boolean
  ): Promise<DiscussionThread | null> {
    const threadRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId);

    await threadRef.update({
      is_pinned: pin,
      pinned_by: pin ? userId : null,
      pinned_at: pin ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    });

    return this.getThreadById(courseId, threadId);
  }

  /**
   * Lock/Unlock thread
   */
  static async lockThread(
    courseId: string,
    threadId: string,
    userId: string,
    lock: boolean,
    reason?: string
  ): Promise<DiscussionThread | null> {
    const threadRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId);

    await threadRef.update({
      is_locked: lock,
      status: lock ? ThreadStatus.LOCKED : ThreadStatus.OPEN,
      locked_by: lock ? userId : null,
      locked_at: lock ? new Date().toISOString() : null,
      lock_reason: lock ? reason : null,
      updated_at: new Date().toISOString(),
    });

    return this.getThreadById(courseId, threadId);
  }

  /**
   * Delete thread
   */
  static async deleteThread(courseId: string, threadId: string): Promise<boolean> {
    try {
      // In production, use Cloud Functions to cascade delete replies
      await db
        .collection(COURSES_COLLECTION)
        .doc(courseId)
        .collection(DISCUSSIONS_SUBCOLLECTION)
        .doc(threadId)
        .delete();

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a reply to a thread
   */
  static async createReply(
    courseId: string,
    threadId: string,
    userId: string,
    userName: string,
    userRole: string,
    data: CreateReplyDTO
  ): Promise<DiscussionReply> {
    const replyRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId)
      .collection(REPLIES_SUBCOLLECTION)
      .doc();

    // Calculate depth based on parent
    let depth = 0;
    if (data.parent_reply_id) {
      const parentDoc = await db
        .collection(COURSES_COLLECTION)
        .doc(courseId)
        .collection(DISCUSSIONS_SUBCOLLECTION)
        .doc(threadId)
        .collection(REPLIES_SUBCOLLECTION)
        .doc(data.parent_reply_id)
        .get();

      if (parentDoc.exists) {
        depth = ((parentDoc.data() as DiscussionReply).depth || 0) + 1;
      }
    }

    const reply: Omit<DiscussionReply, 'id'> = {
      thread_id: threadId,
      course_id: courseId,
      content: data.content,
      author_id: userId,
      author_name: userName,
      author_role: userRole,
      parent_reply_id: data.parent_reply_id,
      depth,
      reaction_counts: {},
      is_instructor_reply: userRole === 'instructor' || userRole === 'admin',
      is_endorsed: false,
      is_hidden: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      edited: false,
    };

    await replyRef.set(reply);

    // Update thread reply count and last reply info
    await this.updateThreadReplyStats(courseId, threadId, userId, userName);

    return {
      id: replyRef.id,
      ...reply,
    };
  }

  /**
   * Get all replies for a thread
   */
  static async getReplies(courseId: string, threadId: string): Promise<DiscussionReply[]> {
    const snapshot = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId)
      .collection(REPLIES_SUBCOLLECTION)
      .get();

    let replies: DiscussionReply[] = [];

    snapshot.forEach((doc: any) => {
      replies.push({
        id: doc.id,
        ...doc.data(),
      } as DiscussionReply);
    });

    // Sort by created_at (oldest first) in application layer
    replies.sort((a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    return replies;
  }

  /**
   * Update reply
   */
  static async updateReply(
    courseId: string,
    threadId: string,
    replyId: string,
    updates: UpdateReplyDTO
  ): Promise<DiscussionReply | null> {
    const replyRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId)
      .collection(REPLIES_SUBCOLLECTION)
      .doc(replyId);

    const doc = await replyRef.get();

    if (!doc.exists) {
      return null;
    }

    await replyRef.update({
      ...updates,
      edited: true,
      edited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const updatedDoc = await replyRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as DiscussionReply;
  }

  /**
   * Endorse a reply (instructor marks as helpful)
   */
  static async endorseReply(
    courseId: string,
    threadId: string,
    replyId: string,
    userId: string
  ): Promise<DiscussionReply | null> {
    const replyRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId)
      .collection(REPLIES_SUBCOLLECTION)
      .doc(replyId);

    await replyRef.update({
      is_endorsed: true,
      endorsed_by: userId,
      endorsed_at: new Date().toISOString(),
    });

    const doc = await replyRef.get();
    return {
      id: doc.id,
      ...doc.data(),
    } as DiscussionReply;
  }

  /**
   * Add reaction to a reply
   */
  static async addReaction(
    courseId: string,
    threadId: string,
    replyId: string,
    userId: string,
    type: ReactionType
  ): Promise<void> {
    const reactionRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId)
      .collection(REPLIES_SUBCOLLECTION)
      .doc(replyId)
      .collection(REACTIONS_SUBCOLLECTION)
      .doc(userId);

    await reactionRef.set({
      user_id: userId,
      reply_id: replyId,
      type,
      created_at: new Date().toISOString(),
    });

    // Update reaction count
    await this.updateReactionCount(courseId, threadId, replyId, type, 1);
  }

  /**
   * Remove reaction from a reply
   */
  static async removeReaction(
    courseId: string,
    threadId: string,
    replyId: string,
    userId: string,
    type: ReactionType
  ): Promise<void> {
    await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId)
      .collection(REPLIES_SUBCOLLECTION)
      .doc(replyId)
      .collection(REACTIONS_SUBCOLLECTION)
      .doc(userId)
      .delete();

    // Update reaction count
    await this.updateReactionCount(courseId, threadId, replyId, type, -1);
  }

  /**
   * Update reaction count
   */
  private static async updateReactionCount(
    courseId: string,
    threadId: string,
    replyId: string,
    type: ReactionType,
    increment: number
  ): Promise<void> {
    const replyRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId)
      .collection(REPLIES_SUBCOLLECTION)
      .doc(replyId);

    const doc = await replyRef.get();
    const reply = doc.data() as DiscussionReply;

    const newCounts = {
      ...reply.reaction_counts,
      [type]: (reply.reaction_counts[type] || 0) + increment,
    };

    await replyRef.update({
      reaction_counts: newCounts,
    });
  }

  /**
   * Update thread reply statistics
   */
  private static async updateThreadReplyStats(
    courseId: string,
    threadId: string,
    lastReplyBy: string,
    lastReplyByName: string
  ): Promise<void> {
    const threadRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(DISCUSSIONS_SUBCOLLECTION)
      .doc(threadId);

    const doc = await threadRef.get();
    const currentCount = doc.data()?.reply_count || 0;

    await threadRef.update({
      reply_count: currentCount + 1,
      last_reply_at: new Date().toISOString(),
      last_reply_by: lastReplyByName,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Delete reply
   */
  static async deleteReply(courseId: string, threadId: string, replyId: string): Promise<boolean> {
    try {
      await db
        .collection(COURSES_COLLECTION)
        .doc(courseId)
        .collection(DISCUSSIONS_SUBCOLLECTION)
        .doc(threadId)
        .collection(REPLIES_SUBCOLLECTION)
        .doc(replyId)
        .delete();

      return true;
    } catch (error) {
      return false;
    }
  }
}
