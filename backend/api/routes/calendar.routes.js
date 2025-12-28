"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calendar_controller_1 = require("../controllers/calendar.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const calendar_validator_1 = require("../validators/calendar.validator");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// All calendar routes require authentication
router.use(auth_firebase_1.authenticate);
/**
 * @route   POST /api/v1/calendar/events
 * @desc    Create a new calendar event
 * @access  Instructor (for their courses), Admin
 */
router.post('/events', calendar_validator_1.createEventValidator, validate_1.validate, calendar_controller_1.CalendarController.createEvent);
/**
 * @route   POST /api/v1/calendar/events/bulk-recurring
 * @desc    Create bulk recurring events (e.g., weekly classes for a semester)
 * @access  Instructor (for their courses), Admin
 */
router.post('/events/bulk-recurring', calendar_validator_1.createBulkRecurringEventValidator, validate_1.validate, calendar_controller_1.CalendarController.createBulkRecurringEvents);
/**
 * @route   GET /api/v1/calendar/my-events
 * @desc    Get all calendar events for the authenticated user
 * @access  All authenticated users
 */
router.get('/my-events', calendar_validator_1.dateRangeValidator, validate_1.validate, calendar_controller_1.CalendarController.getMyEvents);
/**
 * @route   GET /api/v1/calendar/courses/:courseId/events
 * @desc    Get all events for a specific course
 * @access  Enrolled students, Course instructor, Admin
 */
router.get('/courses/:courseId/events', calendar_validator_1.courseIdParamValidator, calendar_validator_1.dateRangeValidator, validate_1.validate, calendar_controller_1.CalendarController.getCourseEvents);
/**
 * @route   GET /api/v1/calendar/events/:eventId
 * @desc    Get a single event by ID
 * @access  Enrolled students, Course instructor, Admin
 */
router.get('/events/:eventId', calendar_validator_1.eventIdValidator, validate_1.validate, calendar_controller_1.CalendarController.getEventById);
/**
 * @route   PUT /api/v1/calendar/events/:eventId
 * @desc    Update a calendar event
 * @access  Course instructor, Admin
 */
router.put('/events/:eventId', calendar_validator_1.updateEventValidator, validate_1.validate, calendar_controller_1.CalendarController.updateEvent);
/**
 * @route   DELETE /api/v1/calendar/events/:eventId
 * @desc    Delete a calendar event
 * @access  Course instructor, Admin
 */
router.delete('/events/:eventId', calendar_validator_1.eventIdValidator, validate_1.validate, calendar_controller_1.CalendarController.deleteEvent);
exports.default = router;
//# sourceMappingURL=calendar.routes.js.map