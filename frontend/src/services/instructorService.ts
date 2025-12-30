import api from '@/config/api';
import {
  Program,
  CreateProgramDTO,
  UpdateProgramDTO,
  Course,
  Module,
  AttendanceRecord,
  AttendanceStats,
  Assignment,
  AssignmentSubmission,
  Announcement,
  StudentProgress,
  CourseAnalytics,
} from '@/types/instructor.types';

export interface InstructorDashboardStats {
  total_courses: number;
  active_courses: number;
  draft_courses: number;
  total_students: number;
  pending_submissions: number;
  total_programs?: number;
}

export interface CourseWithStats {
  id: string;
  title: string;
  course_code: string;
  description?: string;
  status: string;
  enrolled_count: number;
  max_students?: number;
  start_date: string;
  end_date?: string;
  stats: {
    total_assignments: number;
    total_quizzes: number;
    pending_submissions: number;
  };
}

export interface CourseOverview {
  course: any;
  overview: {
    enrollments: {
      total: number;
      active: number;
      pending: number;
    };
    assignments: {
      total: number;
      published: number;
      draft: number;
    };
    quizzes: {
      total: number;
      published: number;
      draft: number;
    };
    grade_columns: number;
    recent_submissions_24h: number;
  };
}

export interface PendingEnrollment {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  status: string;
  enrolled_at: string;
}

export const instructorService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<{ stats: InstructorDashboardStats }> => {
    const response = await api.get('/instructor/dashboard/stats');
    return response.data;
  },

  // Get instructor's courses with stats
  getMyCourses: async (status?: string): Promise<{ courses: CourseWithStats[] }> => {
    const params = status ? { status } : {};
    const response = await api.get('/instructor/my-courses', { params });
    return response.data;
  },

  // Get course overview
  getCourseOverview: async (courseId: string): Promise<CourseOverview> => {
    const response = await api.get(`/instructor/courses/${courseId}/overview`);
    return response.data;
  },

  // Get pending enrollments
  getPendingEnrollments: async (courseId: string): Promise<{ enrollments: PendingEnrollment[] }> => {
    const response = await api.get(`/instructor/courses/${courseId}/enrollments/pending`);
    return response.data;
  },

  // Approve enrollment
  approveEnrollment: async (courseId: string, enrollmentId: string) => {
    const response = await api.post(
      `/instructor/courses/${courseId}/enrollments/${enrollmentId}/approve`
    );
    return response.data;
  },

  // Reject enrollment
  rejectEnrollment: async (courseId: string, enrollmentId: string) => {
    const response = await api.post(
      `/instructor/courses/${courseId}/enrollments/${enrollmentId}/reject`
    );
    return response.data;
  },
};

// Program APIs
export const programService = {
  createProgram: async (data: CreateProgramDTO): Promise<Program> => {
    const response = await api.post('/instructor/programs', data);
    return response.data.program;
  },

  getInstructorPrograms: async (): Promise<Program[]> => {
    const response = await api.get('/instructor/programs');
    return response.data.programs;
  },

  getPublishedPrograms: async (): Promise<Program[]> => {
    const response = await api.get('/instructor/programs/published');
    return response.data.programs;
  },

  getProgramById: async (programId: string): Promise<Program> => {
    const response = await api.get(`/instructor/programs/${programId}`);
    return response.data.program;
  },

  updateProgram: async (programId: string, data: UpdateProgramDTO): Promise<Program> => {
    const response = await api.put(`/instructor/programs/${programId}`, data);
    return response.data.program;
  },

  deleteProgram: async (programId: string): Promise<void> => {
    await api.delete(`/instructor/programs/${programId}`);
  },

  publishProgram: async (programId: string): Promise<Program> => {
    const response = await api.post(`/instructor/programs/${programId}/publish`);
    return response.data.program;
  },

  archiveProgram: async (programId: string): Promise<Program> => {
    const response = await api.post(`/instructor/programs/${programId}/archive`);
    return response.data.program;
  },

  getProgramDetails: async (programId: string): Promise<Program> => {
    const response = await api.get(`/instructor/programs/${programId}`);
    return response.data.program;
  },
};

// Course APIs
export const courseService = {
  createCourse: async (data: any): Promise<Course> => {
    const response = await api.post('/instructor/courses', data);
    return response.data.course;
  },

  getInstructorCourses: async (programId?: string): Promise<Course[]> => {
    const response = await api.get('/instructor/courses', {
      params: { program_id: programId },
    });
    return response.data.courses;
  },

  getCourseDetails: async (courseId: string): Promise<Course> => {
    const response = await api.get(`/instructor/courses/${courseId}`);
    return response.data.course;
  },

  updateCourse: async (courseId: string, data: any): Promise<Course> => {
    const response = await api.put(`/instructor/courses/${courseId}`, data);
    return response.data.course;
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    await api.delete(`/instructor/courses/${courseId}`);
  },

  publishCourse: async (courseId: string): Promise<Course> => {
    const response = await api.post(`/instructor/courses/${courseId}/publish`);
    return response.data.course;
  },

  getEnrolledStudents: async (courseId: string): Promise<any[]> => {
    const response = await api.get(`/instructor/courses/${courseId}/students`);
    return response.data.students;
  },
};

// Module APIs
export const moduleService = {
  createModule: async (data: any): Promise<Module> => {
    const response = await api.post('/instructor/modules', data);
    return response.data.module;
  },

  getCourseModules: async (courseId: string): Promise<Module[]> => {
    const response = await api.get(`/instructor/courses/${courseId}/modules`);
    return response.data.modules;
  },

  updateModule: async (moduleId: string, data: any): Promise<Module> => {
    const response = await api.put(`/instructor/modules/${moduleId}`, data);
    return response.data.module;
  },

  deleteModule: async (moduleId: string): Promise<void> => {
    await api.delete(`/instructor/modules/${moduleId}`);
  },

  addMaterial: async (moduleId: string, data: any): Promise<Module> => {
    const response = await api.post(`/instructor/modules/${moduleId}/materials`, data);
    return response.data.module;
  },

  removeMaterial: async (moduleId: string, materialId: string): Promise<Module> => {
    const response = await api.delete(`/instructor/modules/${moduleId}/materials/${materialId}`);
    return response.data.module;
  },

  scheduleLiveClass: async (moduleId: string, data: any): Promise<Module> => {
    const response = await api.post(`/instructor/modules/${moduleId}/live-session`, data);
    return response.data.module;
  },

  reorderModules: async (courseId: string, moduleOrders: { module_id: string; order: number }[]): Promise<void> => {
    await api.post(`/instructor/courses/${courseId}/modules/reorder`, { module_orders: moduleOrders });
  },
};

// Attendance APIs
export const attendanceService = {
  markAttendance: async (data: any): Promise<AttendanceRecord> => {
    const response = await api.post('/instructor/attendance', data);
    return response.data.attendance;
  },

  bulkMarkAttendance: async (data: any): Promise<any> => {
    const response = await api.post('/instructor/attendance/bulk', data);
    return response.data;
  },

  getCourseAttendance: async (courseId: string, params?: any): Promise<AttendanceRecord[]> => {
    const response = await api.get(`/instructor/attendance/course/${courseId}`, { params });
    return response.data.records;
  },

  getStudentAttendanceStats: async (studentId: string, courseId: string): Promise<AttendanceStats> => {
    const response = await api.get(`/instructor/attendance/stats/${studentId}/${courseId}`);
    return response.data.stats;
  },

  getCourseAttendanceSummary: async (courseId: string): Promise<any[]> => {
    const response = await api.get(`/instructor/attendance/summary/${courseId}`);
    return response.data.summary;
  },
};

// Assignment APIs
export const assignmentService = {
  createAssignment: async (data: any): Promise<Assignment> => {
    const response = await api.post('/instructor/assignments', data);
    return response.data.assignment;
  },

  getCourseAssignments: async (courseId: string): Promise<Assignment[]> => {
    const response = await api.get(`/instructor/assignments/course/${courseId}`);
    return response.data.assignments;
  },

  getAssignmentDetails: async (assignmentId: string): Promise<Assignment> => {
    const response = await api.get(`/instructor/assignments/${assignmentId}`);
    return response.data.assignment;
  },

  updateAssignment: async (assignmentId: string, data: any): Promise<Assignment> => {
    const response = await api.put(`/instructor/assignments/${assignmentId}`, data);
    return response.data.assignment;
  },

  deleteAssignment: async (assignmentId: string): Promise<void> => {
    await api.delete(`/instructor/assignments/${assignmentId}`);
  },

  publishAssignment: async (assignmentId: string): Promise<Assignment> => {
    const response = await api.post(`/instructor/assignments/${assignmentId}/publish`);
    return response.data.assignment;
  },

  getAssignmentSubmissions: async (assignmentId: string): Promise<AssignmentSubmission[]> => {
    const response = await api.get(`/instructor/assignments/${assignmentId}/submissions`);
    return response.data.submissions;
  },

  getSubmissionDetails: async (submissionId: string): Promise<AssignmentSubmission> => {
    const response = await api.get(`/instructor/assignments/submissions/${submissionId}`);
    return response.data.submission;
  },

  gradeSubmission: async (submissionId: string, grade: number, feedback?: string): Promise<AssignmentSubmission> => {
    const response = await api.post(`/instructor/assignments/submissions/${submissionId}/grade`, {
      grade,
      feedback,
    });
    return response.data.submission;
  },

  returnSubmission: async (submissionId: string): Promise<AssignmentSubmission> => {
    const response = await api.post(`/instructor/assignments/submissions/${submissionId}/return`);
    return response.data.submission;
  },

  getAssignmentStats: async (assignmentId: string): Promise<any> => {
    const response = await api.get(`/instructor/assignments/${assignmentId}/stats`);
    return response.data.stats;
  },

  getStudentSubmission: async (assignmentId: string, studentId: string): Promise<AssignmentSubmission | null> => {
    const response = await api.get(`/instructor/assignments/${assignmentId}/student/${studentId}`);
    return response.data.submission;
  },
};

// Announcement APIs
export const announcementService = {
  createAnnouncement: async (data: any): Promise<Announcement> => {
    const response = await api.post('/instructor/announcements', data);
    return response.data.announcement;
  },

  getAnnouncements: async (params?: any): Promise<Announcement[]> => {
    const response = await api.get('/instructor/announcements', { params });
    return response.data.announcements;
  },

  getCourseAnnouncements: async (courseId: string): Promise<Announcement[]> => {
    const response = await api.get(`/instructor/announcements/course/${courseId}`);
    return response.data.announcements;
  },

  getAnnouncementDetails: async (announcementId: string): Promise<Announcement> => {
    const response = await api.get(`/instructor/announcements/${announcementId}`);
    return response.data.announcement;
  },

  updateAnnouncement: async (announcementId: string, data: any): Promise<Announcement> => {
    const response = await api.put(`/instructor/announcements/${announcementId}`, data);
    return response.data.announcement;
  },

  deleteAnnouncement: async (announcementId: string): Promise<void> => {
    await api.delete(`/instructor/announcements/${announcementId}`);
  },

  publishAnnouncement: async (announcementId: string): Promise<Announcement> => {
    const response = await api.post(`/instructor/announcements/${announcementId}/publish`);
    return response.data.announcement;
  },

  archiveAnnouncement: async (announcementId: string): Promise<Announcement> => {
    const response = await api.post(`/instructor/announcements/${announcementId}/archive`);
    return response.data.announcement;
  },
};

// Analytics APIs
export const analyticsService = {
  getInstructorDashboard: async (): Promise<any> => {
    const response = await api.get('/instructor/analytics/dashboard');
    return response.data.dashboard;
  },

  getStudentProgress: async (studentId: string, courseId: string): Promise<StudentProgress> => {
    const response = await api.get(`/instructor/analytics/student/${studentId}/course/${courseId}`);
    return response.data.progress;
  },

  getCourseStudentsProgress: async (courseId: string): Promise<StudentProgress[]> => {
    const response = await api.get(`/instructor/analytics/course/${courseId}/students`);
    return response.data.students;
  },

  getCourseAnalytics: async (courseId: string): Promise<CourseAnalytics> => {
    const response = await api.get(`/instructor/analytics/course/${courseId}`);
    return response.data.analytics;
  },

  getStudentPerformanceMetrics: async (studentId: string, courseId: string): Promise<any> => {
    const response = await api.get(`/instructor/analytics/student/${studentId}/performance/${courseId}`);
    return response.data.metrics;
  },
};
