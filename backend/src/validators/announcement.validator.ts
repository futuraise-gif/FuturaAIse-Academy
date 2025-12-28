import { body, query } from 'express-validator';
import { AnnouncementType, AnnouncementPriority, AnnouncementStatus } from '../types/announcement.types';

export const createAnnouncementValidation = [
  body('type')
    .notEmpty()
    .isIn(Object.values(AnnouncementType))
    .withMessage('Type must be either course or global'),
  body('course_id')
    .optional()
    .isString()
    .withMessage('Course ID must be a string'),
  body('title')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be between 1 and 200 characters'),
  body('content')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Content is required and must be between 1 and 50000 characters'),
  body('priority')
    .optional()
    .isIn(Object.values(AnnouncementPriority))
    .withMessage('Invalid priority'),
  body('send_email')
    .optional()
    .isBoolean()
    .withMessage('send_email must be a boolean'),
  body('send_notification')
    .optional()
    .isBoolean()
    .withMessage('send_notification must be a boolean'),
  body('visible_from')
    .optional()
    .isISO8601()
    .withMessage('visible_from must be a valid ISO 8601 date'),
  body('visible_until')
    .optional()
    .isISO8601()
    .withMessage('visible_until must be a valid ISO 8601 date'),
  body('pinned')
    .optional()
    .isBoolean()
    .withMessage('pinned must be a boolean'),
  body('status')
    .optional()
    .isIn(Object.values(AnnouncementStatus))
    .withMessage('Invalid status'),
];

export const updateAnnouncementValidation = [
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Content must be between 1 and 50000 characters'),
  body('priority')
    .optional()
    .isIn(Object.values(AnnouncementPriority))
    .withMessage('Invalid priority'),
  body('send_email')
    .optional()
    .isBoolean()
    .withMessage('send_email must be a boolean'),
  body('send_notification')
    .optional()
    .isBoolean()
    .withMessage('send_notification must be a boolean'),
  body('visible_from')
    .optional()
    .isISO8601()
    .withMessage('visible_from must be a valid ISO 8601 date'),
  body('visible_until')
    .optional()
    .isISO8601()
    .withMessage('visible_until must be a valid ISO 8601 date'),
  body('pinned')
    .optional()
    .isBoolean()
    .withMessage('pinned must be a boolean'),
  body('status')
    .optional()
    .isIn(Object.values(AnnouncementStatus))
    .withMessage('Invalid status'),
];

export const getAnnouncementsValidation = [
  query('type')
    .optional()
    .isIn(Object.values(AnnouncementType))
    .withMessage('Invalid type'),
  query('course_id')
    .optional()
    .isString()
    .withMessage('Course ID must be a string'),
  query('priority')
    .optional()
    .isIn(Object.values(AnnouncementPriority))
    .withMessage('Invalid priority'),
  query('status')
    .optional()
    .isIn(Object.values(AnnouncementStatus))
    .withMessage('Invalid status'),
  query('pinned')
    .optional()
    .isBoolean()
    .withMessage('pinned must be a boolean'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive number'),
];
