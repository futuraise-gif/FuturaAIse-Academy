import { Request, Response } from 'express';
import { DiscussionModel } from '../models/discussion.model';
import {
  CreateThreadDTO,
  UpdateThreadDTO,
  CreateReplyDTO,
  UpdateReplyDTO,
  ReactionType
} from '../types/discussion.types';
import { UserRole } from '../types';

export class DiscussionController {
  /**
   * Create a new discussion thread
   */
  static async createThread(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const data: CreateThreadDTO = req.body;

      const thread = await DiscussionModel.createThread(
        user.uid,
        user.name || user.email.split('@')[0],
        user.role,
        data
      );

      res.status(201).json({
        message: 'Thread created successfully',
        thread,
      });
    } catch (error: any) {
      console.error('Create thread error:', error);
      res.status(500).json({
        error: 'Failed to create thread',
        details: error.message,
      });
    }
  }

  /**
   * Get all threads for a course
   */
  static async getThreads(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const { category, is_pinned, status } = req.query;

      const filters: any = {};
      if (category) filters.category = category;
      if (is_pinned !== undefined) filters.is_pinned = is_pinned === 'true';
      if (status) filters.status = status;

      const threads = await DiscussionModel.getThreads(courseId, filters);

      res.status(200).json({
        threads,
        count: threads.length,
      });
    } catch (error: any) {
      console.error('Get threads error:', error);
      res.status(500).json({
        error: 'Failed to retrieve threads',
        details: error.message,
      });
    }
  }

  /**
   * Get a single thread by ID
   */
  static async getThreadById(req: Request, res: Response) {
    try {
      const { courseId, threadId } = req.params;

      // Increment view count
      await DiscussionModel.incrementViewCount(courseId, threadId);

      const thread = await DiscussionModel.getThreadById(courseId, threadId);

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      res.status(200).json({ thread });
    } catch (error: any) {
      console.error('Get thread error:', error);
      res.status(500).json({
        error: 'Failed to retrieve thread',
        details: error.message,
      });
    }
  }

  /**
   * Update a thread
   */
  static async updateThread(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, threadId } = req.params;
      const updates: UpdateThreadDTO = req.body;

      // Get thread to check ownership
      const thread = await DiscussionModel.getThreadById(courseId, threadId);

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // Only author or instructor/admin can edit
      if (
        thread.author_id !== user.uid &&
        user.role !== UserRole.INSTRUCTOR &&
        user.role !== UserRole.ADMIN
      ) {
        return res.status(403).json({ error: 'Not authorized to edit this thread' });
      }

      const updatedThread = await DiscussionModel.updateThread(courseId, threadId, updates);

      res.status(200).json({
        message: 'Thread updated successfully',
        thread: updatedThread,
      });
    } catch (error: any) {
      console.error('Update thread error:', error);
      res.status(500).json({
        error: 'Failed to update thread',
        details: error.message,
      });
    }
  }

  /**
   * Pin/Unpin a thread (Instructor/Admin only)
   */
  static async pinThread(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, threadId } = req.params;
      const { pin } = req.body;

      // Only instructors and admins can pin
      if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'Only instructors can pin threads' });
      }

      const thread = await DiscussionModel.pinThread(courseId, threadId, user.uid, pin);

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      res.status(200).json({
        message: `Thread ${pin ? 'pinned' : 'unpinned'} successfully`,
        thread,
      });
    } catch (error: any) {
      console.error('Pin thread error:', error);
      res.status(500).json({
        error: 'Failed to pin thread',
        details: error.message,
      });
    }
  }

  /**
   * Lock/Unlock a thread (Instructor/Admin only)
   */
  static async lockThread(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, threadId } = req.params;
      const { lock, reason } = req.body;

      // Only instructors and admins can lock
      if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'Only instructors can lock threads' });
      }

      const thread = await DiscussionModel.lockThread(courseId, threadId, user.uid, lock, reason);

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      res.status(200).json({
        message: `Thread ${lock ? 'locked' : 'unlocked'} successfully`,
        thread,
      });
    } catch (error: any) {
      console.error('Lock thread error:', error);
      res.status(500).json({
        error: 'Failed to lock thread',
        details: error.message,
      });
    }
  }

  /**
   * Delete a thread
   */
  static async deleteThread(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, threadId } = req.params;

      // Get thread to check ownership
      const thread = await DiscussionModel.getThreadById(courseId, threadId);

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // Only author or instructor/admin can delete
      if (
        thread.author_id !== user.uid &&
        user.role !== UserRole.INSTRUCTOR &&
        user.role !== UserRole.ADMIN
      ) {
        return res.status(403).json({ error: 'Not authorized to delete this thread' });
      }

      const success = await DiscussionModel.deleteThread(courseId, threadId);

      if (!success) {
        return res.status(500).json({ error: 'Failed to delete thread' });
      }

      res.status(200).json({ message: 'Thread deleted successfully' });
    } catch (error: any) {
      console.error('Delete thread error:', error);
      res.status(500).json({
        error: 'Failed to delete thread',
        details: error.message,
      });
    }
  }

  /**
   * Create a reply to a thread
   */
  static async createReply(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, threadId } = req.params;
      const data: CreateReplyDTO = req.body;

      // Check if thread is locked
      const thread = await DiscussionModel.getThreadById(courseId, threadId);

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      if (thread.is_locked) {
        return res.status(403).json({ error: 'This thread is locked and cannot accept new replies' });
      }

      const reply = await DiscussionModel.createReply(
        courseId,
        threadId,
        user.uid,
        user.name || user.email.split('@')[0],
        user.role,
        data
      );

      res.status(201).json({
        message: 'Reply created successfully',
        reply,
      });
    } catch (error: any) {
      console.error('Create reply error:', error);
      res.status(500).json({
        error: 'Failed to create reply',
        details: error.message,
      });
    }
  }

  /**
   * Get all replies for a thread
   */
  static async getReplies(req: Request, res: Response) {
    try {
      const { courseId, threadId } = req.params;

      const replies = await DiscussionModel.getReplies(courseId, threadId);

      res.status(200).json({
        replies,
        count: replies.length,
      });
    } catch (error: any) {
      console.error('Get replies error:', error);
      res.status(500).json({
        error: 'Failed to retrieve replies',
        details: error.message,
      });
    }
  }

  /**
   * Update a reply
   */
  static async updateReply(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, threadId, replyId } = req.params;
      const updates: UpdateReplyDTO = req.body;

      // Get reply to check ownership
      const replies = await DiscussionModel.getReplies(courseId, threadId);
      const reply = replies.find((r) => r.id === replyId);

      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }

      // Only author or instructor/admin can edit
      if (
        reply.author_id !== user.uid &&
        user.role !== UserRole.INSTRUCTOR &&
        user.role !== UserRole.ADMIN
      ) {
        return res.status(403).json({ error: 'Not authorized to edit this reply' });
      }

      const updatedReply = await DiscussionModel.updateReply(courseId, threadId, replyId, updates);

      res.status(200).json({
        message: 'Reply updated successfully',
        reply: updatedReply,
      });
    } catch (error: any) {
      console.error('Update reply error:', error);
      res.status(500).json({
        error: 'Failed to update reply',
        details: error.message,
      });
    }
  }

  /**
   * Endorse a reply (Instructor/Admin only)
   */
  static async endorseReply(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, threadId, replyId } = req.params;

      // Only instructors and admins can endorse
      if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'Only instructors can endorse replies' });
      }

      const reply = await DiscussionModel.endorseReply(courseId, threadId, replyId, user.uid);

      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }

      res.status(200).json({
        message: 'Reply endorsed successfully',
        reply,
      });
    } catch (error: any) {
      console.error('Endorse reply error:', error);
      res.status(500).json({
        error: 'Failed to endorse reply',
        details: error.message,
      });
    }
  }

  /**
   * Add a reaction to a reply
   */
  static async addReaction(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, threadId, replyId } = req.params;
      const { type } = req.body;

      await DiscussionModel.addReaction(courseId, threadId, replyId, user.uid, type as ReactionType);

      res.status(200).json({ message: 'Reaction added successfully' });
    } catch (error: any) {
      console.error('Add reaction error:', error);
      res.status(500).json({
        error: 'Failed to add reaction',
        details: error.message,
      });
    }
  }

  /**
   * Remove a reaction from a reply
   */
  static async removeReaction(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, threadId, replyId } = req.params;
      const { type } = req.query;

      await DiscussionModel.removeReaction(
        courseId,
        threadId,
        replyId,
        user.uid,
        type as ReactionType
      );

      res.status(200).json({ message: 'Reaction removed successfully' });
    } catch (error: any) {
      console.error('Remove reaction error:', error);
      res.status(500).json({
        error: 'Failed to remove reaction',
        details: error.message,
      });
    }
  }

  /**
   * Delete a reply
   */
  static async deleteReply(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, threadId, replyId } = req.params;

      // Get reply to check ownership
      const replies = await DiscussionModel.getReplies(courseId, threadId);
      const reply = replies.find((r) => r.id === replyId);

      if (!reply) {
        return res.status(404).json({ error: 'Reply not found' });
      }

      // Only author or instructor/admin can delete
      if (
        reply.author_id !== user.uid &&
        user.role !== UserRole.INSTRUCTOR &&
        user.role !== UserRole.ADMIN
      ) {
        return res.status(403).json({ error: 'Not authorized to delete this reply' });
      }

      const success = await DiscussionModel.deleteReply(courseId, threadId, replyId);

      if (!success) {
        return res.status(500).json({ error: 'Failed to delete reply' });
      }

      res.status(200).json({ message: 'Reply deleted successfully' });
    } catch (error: any) {
      console.error('Delete reply error:', error);
      res.status(500).json({
        error: 'Failed to delete reply',
        details: error.message,
      });
    }
  }
}
