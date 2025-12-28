"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnouncementsValidation = exports.updateAnnouncementValidation = exports.createAnnouncementValidation = void 0;
const express_validator_1 = require("express-validator");
const announcement_types_1 = require("../types/announcement.types");
exports.createAnnouncementValidation = [
    (0, express_validator_1.body)('type')
        .notEmpty()
        .isIn(Object.values(announcement_types_1.AnnouncementType))
        .withMessage('Type must be either course or global'),
    (0, express_validator_1.body)('course_id')
        .optional()
        .isString()
        .withMessage('Course ID must be a string'),
    (0, express_validator_1.body)('title')
        .notEmpty()
        .isString()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title is required and must be between 1 and 200 characters'),
    (0, express_validator_1.body)('content')
        .notEmpty()
        .isString()
        .trim()
        .isLength({ min: 1, max: 50000 })
        .withMessage('Content is required and must be between 1 and 50000 characters'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(Object.values(announcement_types_1.AnnouncementPriority))
        .withMessage('Invalid priority'),
    (0, express_validator_1.body)('send_email')
        .optional()
        .isBoolean()
        .withMessage('send_email must be a boolean'),
    (0, express_validator_1.body)('send_notification')
        .optional()
        .isBoolean()
        .withMessage('send_notification must be a boolean'),
    (0, express_validator_1.body)('visible_from')
        .optional()
        .isISO8601()
        .withMessage('visible_from must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('visible_until')
        .optional()
        .isISO8601()
        .withMessage('visible_until must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('pinned')
        .optional()
        .isBoolean()
        .withMessage('pinned must be a boolean'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(Object.values(announcement_types_1.AnnouncementStatus))
        .withMessage('Invalid status'),
];
exports.updateAnnouncementValidation = [
    (0, express_validator_1.body)('title')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('content')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 50000 })
        .withMessage('Content must be between 1 and 50000 characters'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(Object.values(announcement_types_1.AnnouncementPriority))
        .withMessage('Invalid priority'),
    (0, express_validator_1.body)('send_email')
        .optional()
        .isBoolean()
        .withMessage('send_email must be a boolean'),
    (0, express_validator_1.body)('send_notification')
        .optional()
        .isBoolean()
        .withMessage('send_notification must be a boolean'),
    (0, express_validator_1.body)('visible_from')
        .optional()
        .isISO8601()
        .withMessage('visible_from must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('visible_until')
        .optional()
        .isISO8601()
        .withMessage('visible_until must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('pinned')
        .optional()
        .isBoolean()
        .withMessage('pinned must be a boolean'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(Object.values(announcement_types_1.AnnouncementStatus))
        .withMessage('Invalid status'),
];
exports.getAnnouncementsValidation = [
    (0, express_validator_1.query)('type')
        .optional()
        .isIn(Object.values(announcement_types_1.AnnouncementType))
        .withMessage('Invalid type'),
    (0, express_validator_1.query)('course_id')
        .optional()
        .isString()
        .withMessage('Course ID must be a string'),
    (0, express_validator_1.query)('priority')
        .optional()
        .isIn(Object.values(announcement_types_1.AnnouncementPriority))
        .withMessage('Invalid priority'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(Object.values(announcement_types_1.AnnouncementStatus))
        .withMessage('Invalid status'),
    (0, express_validator_1.query)('pinned')
        .optional()
        .isBoolean()
        .withMessage('pinned must be a boolean'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a positive number'),
];
//# sourceMappingURL=announcement.validator.js.map