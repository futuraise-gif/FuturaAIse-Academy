export enum LiveSessionStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum LiveSessionPlatform {
  JITSI = 'jitsi',
  ZOOM = 'zoom',
  GOOGLE_MEET = 'google_meet',
  CUSTOM = 'custom',
}

export interface LiveSession {
  id: string;
  course_id: string;
  course_title: string;
  module_id?: string;
  module_title?: string;
  instructor_id: string;
  instructor_name: string;
  title: string;
  description: string;
  platform: LiveSessionPlatform;
  meeting_url: string;
  meeting_id?: string;
  meeting_password?: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  status: LiveSessionStatus;
  max_participants?: number;
  recording_enabled: boolean;
  recording_url?: string;
  attendees: string[]; // User IDs who joined
  created_at: string;
  updated_at: string;
}

export interface CreateLiveSessionDTO {
  course_id: string;
  module_id?: string;
  title: string;
  description: string;
  platform: LiveSessionPlatform;
  meeting_url?: string; // Optional for custom platforms
  meeting_password?: string;
  scheduled_start: string;
  scheduled_end: string;
  max_participants?: number;
  recording_enabled?: boolean;
}

export interface UpdateLiveSessionDTO {
  title?: string;
  description?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  meeting_url?: string;
  meeting_password?: string;
  max_participants?: number;
  recording_enabled?: boolean;
  status?: LiveSessionStatus;
}

export interface JoinSessionDTO {
  session_id: string;
  user_name: string;
}
