import { Request, Response } from 'express';
import { QuizModel } from '../models/quiz.model';
import { AuthRequest } from '../types';
import { CreateQuizDTO, UpdateQuizDTO, SubmitQuizAttemptDTO } from '../types/quiz.types';
import { CourseModel } from '../models/course.model';

export class QuizController {
  /**
   * Create a new quiz
   */
  static async createQuiz(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const data: CreateQuizDTO = req.body;

      // Verify instructor owns the course
      const course = await CourseModel.findById(data.course_id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to create quizzes for this course' });
      }

      const quiz = await QuizModel.create(userId, data);

      res.status(201).json({
        message: 'Quiz created successfully',
        quiz,
      });
    } catch (error: any) {
      console.error('Create quiz error:', error);
      res.status(500).json({ error: error.message || 'Failed to create quiz' });
    }
  }

  /**
   * Get all quizzes for a course
   */
  static async getQuizzesByCourse(req: AuthRequest, res: Response) {
    try {
      const { courseId } = req.params;
      const { status } = req.query;

      const quizzes = await QuizModel.findByCourse(courseId, {
        status: status as any,
      });

      res.json({
        message: 'Quizzes retrieved successfully',
        quizzes,
      });
    } catch (error: any) {
      console.error('Get quizzes error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve quizzes' });
    }
  }

  /**
   * Get single quiz by ID
   */
  static async getQuizById(req: AuthRequest, res: Response) {
    try {
      const { courseId, id } = req.params;
      const userId = req.user!.uid;

      const quiz = await QuizModel.findById(courseId, id);

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Verify course access
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // For students, hide correct answers if not allowed
      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        const quizCopy = { ...quiz };
        if (!quiz.show_correct_answers) {
          quizCopy.questions = quiz.questions.map((q) => ({
            ...q,
            correct_option_index: undefined,
            correct_answer: undefined,
            correct_answers: undefined,
          }));
        }
        return res.json({
          message: 'Quiz retrieved successfully',
          quiz: quizCopy,
        });
      }

      res.json({
        message: 'Quiz retrieved successfully',
        quiz,
      });
    } catch (error: any) {
      console.error('Get quiz error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve quiz' });
    }
  }

  /**
   * Update quiz
   */
  static async updateQuiz(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId, id } = req.params;
      const updates: UpdateQuizDTO = req.body;

      // Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this quiz' });
      }

      const quiz = await QuizModel.update(courseId, id, updates);

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      res.json({
        message: 'Quiz updated successfully',
        quiz,
      });
    } catch (error: any) {
      console.error('Update quiz error:', error);
      res.status(500).json({ error: error.message || 'Failed to update quiz' });
    }
  }

  /**
   * Publish quiz
   */
  static async publishQuiz(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId, id } = req.params;

      // Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to publish this quiz' });
      }

      const quiz = await QuizModel.publish(courseId, id);

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      res.json({
        message: 'Quiz published successfully',
        quiz,
      });
    } catch (error: any) {
      console.error('Publish quiz error:', error);
      res.status(500).json({ error: error.message || 'Failed to publish quiz' });
    }
  }

  /**
   * Close quiz
   */
  static async closeQuiz(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId, id } = req.params;

      // Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to close this quiz' });
      }

      const quiz = await QuizModel.close(courseId, id);

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      res.json({
        message: 'Quiz closed successfully',
        quiz,
      });
    } catch (error: any) {
      console.error('Close quiz error:', error);
      res.status(500).json({ error: error.message || 'Failed to close quiz' });
    }
  }

  /**
   * Delete quiz
   */
  static async deleteQuiz(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId, id } = req.params;

      // Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this quiz' });
      }

      const success = await QuizModel.delete(courseId, id);

      if (!success) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      res.json({
        message: 'Quiz deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete quiz error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete quiz' });
    }
  }

  /**
   * Start a quiz attempt (student)
   */
  static async startAttempt(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const userName = req.user!.name || '';
      const userEmail = req.user!.email || '';
      const { courseId, id } = req.params;

      const attempt = await QuizModel.startAttempt(
        courseId,
        id,
        userId,
        userName,
        userEmail
      );

      res.status(201).json({
        message: 'Quiz attempt started successfully',
        attempt,
      });
    } catch (error: any) {
      console.error('Start quiz attempt error:', error);
      res.status(400).json({ error: error.message || 'Failed to start quiz attempt' });
    }
  }

  /**
   * Submit quiz attempt with auto-grading (student)
   */
  static async submitAttempt(req: AuthRequest, res: Response) {
    try {
      const { courseId, id, attemptId } = req.params;
      const data: SubmitQuizAttemptDTO = req.body;

      const attempt = await QuizModel.submitAttempt(courseId, id, attemptId, data);

      res.json({
        message: 'Quiz submitted successfully',
        attempt,
      });
    } catch (error: any) {
      console.error('Submit quiz attempt error:', error);
      res.status(400).json({ error: error.message || 'Failed to submit quiz' });
    }
  }

  /**
   * Get student's attempts for a quiz
   */
  static async getMyAttempts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId, id } = req.params;

      const attempts = await QuizModel.getStudentAttempts(courseId, id, userId);

      res.json({
        message: 'Quiz attempts retrieved successfully',
        attempts,
      });
    } catch (error: any) {
      console.error('Get my attempts error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve quiz attempts' });
    }
  }

  /**
   * Get all attempts for a quiz (instructor)
   */
  static async getAllAttempts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId, id } = req.params;

      // Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view quiz attempts' });
      }

      const attempts = await QuizModel.getAllAttempts(courseId, id);

      res.json({
        message: 'Quiz attempts retrieved successfully',
        attempts,
      });
    } catch (error: any) {
      console.error('Get all attempts error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve quiz attempts' });
    }
  }

  /**
   * Get quiz statistics (instructor)
   */
  static async getStatistics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.uid;
      const { courseId, id } = req.params;

      // Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.instructor_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view quiz statistics' });
      }

      const statistics = await QuizModel.getStatistics(courseId, id);

      if (!statistics) {
        return res.status(404).json({ error: 'No statistics available yet' });
      }

      res.json({
        message: 'Quiz statistics retrieved successfully',
        statistics,
      });
    } catch (error: any) {
      console.error('Get quiz statistics error:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve quiz statistics' });
    }
  }
}
