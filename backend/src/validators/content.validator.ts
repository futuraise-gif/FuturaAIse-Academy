import { body, param, query } from 'express-validator';
import { ContentType, ContentStatus } from '../types/content.types';

export const courseIdValidator = [
  param('courseId').trim().notEmpty().withMessage('Course ID is required'),
];

export const contentIdValidator = [
  param('contentId').trim().notEmpty().withMessage('Content ID is required'),
];

export const createContentItemValidator = [
  body('course_id').trim().notEmpty().withMessage('Course ID is required'),
  body('type').isIn(Object.values(ContentType)).withMessage('Invalid content type'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  body('parent_id').optional().trim(),
  body('external_url')
    .optional()
    .isURL()
    .withMessage('External URL must be a valid URL'),
  body('text_content')
    .optional()
    .isLength({ max: 50000 })
    .withMessage('Text content must not exceed 50000 characters'),
  body('linked_item_id').optional().trim(),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('indent_level')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Indent level must be between 0 and 10'),
  body('status')
    .optional()
    .isIn(Object.values(ContentStatus))
    .withMessage('Invalid status'),
  body('available_from').optional().isISO8601().withMessage('Invalid date format'),
  body('available_until').optional().isISO8601().withMessage('Invalid date format'),
  body('visible_to_students').optional().isBoolean().withMessage('Must be a boolean'),
  body('require_previous_completion').optional().isBoolean().withMessage('Must be a boolean'),
  body('prerequisite_content_ids')
    .optional()
    .isArray()
    .withMessage('Prerequisite content IDs must be an array'),
  body('is_graded').optional().isBoolean().withMessage('Must be a boolean'),
  body('points')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Points must be a non-negative integer'),
];

export const updateContentItemValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  body('external_url')
    .optional()
    .isURL()
    .withMessage('External URL must be a valid URL'),
  body('text_content')
    .optional()
    .isLength({ max: 50000 })
    .withMessage('Text content must not exceed 50000 characters'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('indent_level')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Indent level must be between 0 and 10'),
  body('status')
    .optional()
    .isIn(Object.values(ContentStatus))
    .withMessage('Invalid status'),
  body('available_from').optional().isISO8601().withMessage('Invalid date format'),
  body('available_until').optional().isISO8601().withMessage('Invalid date format'),
  body('visible_to_students').optional().isBoolean().withMessage('Must be a boolean'),
  body('require_previous_completion').optional().isBoolean().withMessage('Must be a boolean'),
  body('prerequisite_content_ids')
    .optional()
    .isArray()
    .withMessage('Prerequisite content IDs must be an array'),
  body('is_graded').optional().isBoolean().withMessage('Must be a boolean'),
  body('points')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Points must be a non-negative integer'),
  body('parent_id').optional().trim(),
];

export const updateContentAccessValidator = [
  body('is_completed').optional().isBoolean().withMessage('Must be a boolean'),
  body('completion_percentage')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Completion percentage must be between 0 and 100'),
  body('total_time_spent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total time spent must be a non-negative integer'),
  body('video_progress')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Video progress must be a non-negative integer'),
];

export const reorderContentValidator = [
  body('content_ids')
    .isArray()
    .withMessage('Content IDs must be an array')
    .notEmpty()
    .withMessage('Content IDs array cannot be empty'),
  body('new_orders')
    .isArray()
    .withMessage('New orders must be an array')
    .notEmpty()
    .withMessage('New orders array cannot be empty'),
];
