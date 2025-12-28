export enum EventType {
  CLASS = 'class',
  EXAM = 'exam',
  ASSIGNMENT = 'assignment',
  OFFICE_HOURS = 'office_hours',
  OTHER = 'other'
}

export enum EventRecurrence {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface CalendarEvent {
  id: string;
  course_id: string;
  course_code: string;
  course_title: string;
  instructor_id: string;
  instructor_name: string;

  title: string;
  description?: string;
  event_type: EventType;

  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime

  location?: string;
  meeting_url?: string;

  recurrence: EventRecurrence;
  recurrence_end_date?: string; // For recurring events

  created_at: string;
  updated_at: string;
}

export interface CreateCalendarEventDTO {
  course_id: string;
  title: string;
  description?: string;
  event_type: EventType;
  start_time: string;
  end_time: string;
  location?: string;
  meeting_url?: string;
  recurrence?: EventRecurrence;
  recurrence_end_date?: string;
}

export interface UpdateCalendarEventDTO {
  title?: string;
  description?: string;
  event_type?: EventType;
  start_time?: string;
  end_time?: string;
  location?: string;
  meeting_url?: string;
  recurrence?: EventRecurrence;
  recurrence_end_date?: string;
}

export interface BulkRecurringEventDTO {
  course_id: string;
  title: string;
  description?: string;
  event_type: EventType;
  days_of_week: number[]; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // Time only (HH:mm format)
  end_time: string; // Time only (HH:mm format)
  start_date: string; // First occurrence date (YYYY-MM-DD)
  duration_weeks: number; // How many weeks to repeat
  location?: string;
  meeting_url?: string;
}
