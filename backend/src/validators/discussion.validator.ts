import { body, param } from 'express-validator';
import { ThreadCategory, ThreadStatus, ReactionType } from '../types/discussion.types';

export const courseIdValidator = [
  param('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required')
];

export const threadIdValidator = [
  param('threadId')
    .trim()
    .notEmpty()
    .withMessage('Thread ID is required')
];

export const replyIdValidator = [
  param('replyId')
    .trim()
    .notEmpty()
    .withMessage('Reply ID is required')
];

export const createThreadValidator = [
  body('course_id')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('category')
    .isIn(Object.values(ThreadCategory))
    .withMessage('Invalid category'),
  body('is_announcement')
    .optional()
    .isBoolean()
    .withMessage('is_announcement must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

export const updateThreadValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('category')
    .optional()
    .isIn(Object.values(ThreadCategory))
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(Object.values(ThreadStatus))
    .withMessage('Invalid status'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

export const createReplyValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  body('parent_reply_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Parent reply ID cannot be empty if provided')
];

export const updateReplyValidator = [
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters')
];

export const pinThreadValidator = [
  body('pin')
    .isBoolean()
    .withMessage('Pin must be a boolean')
];

export const lockThreadValidator = [
  body('lock')
    .isBoolean()
    .withMessage('Lock must be a boolean'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Lock reason must be between 5 and 500 characters')
];

export const addReactionValidator = [
  body('type')
    .isIn(Object.values(ReactionType))
    .withMessage('Invalid reaction type')
];
