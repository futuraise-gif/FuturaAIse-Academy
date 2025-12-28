import api from '@/config/api';
import { LiveSession, CreateLiveSessionDTO } from '@/types/live-session.types';

export const liveSessionService = {
  // Create live session
  createSession: async (data: CreateLiveSessionDTO): Promise<LiveSession> => {
    const response = await api.post('/live-sessions', data);
    return response.data.session;
  },

  // Get sessions for a course
  getCourseSessions: async (courseId: string, status?: string): Promise<LiveSession[]> => {
    const params = status ? { status } : {};
    const response = await api.get(`/live-sessions/course/${courseId}`, { params });
    return response.data.sessions;
  },

  // Get upcoming sessions (student)
  getUpcomingSessions: async (): Promise<LiveSession[]> => {
    const response = await api.get('/live-sessions/upcoming');
    return response.data.sessions;
  },

  // Get session details
  getSessionDetails: async (sessionId: string): Promise<LiveSession> => {
    const response = await api.get(`/live-sessions/${sessionId}`);
    return response.data.session;
  },

  // Update session
  updateSession: async (sessionId: string, data: Partial<CreateLiveSessionDTO>): Promise<LiveSession> => {
    const response = await api.put(`/live-sessions/${sessionId}`, data);
    return response.data.session;
  },

  // Start session
  startSession: async (sessionId: string): Promise<LiveSession> => {
    const response = await api.post(`/live-sessions/${sessionId}/start`);
    return response.data.session;
  },

  // End session
  endSession: async (sessionId: string): Promise<void> => {
    await api.post(`/live-sessions/${sessionId}/end`);
  },

  // Join session (student)
  joinSession: async (sessionId: string): Promise<{ session: any }> => {
    const response = await api.post(`/live-sessions/${sessionId}/join`);
    return response.data;
  },

  // Delete session
  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/live-sessions/${sessionId}`);
  },
};
