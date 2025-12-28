import api from '@/config/api';
import {
  GradeColumn,
  StudentGradeRecord,
  GradeHistory,
  GradeStatistics,
  CreateGradeColumnDTO,
  UpdateGradeColumnDTO,
  UpdateGradeDTO,
} from '@/types/grade.types';

export const gradeService = {
  // Create grade column
  createColumn: async (data: CreateGradeColumnDTO) => {
    const response = await api.post('/grades/columns', data);
    return response.data;
  },

  // Get all grade columns for a course
  getColumns: async (courseId: string) => {
    const response = await api.get(`/grades/columns/${courseId}`);
    return response.data;
  },

  // Update grade column
  updateColumn: async (courseId: string, columnId: string, data: UpdateGradeColumnDTO) => {
    const response = await api.patch(`/grades/columns/${courseId}/${columnId}`, data);
    return response.data;
  },

  // Delete grade column
  deleteColumn: async (courseId: string, columnId: string) => {
    const response = await api.delete(`/grades/columns/${courseId}/${columnId}`);
    return response.data;
  },

  // Get my grades (student)
  getMyGrades: async (courseId: string) => {
    const response = await api.get(`/grades/my-grades/${courseId}`);
    return response.data;
  },

  // Get grade center (instructor)
  getGradeCenter: async (courseId: string) => {
    const response = await api.get(`/grades/grade-center/${courseId}`);
    return response.data;
  },

  // Update student grade
  updateGrade: async (
    courseId: string,
    studentId: string,
    columnId: string,
    data: UpdateGradeDTO
  ) => {
    const response = await api.post(`/grades/${courseId}/${studentId}/${columnId}`, data);
    return response.data;
  },

  // Get grade history for a student
  getGradeHistory: async (courseId: string, studentId: string) => {
    const response = await api.get(`/grades/history/${courseId}/${studentId}`);
    return response.data;
  },

  // Get column statistics
  getColumnStatistics: async (courseId: string, columnId: string) => {
    const response = await api.get(`/grades/statistics/${courseId}/${columnId}`);
    return response.data;
  },

  // Export grades to CSV
  exportGrades: async (courseId: string) => {
    const response = await api.get(`/grades/export/${courseId}`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `grades-${courseId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
