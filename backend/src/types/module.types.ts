/**
 * Module Types for Course Content
 * Modules contain lectures, materials, assignments
 */

export enum ModuleType {
  LECTURE = 'lecture',
  LAB = 'lab',
  ASSIGNMENT = 'assignment',
  QUIZ = 'quiz',
  LIVE_CLASS = 'live_class',
  READING = 'reading',
}

export enum ModuleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
}

export interface ModuleMaterial {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'notebook' | 'link' | 'code';
  url: string;
  file_size?: number;
  duration_minutes?: number; // for videos
  download_url?: string;
  created_at: string;
}

export interface LiveClassSession {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string; // Zoom/Google Meet
  meeting_id?: string;
  passcode?: string;
  recording_url?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  program_id: string;
  title: string;
  description: string;
  type: ModuleType;
  status: ModuleStatus;
  order: number; // for ordering modules in a course

  // Content
  materials: ModuleMaterial[];
  live_sessions: LiveClassSession[];

  // Metadata
  duration_minutes: number;
  is_mandatory: boolean;
  prerequisites_module_ids: string[];

  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CreateModuleDTO {
  course_id: string;
  program_id: string;
  title: string;
  description: string;
  type: ModuleType;
  order?: number;
  duration_minutes?: number;
  is_mandatory?: boolean;
}

export interface UpdateModuleDTO {
  title?: string;
  description?: string;
  type?: ModuleType;
  status?: ModuleStatus;
  order?: number;
  duration_minutes?: number;
  is_mandatory?: boolean;
}

export interface AddMaterialDTO {
  title: string;
  type: 'video' | 'pdf' | 'notebook' | 'link' | 'code';
  url: string;
  file_size?: number;
  duration_minutes?: number;
  download_url?: string;
}

export interface ScheduleLiveClassDTO {
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string;
  meeting_id?: string;
  passcode?: string;
}
