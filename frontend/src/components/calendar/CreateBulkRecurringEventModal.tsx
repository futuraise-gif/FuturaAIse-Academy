import { useState } from 'react';
import { CreateBulkRecurringEventData, EventType } from '@/types/calendar.types';
import { Course } from '@/types/course.types';

interface CreateBulkRecurringEventModalProps {
  courses: Course[];
  loading?: boolean;
  onClose: () => void;
  onCreate: (data: CreateBulkRecurringEventData) => void;
}

const DAYS_OF_WEEK = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

export default function CreateBulkRecurringEventModal({ courses, loading = false, onClose, onCreate }: CreateBulkRecurringEventModalProps) {
  const [formData, setFormData] = useState<CreateBulkRecurringEventData>({
    course_id: '',
    title: '',
    description: '',
    event_type: EventType.CLASS,
    days_of_week: [],
    start_time: '',
    end_time: '',
    start_date: '',
    duration_weeks: 12,
    location: '',
    meeting_url: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDayToggle = (dayValue: number) => {
    setFormData((prev) => {
      const days = prev.days_of_week.includes(dayValue)
        ? prev.days_of_week.filter((d) => d !== dayValue)
        : [...prev.days_of_week, dayValue].sort();
      return { ...prev, days_of_week: days };
    });

    if (errors.days_of_week) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.days_of_week;
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.course_id) newErrors.course_id = 'Please select a course';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.event_type) newErrors.event_type = 'Event type is required';
    if (formData.days_of_week.length === 0) newErrors.days_of_week = 'Please select at least one day of the week';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.duration_weeks || formData.duration_weeks < 1) newErrors.duration_weeks = 'Duration must be at least 1 week';

    if (formData.start_time && formData.end_time) {
      if (formData.end_time <= formData.start_time) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const cleanedData: CreateBulkRecurringEventData = {
      ...formData,
      description: formData.description?.trim() || undefined,
      location: formData.location?.trim() || undefined,
      meeting_url: formData.meeting_url?.trim() || undefined,
    };

    onCreate(cleanedData);
  };

  const estimatedEvents = formData.days_of_week.length * formData.duration_weeks;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Create Recurring Class Schedule</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Schedule weekly classes for the entire semester</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Course Selection */}
          <div>
            <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
              Course <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                Loading courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                No courses available. Please create a course first.
              </div>
            ) : (
              <select
                id="course_id"
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.course_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
            )}
            {errors.course_id && <p className="mt-1 text-xs text-red-500">{errors.course_id}</p>}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Weekly Lecture"
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Event Type */}
          <div>
            <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-1">
              Event Type <span className="text-red-500">*</span>
            </label>
            <select
              id="event_type"
              name="event_type"
              value={formData.event_type}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.event_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value={EventType.CLASS}>Class</option>
              <option value={EventType.OFFICE_HOURS}>Office Hours</option>
              <option value={EventType.OTHER}>Other</option>
            </select>
            {errors.event_type && <p className="mt-1 text-xs text-red-500">{errors.event_type}</p>}
          </div>

          {/* Days of Week */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days of Week <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    formData.days_of_week.includes(day.value)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {errors.days_of_week && <p className="mt-1 text-xs text-red-500">{errors.days_of_week}</p>}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.start_time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.start_time && <p className="mt-1 text-xs text-red-500">{errors.start_time}</p>}
            </div>

            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.end_time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end_time && <p className="mt-1 text-xs text-red-500">{errors.end_time}</p>}
            </div>
          </div>

          {/* Start Date & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>}
            </div>

            <div>
              <label htmlFor="duration_weeks" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (weeks) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="duration_weeks"
                name="duration_weeks"
                value={formData.duration_weeks}
                onChange={handleChange}
                min="1"
                max="52"
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.duration_weeks ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.duration_weeks && <p className="mt-1 text-xs text-red-500">{errors.duration_weeks}</p>}
            </div>
          </div>

          {/* Location & Meeting URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Room 101, Building A"
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="meeting_url" className="block text-sm font-medium text-gray-700 mb-1">
                Meeting URL
              </label>
              <input
                type="url"
                id="meeting_url"
                name="meeting_url"
                value={formData.meeting_url}
                onChange={handleChange}
                placeholder="https://zoom.us/j/..."
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Additional details about this recurring event..."
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Event Count Preview */}
          {estimatedEvents > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Estimated events to be created:</span> {estimatedEvents}
                {formData.days_of_week.length > 0 && ` (${formData.days_of_week.length} ${formData.days_of_week.length === 1 ? 'day' : 'days'} per week × ${formData.duration_weeks} weeks)`}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 active:bg-gray-400 font-medium text-sm transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 active:bg-indigo-800 font-medium text-sm transition-colors touch-manipulation"
            >
              Create {estimatedEvents} Event{estimatedEvents !== 1 ? 's' : ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
