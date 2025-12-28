import api from '@/config/api';
import {
  Course,
  CourseEnrollment,
  CreateCourseData,
  UpdateCourseData,
  CourseStatus,
  EnrollmentStatus,
  Term
} from '@/types/course.types';

export const courseService = {
  // Get all courses
  async getAllCourses(filters?: {
    status?: CourseStatus;
    term?: Term;
    year?: number;
    limit?: number;
  }): Promise<{ courses: Course[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.term) params.append('term', filters.term);
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/courses?${params.toString()}`);
    return response.data;
  },

  // Get courses I'm enrolled in
  async getMyEnrolledCourses(status?: EnrollmentStatus): Promise<{ courses: Course[]; count: number }> {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/courses/my-courses${params}`);
    return response.data;
  },

  // Get a single course
  async getCourseById(courseId: string): Promise<{ course: Course; enrollment: CourseEnrollment | null }> {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  // Create a new course (instructor/admin only)
  async createCourse(data: CreateCourseData): Promise<{ course: Course; message: string }> {
    const response = await api.post('/courses', data);
    return response.data;
  },

  // Update a course
  async updateCourse(courseId: string, data: UpdateCourseData): Promise<{ course: Course; message: string }> {
    const response = await api.put(`/courses/${courseId}`, data);
    return response.data;
  },

  // Delete (archive) a course
  async deleteCourse(courseId: string): Promise<{ message: string }> {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  },

  // Publish a course
  async publishCourse(courseId: string): Promise<{ course: Course; message: string }> {
    const response = await api.post(`/courses/${courseId}/publish`);
    return response.data;
  },

  // Self-enroll in a course using course code
  async selfEnroll(courseCode: string): Promise<{ enrollment: CourseEnrollment; course: Course; message: string }> {
    const response = await api.post('/courses/enroll', { course_code: courseCode });
    return response.data;
  },

  // Enroll a student (instructor/admin only)
  async enrollStudent(courseId: string, data: {
    user_id: string;
    user_name: string;
    user_email: string;
    role?: string;
  }): Promise<{ enrollment: CourseEnrollment; message: string }> {
    const response = await api.post(`/courses/${courseId}/enroll`, data);
    return response.data;
  },

  // Drop from a course
  async dropFromCourse(courseId: string, userId: string): Promise<{ message: string }> {
    const response = await api.delete(`/courses/${courseId}/students/${userId}`);
    return response.data;
  },

  // Get course enrollments (instructor/admin only)
  async getCourseEnrollments(courseId: string): Promise<{ enrollments: CourseEnrollment[]; count: number }> {
    const response = await api.get(`/courses/${courseId}/enrollments`);
    return response.data;
  },
};
