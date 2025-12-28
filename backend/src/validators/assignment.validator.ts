import { body, param, query } from 'express-validator';
import { AssignmentStatus, FileType } from '../types/assignment.types';

export const createAssignmentValidation = [
  body('course_id').isString().notEmpty().withMessage('Course ID is required'),
  body('title')
    .isString()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  body('description').optional().isString(),
  body('instructions').optional().isString(),
  body('points')
    .isInt({ min: 0 })
    .withMessage('Points must be a positive integer'),
  body('grading_rubric').optional().isString(),
  body('available_from').isISO8601().withMessage('Invalid available_from date'),
  body('due_date').isISO8601().withMessage('Invalid due_date'),
  body('available_until').optional().isISO8601().withMessage('Invalid available_until date'),
  body('allow_late_submissions').optional().isBoolean(),
  body('late_penalty_per_day').optional().isInt({ min: 0, max: 100 }),
  body('max_attempts').optional().isInt({ min: 1 }),
  body('allowed_file_types').optional().isArray(),
  body('max_file_size_mb').optional().isInt({ min: 1, max: 100 }),
  body('require_file_submission').optional().isBoolean(),
  body('allow_text_submission').optional().isBoolean(),
];

export const updateAssignmentValidation = [
  param('id').isString().notEmpty(),
  body('title').optional().isString().isLength({ max: 200 }),
  body('description').optional().isString(),
  body('instructions').optional().isString(),
  body('points').optional().isInt({ min: 0 }),
  body('grading_rubric').optional().isString(),
  body('available_from').optional().isISO8601(),
  body('due_date').optional().isISO8601(),
  body('available_until').optional().isISO8601(),
  body('allow_late_submissions').optional().isBoolean(),
  body('late_penalty_per_day').optional().isInt({ min: 0, max: 100 }),
  body('max_attempts').optional().isInt({ min: 1 }),
  body('status').optional().isIn(Object.values(AssignmentStatus)),
];

export const submitAssignmentValidation = [
  param('id').isString().notEmpty(),
  body('text_submission').optional().isString(),
  body('files').optional().isArray(),
];

export const gradeSubmissionValidation = [
  param('id').isString().notEmpty(),
  param('studentId').isString().notEmpty(),
  body('grade')
    .isFloat({ min: 0 })
    .withMessage('Grade must be a positive number'),
  body('feedback').optional().isString(),
];
