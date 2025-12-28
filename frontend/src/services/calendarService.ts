import api from '@/config/api';
import {
  CalendarEvent,
  CreateCalendarEventData,
  UpdateCalendarEventData,
  CreateBulkRecurringEventData,
} from '@/types/calendar.types';

export const calendarService = {
  /**
   * Create a new calendar event
   */
  async createEvent(data: CreateCalendarEventData): Promise<{ event: CalendarEvent; message: string }> {
    const response = await api.post('/calendar/events', data);
    return response.data;
  },

  /**
   * Create bulk recurring events (e.g., weekly classes for a semester)
   */
  async createBulkRecurringEvents(data: CreateBulkRecurringEventData): Promise<{ events: CalendarEvent[]; count: number; message: string }> {
    const response = await api.post('/calendar/events/bulk-recurring', data);
    return response.data;
  },

  /**
   * Get all events for the authenticated user
   */
  async getMyEvents(filters?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ events: CalendarEvent[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const response = await api.get(`/calendar/my-events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get all events for a specific course
   */
  async getCourseEvents(
    courseId: string,
    filters?: {
      start_date?: string;
      end_date?: string;
    }
  ): Promise<{ events: CalendarEvent[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const response = await api.get(`/calendar/courses/${courseId}/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single event by ID
   */
  async getEventById(eventId: string): Promise<{ event: CalendarEvent }> {
    const response = await api.get(`/calendar/events/${eventId}`);
    return response.data;
  },

  /**
   * Update an event
   */
  async updateEvent(eventId: string, data: UpdateCalendarEventData): Promise<{ event: CalendarEvent; message: string }> {
    const response = await api.put(`/calendar/events/${eventId}`, data);
    return response.data;
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<{ message: string }> {
    const response = await api.delete(`/calendar/events/${eventId}`);
    return response.data;
  },
};
