import { Router } from 'express';
import { CalendarController } from '../controllers/calendar.controller';
import { authenticate } from '../middleware/auth.firebase';
import {
  createEventValidator,
  updateEventValidator,
  eventIdValidator,
  courseIdParamValidator,
  dateRangeValidator,
  createBulkRecurringEventValidator,
} from '../validators/calendar.validator';
import { validate } from '../middleware/validate';

const router = Router();

// All calendar routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/calendar/events
 * @desc    Create a new calendar event
 * @access  Instructor (for their courses), Admin
 */
router.post(
  '/events',
  createEventValidator,
  validate,
  CalendarController.createEvent
);

/**
 * @route   POST /api/v1/calendar/events/bulk-recurring
 * @desc    Create bulk recurring events (e.g., weekly classes for a semester)
 * @access  Instructor (for their courses), Admin
 */
router.post(
  '/events/bulk-recurring',
  createBulkRecurringEventValidator,
  validate,
  CalendarController.createBulkRecurringEvents
);

/**
 * @route   GET /api/v1/calendar/my-events
 * @desc    Get all calendar events for the authenticated user
 * @access  All authenticated users
 */
router.get(
  '/my-events',
  dateRangeValidator,
  validate,
  CalendarController.getMyEvents
);

/**
 * @route   GET /api/v1/calendar/courses/:courseId/events
 * @desc    Get all events for a specific course
 * @access  Enrolled students, Course instructor, Admin
 */
router.get(
  '/courses/:courseId/events',
  courseIdParamValidator,
  dateRangeValidator,
  validate,
  CalendarController.getCourseEvents
);

/**
 * @route   GET /api/v1/calendar/events/:eventId
 * @desc    Get a single event by ID
 * @access  Enrolled students, Course instructor, Admin
 */
router.get(
  '/events/:eventId',
  eventIdValidator,
  validate,
  CalendarController.getEventById
);

/**
 * @route   PUT /api/v1/calendar/events/:eventId
 * @desc    Update a calendar event
 * @access  Course instructor, Admin
 */
router.put(
  '/events/:eventId',
  updateEventValidator,
  validate,
  CalendarController.updateEvent
);

/**
 * @route   DELETE /api/v1/calendar/events/:eventId
 * @desc    Delete a calendar event
 * @access  Course instructor, Admin
 */
router.delete(
  '/events/:eventId',
  eventIdValidator,
  validate,
  CalendarController.deleteEvent
);

export default router;
