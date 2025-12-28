import api from '@/config/api';
import {
  ContentItem,
  ContentAccess,
  ContentProgress,
  ContentStatistics,
  CreateContentItemDTO,
  UpdateContentItemDTO,
  UpdateContentAccessDTO,
} from '../types/content.types';

export const contentService = {
  // Content item operations
  async createContentItem(
    data: CreateContentItemDTO
  ): Promise<{ message: string; content: ContentItem }> {
    const response = await api.post('/content/items', data);
    return response.data;
  },

  async uploadFile(
    file: File,
    metadata: {
      course_id: string;
      parent_id?: string;
      title: string;
      description?: string;
      order?: number;
      visible_to_students?: boolean;
      available_from?: string;
      available_until?: string;
    }
  ): Promise<{ message: string; content: ContentItem }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('course_id', metadata.course_id);
    if (metadata.parent_id) formData.append('parent_id', metadata.parent_id);
    formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.order !== undefined) formData.append('order', String(metadata.order));
    if (metadata.visible_to_students !== undefined)
      formData.append('visible_to_students', String(metadata.visible_to_students));
    if (metadata.available_from) formData.append('available_from', metadata.available_from);
    if (metadata.available_until) formData.append('available_until', metadata.available_until);

    const response = await api.post('/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getContentItems(
    courseId: string,
    includeHidden: boolean = false
  ): Promise<{ content: ContentItem[]; count: number }> {
    const params = new URLSearchParams();
    if (includeHidden) params.append('include_hidden', 'true');

    const response = await api.get(`/content/courses/${courseId}/items?${params.toString()}`);
    return response.data;
  },

  async getContentItem(courseId: string, contentId: string): Promise<{ content: ContentItem }> {
    const response = await api.get(`/content/courses/${courseId}/items/${contentId}`);
    return response.data;
  },

  async updateContentItem(
    courseId: string,
    contentId: string,
    updates: UpdateContentItemDTO
  ): Promise<{ message: string; content: ContentItem }> {
    const response = await api.patch(`/content/courses/${courseId}/items/${contentId}`, updates);
    return response.data;
  },

  async publishContentItem(
    courseId: string,
    contentId: string
  ): Promise<{ message: string; content: ContentItem }> {
    const response = await api.post(`/content/courses/${courseId}/items/${contentId}/publish`);
    return response.data;
  },

  async deleteContentItem(courseId: string, contentId: string): Promise<{ message: string }> {
    const response = await api.delete(`/content/courses/${courseId}/items/${contentId}`);
    return response.data;
  },

  // Access tracking
  async trackAccess(courseId: string, contentId: string): Promise<{ message: string }> {
    const response = await api.post(`/content/courses/${courseId}/items/${contentId}/access`);
    return response.data;
  },

  async updateContentAccess(
    courseId: string,
    contentId: string,
    updates: UpdateContentAccessDTO
  ): Promise<{ message: string; access: ContentAccess }> {
    const response = await api.patch(
      `/content/courses/${courseId}/items/${contentId}/access`,
      updates
    );
    return response.data;
  },

  async getMyContentAccess(
    courseId: string,
    contentId: string
  ): Promise<{ access: ContentAccess | null }> {
    const response = await api.get(`/content/courses/${courseId}/items/${contentId}/access/me`);
    return response.data;
  },

  async getAllContentAccess(
    courseId: string,
    contentId: string
  ): Promise<{ access_records: ContentAccess[]; count: number }> {
    const response = await api.get(`/content/courses/${courseId}/items/${contentId}/access/all`);
    return response.data;
  },

  // Progress
  async getStudentProgress(
    courseId: string,
    studentId?: string
  ): Promise<{ progress: ContentProgress | null }> {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);

    const response = await api.get(`/content/courses/${courseId}/progress?${params.toString()}`);
    return response.data;
  },

  // Statistics
  async getContentStatistics(
    courseId: string,
    contentId: string
  ): Promise<{ statistics: ContentStatistics }> {
    const response = await api.get(`/content/courses/${courseId}/items/${contentId}/statistics`);
    return response.data;
  },

  // Reorder
  async reorderContent(
    courseId: string,
    contentIds: string[],
    newOrders: number[]
  ): Promise<{ message: string }> {
    const response = await api.post(`/content/courses/${courseId}/reorder`, {
      content_ids: contentIds,
      new_orders: newOrders,
    });
    return response.data;
  },
};
