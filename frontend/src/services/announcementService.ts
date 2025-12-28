import api from '@/config/api';
import {
  Announcement,
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementStatus,
} from '@/types/announcement.types';

export const announcementService = {
  async createAnnouncement(
    data: CreateAnnouncementDTO
  ): Promise<{ message: string; announcement: Announcement }> {
    const response = await api.post('/announcements', data);
    return response.data;
  },

  async getAnnouncements(filters?: {
    type?: AnnouncementType;
    course_id?: string;
    priority?: AnnouncementPriority;
    status?: AnnouncementStatus;
    pinned?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ announcements: Announcement[]; total: number; limit: number; offset: number }> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.course_id) params.append('course_id', filters.course_id);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.pinned !== undefined) params.append('pinned', String(filters.pinned));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await api.get(`/announcements?${params.toString()}`);
    return response.data;
  },

  async getAnnouncementById(id: string): Promise<{ announcement: Announcement }> {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },

  async updateAnnouncement(
    id: string,
    updates: UpdateAnnouncementDTO
  ): Promise<{ message: string; announcement: Announcement }> {
    const response = await api.patch(`/announcements/${id}`, updates);
    return response.data;
  },

  async publishAnnouncement(
    id: string
  ): Promise<{ message: string; announcement: Announcement }> {
    const response = await api.post(`/announcements/${id}/publish`);
    return response.data;
  },

  async pinAnnouncement(
    id: string,
    pin: boolean
  ): Promise<{ message: string; announcement: Announcement }> {
    const response = await api.post(`/announcements/${id}/pin`, { pin });
    return response.data;
  },

  async archiveAnnouncement(
    id: string
  ): Promise<{ message: string; announcement: Announcement }> {
    const response = await api.post(`/announcements/${id}/archive`);
    return response.data;
  },

  async deleteAnnouncement(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
};
