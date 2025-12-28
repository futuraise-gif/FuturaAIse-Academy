/**
 * Program Types for AI Training Institution
 * Programs contain multiple courses (e.g., "Generative AI Bootcamp")
 */

export enum ProgramStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ProgramLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export interface Program {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  level: ProgramLevel;
  status: ProgramStatus;
  thumbnail_url?: string;
  duration_weeks: number;
  tags: string[]; // ['AI', 'Machine Learning', 'Python']
  prerequisites: string[];
  learning_outcomes: string[];
  total_courses: number;
  enrolled_students: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CreateProgramDTO {
  title: string;
  description: string;
  level: ProgramLevel;
  duration_weeks: number;
  tags?: string[];
  prerequisites?: string[];
  learning_outcomes?: string[];
  thumbnail_url?: string;
}

export interface UpdateProgramDTO {
  title?: string;
  description?: string;
  level?: ProgramLevel;
  status?: ProgramStatus;
  duration_weeks?: number;
  tags?: string[];
  prerequisites?: string[];
  learning_outcomes?: string[];
  thumbnail_url?: string;
}
