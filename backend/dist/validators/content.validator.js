"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderContentValidator = exports.updateContentAccessValidator = exports.updateContentItemValidator = exports.createContentItemValidator = exports.contentIdValidator = exports.courseIdValidator = void 0;
const express_validator_1 = require("express-validator");
const content_types_1 = require("../types/content.types");
exports.courseIdValidator = [
    (0, express_validator_1.param)('courseId').trim().notEmpty().withMessage('Course ID is required'),
];
exports.contentIdValidator = [
    (0, express_validator_1.param)('contentId').trim().notEmpty().withMessage('Content ID is required'),
];
exports.createContentItemValidator = [
    (0, express_validator_1.body)('course_id').trim().notEmpty().withMessage('Course ID is required'),
    (0, express_validator_1.body)('type').isIn(Object.values(content_types_1.ContentType)).withMessage('Invalid content type'),
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 5000 })
        .withMessage('Description must not exceed 5000 characters'),
    (0, express_validator_1.body)('parent_id').optional().trim(),
    (0, express_validator_1.body)('external_url')
        .optional()
        .isURL()
        .withMessage('External URL must be a valid URL'),
    (0, express_validator_1.body)('text_content')
        .optional()
        .isLength({ max: 50000 })
        .withMessage('Text content must not exceed 50000 characters'),
    (0, express_validator_1.body)('linked_item_id').optional().trim(),
    (0, express_validator_1.body)('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    (0, express_validator_1.body)('indent_level')
        .optional()
        .isInt({ min: 0, max: 10 })
        .withMessage('Indent level must be between 0 and 10'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(Object.values(content_types_1.ContentStatus))
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('available_from').optional().isISO8601().withMessage('Invalid date format'),
    (0, express_validator_1.body)('available_until').optional().isISO8601().withMessage('Invalid date format'),
    (0, express_validator_1.body)('visible_to_students').optional().isBoolean().withMessage('Must be a boolean'),
    (0, express_validator_1.body)('require_previous_completion').optional().isBoolean().withMessage('Must be a boolean'),
    (0, express_validator_1.body)('prerequisite_content_ids')
        .optional()
        .isArray()
        .withMessage('Prerequisite content IDs must be an array'),
    (0, express_validator_1.body)('is_graded').optional().isBoolean().withMessage('Must be a boolean'),
    (0, express_validator_1.body)('points')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Points must be a non-negative integer'),
];
exports.updateContentItemValidator = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 5000 })
        .withMessage('Description must not exceed 5000 characters'),
    (0, express_validator_1.body)('external_url')
        .optional()
        .isURL()
        .withMessage('External URL must be a valid URL'),
    (0, express_validator_1.body)('text_content')
        .optional()
        .isLength({ max: 50000 })
        .withMessage('Text content must not exceed 50000 characters'),
    (0, express_validator_1.body)('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    (0, express_validator_1.body)('indent_level')
        .optional()
        .isInt({ min: 0, max: 10 })
        .withMessage('Indent level must be between 0 and 10'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(Object.values(content_types_1.ContentStatus))
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('available_from').optional().isISO8601().withMessage('Invalid date format'),
    (0, express_validator_1.body)('available_until').optional().isISO8601().withMessage('Invalid date format'),
    (0, express_validator_1.body)('visible_to_students').optional().isBoolean().withMessage('Must be a boolean'),
    (0, express_validator_1.body)('require_previous_completion').optional().isBoolean().withMessage('Must be a boolean'),
    (0, express_validator_1.body)('prerequisite_content_ids')
        .optional()
        .isArray()
        .withMessage('Prerequisite content IDs must be an array'),
    (0, express_validator_1.body)('is_graded').optional().isBoolean().withMessage('Must be a boolean'),
    (0, express_validator_1.body)('points')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Points must be a non-negative integer'),
    (0, express_validator_1.body)('parent_id').optional().trim(),
];
exports.updateContentAccessValidator = [
    (0, express_validator_1.body)('is_completed').optional().isBoolean().withMessage('Must be a boolean'),
    (0, express_validator_1.body)('completion_percentage')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Completion percentage must be between 0 and 100'),
    (0, express_validator_1.body)('total_time_spent')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Total time spent must be a non-negative integer'),
    (0, express_validator_1.body)('video_progress')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Video progress must be a non-negative integer'),
];
exports.reorderContentValidator = [
    (0, express_validator_1.body)('content_ids')
        .isArray()
        .withMessage('Content IDs must be an array')
        .notEmpty()
        .withMessage('Content IDs array cannot be empty'),
    (0, express_validator_1.body)('new_orders')
        .isArray()
        .withMessage('New orders must be an array')
        .notEmpty()
        .withMessage('New orders array cannot be empty'),
];
//# sourceMappingURL=content.validator.js.map