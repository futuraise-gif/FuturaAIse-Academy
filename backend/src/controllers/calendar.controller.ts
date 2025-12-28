import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
import { CalendarEventModel } from '../models/calendar.model';
import { CourseModel } from '../models/course.model';
import { UserModel } from '../models/user.firebase';
import { CreateCalendarEventDTO, UpdateCalendarEventDTO, BulkRecurringEventDTO } from '../types/calendar.types';
import { UserRole } from '../types';

export class CalendarController {
  /**
   * Create a new calendar event (Instructors & Admins only)
   */
  static async createEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const data: CreateCalendarEventDTO = req.body;

      // Get course details
      const course = await CourseModel.findById(data.course_id);
      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Check authorization
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.SUPER_ADMIN &&
        course.instructor_id !== user.userId
      ) {
        res.status(403).json({ error: 'You are not authorized to create events for this course' });
        return;
      }

      // Get user details
      const userDetails = await UserModel.findById(user.userId);
      if (!userDetails) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const event = await CalendarEventModel.create(
        user.userId!,
        `${userDetails.first_name} ${userDetails.last_name}`,
        course.code || 'NO-CODE',
        course.title,
        data
      );

      res.status(201).json({
        message: 'Calendar event created successfully',
        event,
      });
    } catch (error: any) {
      console.error('Create calendar event error:', error);
      res.status(500).json({ error: 'Failed to create calendar event' });
    }
  }

  /**
   * Create bulk recurring events (Instructors & Admins only)
   * For scheduling weekly classes throughout a semester
   */
  static async createBulkRecurringEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const data: BulkRecurringEventDTO = req.body;

      // Validate input
      if (!data.days_of_week || data.days_of_week.length === 0) {
        res.status(400).json({ error: 'At least one day of the week must be selected' });
        return;
      }

      if (data.duration_weeks < 1 || data.duration_weeks > 52) {
        res.status(400).json({ error: 'Duration must be between 1 and 52 weeks' });
        return;
      }

      // Get course details
      const course = await CourseModel.findById(data.course_id);
      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Check authorization
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.SUPER_ADMIN &&
        course.instructor_id !== user.userId
      ) {
        res.status(403).json({ error: 'You are not authorized to create events for this course' });
        return;
      }

      // Get user details
      const userDetails = await UserModel.findById(user.userId);
      if (!userDetails) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const events = await CalendarEventModel.createBulkRecurring(
        user.userId!,
        `${userDetails.first_name} ${userDetails.last_name}`,
        course.code || 'NO-CODE',
        course.title,
        data
      );

      res.status(201).json({
        message: `Successfully created ${events.length} calendar events`,
        events,
        count: events.length,
      });
    } catch (error: any) {
      console.error('Create bulk recurring events error:', error);
      res.status(500).json({ error: 'Failed to create bulk recurring events' });
    }
  }

  /**
   * Get calendar events for the authenticated user
   * - Students: Events from their enrolled courses
   * - Instructors: Events from their courses
   * - Admins: All events
   */
  static async getMyEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { start_date, end_date } = req.query;

      let events;

      if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
        // Admins see all events
        const allCourses = await CourseModel.findAll({});
        const courseIds = allCourses.map(course => course.id);
        events = await CalendarEventModel.findByCourseIds(
          courseIds,
          start_date as string | undefined,
          end_date as string | undefined
        );
      } else if (user.role === UserRole.INSTRUCTOR) {
        // Instructors see events from their courses
        events = await CalendarEventModel.findByInstructorId(
          user.userId!,
          start_date as string | undefined,
          end_date as string | undefined
        );
      } else {
        // Students see events from enrolled courses
        const enrolledCourses = await CourseModel.findEnrolledCourses(user.userId!);
        const courseIds = enrolledCourses.map(course => course.id);
        events = await CalendarEventModel.findByCourseIds(
          courseIds,
          start_date as string | undefined,
          end_date as string | undefined
        );
      }

      res.json({
        events,
        count: events.length,
      });
    } catch (error: any) {
      console.error('Get my events error:', error);
      res.status(500).json({ error: 'Failed to get calendar events' });
    }
  }

  /**
   * Get calendar events for a specific course
   */
  static async getCourseEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { courseId } = req.params;
      const { start_date, end_date } = req.query;

      // Check if user has access to this course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Check enrollment or authorization
      const isEnrolled = await CourseModel.isUserEnrolled(courseId, user.userId!);
      const isInstructor = course.instructor_id === user.userId;
      const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

      if (!isEnrolled && !isInstructor && !isAdmin) {
        res.status(403).json({ error: 'You do not have access to this course' });
        return;
      }

      const events = await CalendarEventModel.findByCourseId(
        courseId,
        start_date as string | undefined,
        end_date as string | undefined
      );

      res.json({
        events,
        count: events.length,
      });
    } catch (error: any) {
      console.error('Get course events error:', error);
      res.status(500).json({ error: 'Failed to get course events' });
    }
  }

  /**
   * Get a single event by ID
   */
  static async getEventById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { eventId } = req.params;

      const event = await CalendarEventModel.findById(eventId);
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      // Check if user has access to the event's course
      const isEnrolled = await CourseModel.isUserEnrolled(event.course_id, user.userId!);
      const isInstructor = event.instructor_id === user.userId;
      const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

      if (!isEnrolled && !isInstructor && !isAdmin) {
        res.status(403).json({ error: 'You do not have access to this event' });
        return;
      }

      res.json({ event });
    } catch (error: any) {
      console.error('Get event by ID error:', error);
      res.status(500).json({ error: 'Failed to get event' });
    }
  }

  /**
   * Update a calendar event
   */
  static async updateEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { eventId } = req.params;
      const data: UpdateCalendarEventDTO = req.body;

      const event = await CalendarEventModel.findById(eventId);
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      // Check authorization
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.SUPER_ADMIN &&
        event.instructor_id !== user.userId
      ) {
        res.status(403).json({ error: 'You are not authorized to update this event' });
        return;
      }

      const updatedEvent = await CalendarEventModel.update(eventId, data);

      res.json({
        message: 'Event updated successfully',
        event: updatedEvent,
      });
    } catch (error: any) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  }

  /**
   * Delete a calendar event
   */
  static async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { eventId } = req.params;

      const event = await CalendarEventModel.findById(eventId);
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      // Check authorization
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.SUPER_ADMIN &&
        event.instructor_id !== user.userId
      ) {
        res.status(403).json({ error: 'You are not authorized to delete this event' });
        return;
      }

      await CalendarEventModel.delete(eventId);

      res.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  }
}
