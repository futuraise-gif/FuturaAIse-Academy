import api from '@/config/api';
import {
  DiscussionThread,
  DiscussionReply,
  CreateThreadDTO,
  UpdateThreadDTO,
  CreateReplyDTO,
  UpdateReplyDTO,
  ThreadCategory,
  ThreadStatus,
  ReactionType,
} from '../types/discussion.types';

export const discussionService = {
  // Thread operations
  async createThread(data: CreateThreadDTO): Promise<{ message: string; thread: DiscussionThread }> {
    const response = await api.post('/discussions/threads', data);
    return response.data;
  },

  async getThreads(
    courseId: string,
    filters?: {
      category?: ThreadCategory;
      is_pinned?: boolean;
      status?: ThreadStatus;
    }
  ): Promise<{ threads: DiscussionThread[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.is_pinned !== undefined) params.append('is_pinned', String(filters.is_pinned));
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/discussions/courses/${courseId}/threads?${params.toString()}`);
    return response.data;
  },

  async getThreadById(courseId: string, threadId: string): Promise<{ thread: DiscussionThread }> {
    const response = await api.get(`/discussions/courses/${courseId}/threads/${threadId}`);
    return response.data;
  },

  async updateThread(
    courseId: string,
    threadId: string,
    updates: UpdateThreadDTO
  ): Promise<{ message: string; thread: DiscussionThread }> {
    const response = await api.patch(`/discussions/courses/${courseId}/threads/${threadId}`, updates);
    return response.data;
  },

  async pinThread(
    courseId: string,
    threadId: string,
    pin: boolean
  ): Promise<{ message: string; thread: DiscussionThread }> {
    const response = await api.post(`/discussions/courses/${courseId}/threads/${threadId}/pin`, { pin });
    return response.data;
  },

  async lockThread(
    courseId: string,
    threadId: string,
    lock: boolean,
    reason?: string
  ): Promise<{ message: string; thread: DiscussionThread }> {
    const response = await api.post(`/discussions/courses/${courseId}/threads/${threadId}/lock`, {
      lock,
      reason,
    });
    return response.data;
  },

  async deleteThread(courseId: string, threadId: string): Promise<{ message: string }> {
    const response = await api.delete(`/discussions/courses/${courseId}/threads/${threadId}`);
    return response.data;
  },

  // Reply operations
  async createReply(
    courseId: string,
    threadId: string,
    data: CreateReplyDTO
  ): Promise<{ message: string; reply: DiscussionReply }> {
    const response = await api.post(
      `/discussions/courses/${courseId}/threads/${threadId}/replies`,
      data
    );
    return response.data;
  },

  async getReplies(
    courseId: string,
    threadId: string
  ): Promise<{ replies: DiscussionReply[]; count: number }> {
    const response = await api.get(`/discussions/courses/${courseId}/threads/${threadId}/replies`);
    return response.data;
  },

  async updateReply(
    courseId: string,
    threadId: string,
    replyId: string,
    updates: UpdateReplyDTO
  ): Promise<{ message: string; reply: DiscussionReply }> {
    const response = await api.patch(
      `/discussions/courses/${courseId}/threads/${threadId}/replies/${replyId}`,
      updates
    );
    return response.data;
  },

  async endorseReply(
    courseId: string,
    threadId: string,
    replyId: string
  ): Promise<{ message: string; reply: DiscussionReply }> {
    const response = await api.post(
      `/discussions/courses/${courseId}/threads/${threadId}/replies/${replyId}/endorse`
    );
    return response.data;
  },

  async addReaction(
    courseId: string,
    threadId: string,
    replyId: string,
    type: ReactionType
  ): Promise<{ message: string }> {
    const response = await api.post(
      `/discussions/courses/${courseId}/threads/${threadId}/replies/${replyId}/reactions`,
      { type }
    );
    return response.data;
  },

  async removeReaction(
    courseId: string,
    threadId: string,
    replyId: string,
    type: ReactionType
  ): Promise<{ message: string }> {
    const response = await api.delete(
      `/discussions/courses/${courseId}/threads/${threadId}/replies/${replyId}/reactions?type=${type}`
    );
    return response.data;
  },

  async deleteReply(courseId: string, threadId: string, replyId: string): Promise<{ message: string }> {
    const response = await api.delete(
      `/discussions/courses/${courseId}/threads/${threadId}/replies/${replyId}`
    );
    return response.data;
  },
};
