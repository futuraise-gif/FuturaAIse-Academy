"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quiz_controller_1 = require("../controllers/quiz.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const validate_1 = require("../middleware/validate");
const quiz_validator_1 = require("../validators/quiz.validator");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
// Create quiz
router.post('/', quiz_validator_1.createQuizValidation, validate_1.validate, quiz_controller_1.QuizController.createQuiz);
// Get all quizzes for a course
router.get('/course/:courseId', quiz_controller_1.QuizController.getQuizzesByCourse);
// Get single quiz
router.get('/:courseId/:id', quiz_controller_1.QuizController.getQuizById);
// Update quiz
router.patch('/:courseId/:id', quiz_validator_1.updateQuizValidation, validate_1.validate, quiz_controller_1.QuizController.updateQuiz);
// Publish quiz
router.post('/:courseId/:id/publish', quiz_controller_1.QuizController.publishQuiz);
// Close quiz
router.post('/:courseId/:id/close', quiz_controller_1.QuizController.closeQuiz);
// Delete quiz
router.delete('/:courseId/:id', quiz_controller_1.QuizController.deleteQuiz);
// Start quiz attempt (student)
router.post('/:courseId/:id/start', quiz_controller_1.QuizController.startAttempt);
// Submit quiz attempt (student)
router.post('/:courseId/:id/attempts/:attemptId/submit', quiz_validator_1.submitQuizValidation, validate_1.validate, quiz_controller_1.QuizController.submitAttempt);
// Get my attempts
router.get('/:courseId/:id/my-attempts', quiz_controller_1.QuizController.getMyAttempts);
// Get all attempts (instructor)
router.get('/:courseId/:id/attempts', quiz_controller_1.QuizController.getAllAttempts);
// Get quiz statistics (instructor)
router.get('/:courseId/:id/statistics', quiz_controller_1.QuizController.getStatistics);
exports.default = router;
//# sourceMappingURL=quiz.routes.js.map