import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';
import { authenticate } from '../middleware/auth.firebase';
import { validate } from '../middleware/validate';
import {
  createQuizValidation,
  updateQuizValidation,
  submitQuizValidation,
} from '../validators/quiz.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create quiz
router.post(
  '/',
  createQuizValidation,
  validate,
  QuizController.createQuiz
);

// Get all quizzes for a course
router.get('/course/:courseId', QuizController.getQuizzesByCourse);

// Get single quiz
router.get('/:courseId/:id', QuizController.getQuizById);

// Update quiz
router.patch(
  '/:courseId/:id',
  updateQuizValidation,
  validate,
  QuizController.updateQuiz
);

// Publish quiz
router.post('/:courseId/:id/publish', QuizController.publishQuiz);

// Close quiz
router.post('/:courseId/:id/close', QuizController.closeQuiz);

// Delete quiz
router.delete('/:courseId/:id', QuizController.deleteQuiz);

// Start quiz attempt (student)
router.post('/:courseId/:id/start', QuizController.startAttempt);

// Submit quiz attempt (student)
router.post(
  '/:courseId/:id/attempts/:attemptId/submit',
  submitQuizValidation,
  validate,
  QuizController.submitAttempt
);

// Get my attempts
router.get('/:courseId/:id/my-attempts', QuizController.getMyAttempts);

// Get all attempts (instructor)
router.get('/:courseId/:id/attempts', QuizController.getAllAttempts);

// Get quiz statistics (instructor)
router.get('/:courseId/:id/statistics', QuizController.getStatistics);

export default router;
