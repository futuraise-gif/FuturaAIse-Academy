import api from '@/config/api';
import {
  Assignment,
  AssignmentSubmission,
  CreateAssignmentDTO,
  UpdateAssignmentDTO,
  SubmitAssignmentDTO,
  GradeSubmissionDTO,
} from '@/types/assignment.types';

export const assignmentService = {
  // Create assignment
  createAssignment: async (data: CreateAssignmentDTO) => {
    const response = await api.post('/assignments', data);
    return response.data;
  },

  // Get all assignments for a course
  getAssignmentsByCourse: async (courseId: string, status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get(`/assignments/course/${courseId}`, { params });
    return response.data;
  },

  // Get single assignment
  getAssignmentById: async (courseId: string, assignmentId: string) => {
    const response = await api.get(`/assignments/${courseId}/${assignmentId}`);
    return response.data;
  },

  // Update assignment
  updateAssignment: async (courseId: string, assignmentId: string, data: UpdateAssignmentDTO) => {
    const response = await api.patch(`/assignments/${courseId}/${assignmentId}`, data);
    return response.data;
  },

  // Publish assignment
  publishAssignment: async (courseId: string, assignmentId: string) => {
    const response = await api.post(`/assignments/${courseId}/${assignmentId}/publish`);
    return response.data;
  },

  // Delete assignment
  deleteAssignment: async (courseId: string, assignmentId: string) => {
    const response = await api.delete(`/assignments/${courseId}/${assignmentId}`);
    return response.data;
  },

  // Submit assignment (student)
  submitAssignment: async (courseId: string, assignmentId: string, data: SubmitAssignmentDTO) => {
    const response = await api.post(`/assignments/${courseId}/${assignmentId}/submit`, data);
    return response.data;
  },

  // Get my submission
  getMySubmission: async (courseId: string, assignmentId: string) => {
    const response = await api.get(`/assignments/${courseId}/${assignmentId}/my-submission`);
    return response.data;
  },

  // Get all submissions (instructor)
  getAllSubmissions: async (courseId: string, assignmentId: string, status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get(`/assignments/${courseId}/${assignmentId}/submissions`, { params });
    return response.data;
  },

  // Grade submission (instructor)
  gradeSubmission: async (
    courseId: string,
    assignmentId: string,
    studentId: string,
    data: GradeSubmissionDTO
  ) => {
    const response = await api.post(
      `/assignments/${courseId}/${assignmentId}/submissions/${studentId}/grade`,
      data
    );
    return response.data;
  },
};
