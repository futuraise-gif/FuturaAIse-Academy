"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarEventModel = void 0;
const firebase_1 = require("../config/firebase");
const calendar_types_1 = require("../types/calendar.types");
class CalendarEventModel {
    /**
     * Create a new calendar event
     */
    static async create(instructorId, instructorName, courseCode, courseTitle, data) {
        const eventRef = firebase_1.db.collection(this.collection).doc();
        const now = new Date().toISOString();
        const event = {
            id: eventRef.id,
            course_id: data.course_id,
            course_code: courseCode,
            course_title: courseTitle,
            instructor_id: instructorId,
            instructor_name: instructorName,
            title: data.title,
            event_type: data.event_type,
            start_time: data.start_time,
            end_time: data.end_time,
            recurrence: data.recurrence || calendar_types_1.EventRecurrence.NONE,
            created_at: now,
            updated_at: now,
        };
        // Only add optional fields if they have values
        if (data.description)
            event.description = data.description;
        if (data.location)
            event.location = data.location;
        if (data.meeting_url)
            event.meeting_url = data.meeting_url;
        if (data.recurrence_end_date)
            event.recurrence_end_date = data.recurrence_end_date;
        await eventRef.set(event);
        return event;
    }
    /**
     * Find event by ID
     */
    static async findById(eventId) {
        const doc = await firebase_1.db.collection(this.collection).doc(eventId).get();
        if (!doc.exists)
            return null;
        return doc.data();
    }
    /**
     * Get all events for a course
     */
    static async findByCourseId(courseId, startDate, endDate) {
        let query = firebase_1.db.collection(this.collection).where('course_id', '==', courseId);
        if (startDate) {
            query = query.where('start_time', '>=', startDate);
        }
        if (endDate) {
            query = query.where('start_time', '<=', endDate);
        }
        const snapshot = await query.orderBy('start_time', 'asc').get();
        return snapshot.docs.map((doc) => doc.data());
    }
    /**
     * Get all events for multiple courses (for students)
     */
    static async findByCourseIds(courseIds, startDate, endDate) {
        if (courseIds.length === 0)
            return [];
        // Firestore 'in' operator supports max 10 items
        const batches = [];
        for (let i = 0; i < courseIds.length; i += 10) {
            batches.push(courseIds.slice(i, i + 10));
        }
        const allEvents = [];
        for (const batch of batches) {
            let query = firebase_1.db.collection(this.collection).where('course_id', 'in', batch);
            if (startDate) {
                query = query.where('start_time', '>=', startDate);
            }
            if (endDate) {
                query = query.where('start_time', '<=', endDate);
            }
            const snapshot = await query.orderBy('start_time', 'asc').get();
            const events = snapshot.docs.map((doc) => doc.data());
            allEvents.push(...events);
        }
        // Sort all events by start_time
        return allEvents.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    /**
     * Get all events for an instructor
     */
    static async findByInstructorId(instructorId, startDate, endDate) {
        let query = firebase_1.db.collection(this.collection).where('instructor_id', '==', instructorId);
        if (startDate) {
            query = query.where('start_time', '>=', startDate);
        }
        if (endDate) {
            query = query.where('start_time', '<=', endDate);
        }
        const snapshot = await query.orderBy('start_time', 'asc').get();
        return snapshot.docs.map((doc) => doc.data());
    }
    /**
     * Create bulk recurring events (e.g., weekly classes for a semester)
     */
    static async createBulkRecurring(instructorId, instructorName, courseCode, courseTitle, data) {
        const events = [];
        const now = new Date().toISOString();
        // Parse the start date
        const startDate = new Date(data.start_date);
        // Generate events for each week
        for (let week = 0; week < data.duration_weeks; week++) {
            // For each selected day of the week
            for (const dayOfWeek of data.days_of_week) {
                // Calculate the date for this occurrence
                const eventDate = new Date(startDate);
                eventDate.setDate(startDate.getDate() + (week * 7));
                // Find the next occurrence of the selected day of week
                const currentDay = eventDate.getDay();
                const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
                eventDate.setDate(eventDate.getDate() + daysUntilTarget);
                // Skip if this date is before the start date
                if (eventDate < startDate)
                    continue;
                // Format the date as YYYY-MM-DD
                const dateStr = eventDate.toISOString().split('T')[0];
                // Combine date with time
                const startDateTime = `${dateStr}T${data.start_time}:00`;
                const endDateTime = `${dateStr}T${data.end_time}:00`;
                // Create the event
                const eventRef = firebase_1.db.collection(this.collection).doc();
                const event = {
                    id: eventRef.id,
                    course_id: data.course_id,
                    course_code: courseCode,
                    course_title: courseTitle,
                    instructor_id: instructorId,
                    instructor_name: instructorName,
                    title: data.title,
                    event_type: data.event_type,
                    start_time: startDateTime,
                    end_time: endDateTime,
                    recurrence: calendar_types_1.EventRecurrence.NONE, // Individual events, not recurring
                    created_at: now,
                    updated_at: now,
                };
                // Only add optional fields if they have values
                if (data.description)
                    event.description = data.description;
                if (data.location)
                    event.location = data.location;
                if (data.meeting_url)
                    event.meeting_url = data.meeting_url;
                await eventRef.set(event);
                events.push(event);
            }
        }
        return events;
    }
    /**
     * Update an event
     */
    static async update(eventId, data) {
        const eventRef = firebase_1.db.collection(this.collection).doc(eventId);
        const doc = await eventRef.get();
        if (!doc.exists) {
            throw new Error('Event not found');
        }
        const updateData = {
            ...data,
            updated_at: new Date().toISOString(),
        };
        await eventRef.update(updateData);
        const updated = await eventRef.get();
        return updated.data();
    }
    /**
     * Delete an event
     */
    static async delete(eventId) {
        await firebase_1.db.collection(this.collection).doc(eventId).delete();
    }
}
exports.CalendarEventModel = CalendarEventModel;
CalendarEventModel.collection = 'calendar_events';
//# sourceMappingURL=calendar.model.js.map