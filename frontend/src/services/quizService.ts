import api from '@/config/api';
import {
  Quiz,
  QuizAttempt,
  QuizStatistics,
  CreateQuizDTO,
  UpdateQuizDTO,
  SubmitQuizAttemptDTO,
} from '@/types/quiz.types';

export const quizService = {
  // Create quiz
  createQuiz: async (data: CreateQuizDTO) => {
    const response = await api.post('/quizzes', data);
    return response.data;
  },

  // Get all quizzes for a course
  getQuizzesByCourse: async (courseId: string, status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get(`/quizzes/course/${courseId}`, { params });
    return response.data;
  },

  // Get single quiz
  getQuizById: async (courseId: string, quizId: string) => {
    const response = await api.get(`/quizzes/${courseId}/${quizId}`);
    return response.data;
  },

  // Update quiz
  updateQuiz: async (courseId: string, quizId: string, data: UpdateQuizDTO) => {
    const response = await api.patch(`/quizzes/${courseId}/${quizId}`, data);
    return response.data;
  },

  // Publish quiz
  publishQuiz: async (courseId: string, quizId: string) => {
    const response = await api.post(`/quizzes/${courseId}/${quizId}/publish`);
    return response.data;
  },

  // Close quiz
  closeQuiz: async (courseId: string, quizId: string) => {
    const response = await api.post(`/quizzes/${courseId}/${quizId}/close`);
    return response.data;
  },

  // Delete quiz
  deleteQuiz: async (courseId: string, quizId: string) => {
    const response = await api.delete(`/quizzes/${courseId}/${quizId}`);
    return response.data;
  },

  // Start quiz attempt (student)
  startAttempt: async (courseId: string, quizId: string) => {
    const response = await api.post(`/quizzes/${courseId}/${quizId}/start`);
    return response.data;
  },

  // Submit quiz attempt (student)
  submitAttempt: async (
    courseId: string,
    quizId: string,
    attemptId: string,
    data: SubmitQuizAttemptDTO
  ) => {
    const response = await api.post(
      `/quizzes/${courseId}/${quizId}/attempts/${attemptId}/submit`,
      data
    );
    return response.data;
  },

  // Get my attempts
  getMyAttempts: async (courseId: string, quizId: string) => {
    const response = await api.get(`/quizzes/${courseId}/${quizId}/my-attempts`);
    return response.data;
  },

  // Get all attempts (instructor)
  getAllAttempts: async (courseId: string, quizId: string) => {
    const response = await api.get(`/quizzes/${courseId}/${quizId}/attempts`);
    return response.data;
  },

  // Get quiz statistics (instructor)
  getStatistics: async (courseId: string, quizId: string) => {
    const response = await api.get(`/quizzes/${courseId}/${quizId}/statistics`);
    return response.data;
  },
};
