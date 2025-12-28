import { body, param } from 'express-validator';
import { QuizStatus, QuestionType } from '../types/quiz.types';

export const createQuizValidation = [
  body('course_id').isString().notEmpty().withMessage('Course ID is required'),
  body('title')
    .isString()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  body('description').optional().isString(),
  body('instructions').optional().isString(),
  body('time_limit_minutes').optional().isInt({ min: 1 }),
  body('max_attempts').optional().isInt({ min: 1 }),
  body('shuffle_questions').optional().isBoolean(),
  body('shuffle_options').optional().isBoolean(),
  body('show_correct_answers').optional().isBoolean(),
  body('show_score_immediately').optional().isBoolean(),
  body('available_from').isISO8601().withMessage('Invalid available_from date'),
  body('available_until').isISO8601().withMessage('Invalid available_until date'),
  body('passing_score').optional().isInt({ min: 0, max: 100 }),
  body('questions').isArray().withMessage('Questions must be an array'),
  body('questions.*.type')
    .isIn(Object.values(QuestionType))
    .withMessage('Invalid question type'),
  body('questions.*.question_text').isString().notEmpty(),
  body('questions.*.points').isInt({ min: 0 }),
];

export const updateQuizValidation = [
  param('id').isString().notEmpty(),
  body('title').optional().isString().isLength({ max: 200 }),
  body('description').optional().isString(),
  body('instructions').optional().isString(),
  body('time_limit_minutes').optional().isInt({ min: 1 }),
  body('max_attempts').optional().isInt({ min: 1 }),
  body('shuffle_questions').optional().isBoolean(),
  body('shuffle_options').optional().isBoolean(),
  body('show_correct_answers').optional().isBoolean(),
  body('show_score_immediately').optional().isBoolean(),
  body('available_from').optional().isISO8601(),
  body('available_until').optional().isISO8601(),
  body('passing_score').optional().isInt({ min: 0, max: 100 }),
  body('questions').optional().isArray(),
];

export const submitQuizValidation = [
  param('attemptId').isString().notEmpty(),
  body('answers').isObject().withMessage('Answers must be an object'),
];
