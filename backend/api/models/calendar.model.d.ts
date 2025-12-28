import { CalendarEvent, CreateCalendarEventDTO, UpdateCalendarEventDTO, BulkRecurringEventDTO } from '../types/calendar.types';
export declare class CalendarEventModel {
    private static collection;
    /**
     * Create a new calendar event
     */
    static create(instructorId: string, instructorName: string, courseCode: string, courseTitle: string, data: CreateCalendarEventDTO): Promise<CalendarEvent>;
    /**
     * Find event by ID
     */
    static findById(eventId: string): Promise<CalendarEvent | null>;
    /**
     * Get all events for a course
     */
    static findByCourseId(courseId: string, startDate?: string, endDate?: string): Promise<CalendarEvent[]>;
    /**
     * Get all events for multiple courses (for students)
     */
    static findByCourseIds(courseIds: string[], startDate?: string, endDate?: string): Promise<CalendarEvent[]>;
    /**
     * Get all events for an instructor
     */
    static findByInstructorId(instructorId: string, startDate?: string, endDate?: string): Promise<CalendarEvent[]>;
    /**
     * Create bulk recurring events (e.g., weekly classes for a semester)
     */
    static createBulkRecurring(instructorId: string, instructorName: string, courseCode: string, courseTitle: string, data: BulkRecurringEventDTO): Promise<CalendarEvent[]>;
    /**
     * Update an event
     */
    static update(eventId: string, data: UpdateCalendarEventDTO): Promise<CalendarEvent>;
    /**
     * Delete an event
     */
    static delete(eventId: string): Promise<void>;
}
//# sourceMappingURL=calendar.model.d.ts.map