"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBulkRecurringEventValidator = exports.dateRangeValidator = exports.courseIdParamValidator = exports.eventIdValidator = exports.updateEventValidator = exports.createEventValidator = void 0;
const express_validator_1 = require("express-validator");
const calendar_types_1 = require("../types/calendar.types");
exports.createEventValidator = [
    (0, express_validator_1.body)('course_id')
        .notEmpty()
        .withMessage('Course ID is required')
        .isString()
        .withMessage('Course ID must be a string'),
    (0, express_validator_1.body)('title')
        .notEmpty()
        .withMessage('Title is required')
        .isString()
        .withMessage('Title must be a string')
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('event_type')
        .notEmpty()
        .withMessage('Event type is required')
        .isIn(Object.values(calendar_types_1.EventType))
        .withMessage(`Event type must be one of: ${Object.values(calendar_types_1.EventType).join(', ')}`),
    (0, express_validator_1.body)('start_time')
        .notEmpty()
        .withMessage('Start time is required')
        .isISO8601()
        .withMessage('Start time must be a valid ISO 8601 datetime'),
    (0, express_validator_1.body)('end_time')
        .notEmpty()
        .withMessage('End time is required')
        .isISO8601()
        .withMessage('End time must be a valid ISO 8601 datetime')
        .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.start_time)) {
            throw new Error('End time must be after start time');
        }
        return true;
    }),
    (0, express_validator_1.body)('location')
        .optional()
        .isString()
        .withMessage('Location must be a string'),
    (0, express_validator_1.body)('meeting_url')
        .optional()
        .isURL()
        .withMessage('Meeting URL must be a valid URL'),
    (0, express_validator_1.body)('recurrence')
        .optional()
        .isIn(Object.values(calendar_types_1.EventRecurrence))
        .withMessage(`Recurrence must be one of: ${Object.values(calendar_types_1.EventRecurrence).join(', ')}`),
    (0, express_validator_1.body)('recurrence_end_date')
        .optional()
        .isISO8601()
        .withMessage('Recurrence end date must be a valid ISO 8601 datetime'),
];
exports.updateEventValidator = [
    (0, express_validator_1.param)('eventId')
        .notEmpty()
        .withMessage('Event ID is required')
        .isString()
        .withMessage('Event ID must be a string'),
    (0, express_validator_1.body)('title')
        .optional()
        .isString()
        .withMessage('Title must be a string')
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('event_type')
        .optional()
        .isIn(Object.values(calendar_types_1.EventType))
        .withMessage(`Event type must be one of: ${Object.values(calendar_types_1.EventType).join(', ')}`),
    (0, express_validator_1.body)('start_time')
        .optional()
        .isISO8601()
        .withMessage('Start time must be a valid ISO 8601 datetime'),
    (0, express_validator_1.body)('end_time')
        .optional()
        .isISO8601()
        .withMessage('End time must be a valid ISO 8601 datetime'),
    (0, express_validator_1.body)('location')
        .optional()
        .isString()
        .withMessage('Location must be a string'),
    (0, express_validator_1.body)('meeting_url')
        .optional()
        .isURL()
        .withMessage('Meeting URL must be a valid URL'),
    (0, express_validator_1.body)('recurrence')
        .optional()
        .isIn(Object.values(calendar_types_1.EventRecurrence))
        .withMessage(`Recurrence must be one of: ${Object.values(calendar_types_1.EventRecurrence).join(', ')}`),
    (0, express_validator_1.body)('recurrence_end_date')
        .optional()
        .isISO8601()
        .withMessage('Recurrence end date must be a valid ISO 8601 datetime'),
];
exports.eventIdValidator = [
    (0, express_validator_1.param)('eventId')
        .notEmpty()
        .withMessage('Event ID is required')
        .isString()
        .withMessage('Event ID must be a string'),
];
exports.courseIdParamValidator = [
    (0, express_validator_1.param)('courseId')
        .notEmpty()
        .withMessage('Course ID is required')
        .isString()
        .withMessage('Course ID must be a string'),
];
exports.dateRangeValidator = [
    (0, express_validator_1.query)('start_date')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 datetime'),
    (0, express_validator_1.query)('end_date')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 datetime'),
];
exports.createBulkRecurringEventValidator = [
    (0, express_validator_1.body)('course_id')
        .notEmpty()
        .withMessage('Course ID is required')
        .isString()
        .withMessage('Course ID must be a string'),
    (0, express_validator_1.body)('title')
        .notEmpty()
        .withMessage('Title is required')
        .isString()
        .withMessage('Title must be a string')
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('event_type')
        .notEmpty()
        .withMessage('Event type is required')
        .isIn(Object.values(calendar_types_1.EventType))
        .withMessage(`Event type must be one of: ${Object.values(calendar_types_1.EventType).join(', ')}`),
    (0, express_validator_1.body)('days_of_week')
        .notEmpty()
        .withMessage('Days of week is required')
        .isArray({ min: 1, max: 7 })
        .withMessage('Days of week must be an array with 1-7 elements')
        .custom((value) => {
        if (!value.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)) {
            throw new Error('Each day must be an integer between 0 (Sunday) and 6 (Saturday)');
        }
        return true;
    }),
    (0, express_validator_1.body)('start_time')
        .notEmpty()
        .withMessage('Start time is required')
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:mm format (e.g., 09:00)'),
    (0, express_validator_1.body)('end_time')
        .notEmpty()
        .withMessage('End time is required')
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:mm format (e.g., 10:30)'),
    (0, express_validator_1.body)('start_date')
        .notEmpty()
        .withMessage('Start date is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Start date must be in YYYY-MM-DD format'),
    (0, express_validator_1.body)('duration_weeks')
        .notEmpty()
        .withMessage('Duration in weeks is required')
        .isInt({ min: 1, max: 52 })
        .withMessage('Duration must be between 1 and 52 weeks'),
    (0, express_validator_1.body)('location')
        .optional()
        .isString()
        .withMessage('Location must be a string'),
    (0, express_validator_1.body)('meeting_url')
        .optional()
        .isURL()
        .withMessage('Meeting URL must be a valid URL'),
];
//# sourceMappingURL=calendar.validator.js.map