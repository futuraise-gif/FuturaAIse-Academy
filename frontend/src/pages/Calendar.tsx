import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore.firebase';
import { UserRole } from '@/types';
import { calendarService } from '@/services/calendarService';
import { courseService } from '@/services/courseService';
import { CalendarEvent, EventType, CreateCalendarEventData, CreateBulkRecurringEventData } from '@/types/calendar.types';
import { Course } from '@/types/course.types';
import CreateEventModal from '@/components/calendar/CreateEventModal';
import CreateBulkRecurringEventModal from '@/components/calendar/CreateBulkRecurringEventModal';

export default function Calendar() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'month' | 'list'>('month');

  const isInstructor = user?.role === UserRole.INSTRUCTOR;
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  useEffect(() => {
    if (isInstructor || isAdmin) {
      fetchCourses();
    }
  }, [isInstructor, isAdmin]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { events: fetchedEvents } = await calendarService.getMyEvents({
        start_date: startOfMonth.toISOString(),
        end_date: endOfMonth.toISOString(),
      });

      setEvents(fetchedEvents);
    } catch (error: any) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      console.log('Fetching courses for calendar...');
      console.log('User role:', user?.role);
      console.log('User ID:', user?.id);

      const response = await courseService.getAllCourses();
      console.log('Full API response:', response);
      console.log('Fetched courses:', response.courses);
      console.log('Number of courses:', response.courses?.length || 0);

      setCourses(response.courses || []);
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoadingCourses(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];

    return events.filter((event) => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getEventTypeColor = (type: EventType) => {
    const colors = {
      [EventType.CLASS]: 'bg-blue-100 text-blue-800 border-blue-300',
      [EventType.EXAM]: 'bg-red-100 text-red-800 border-red-300',
      [EventType.ASSIGNMENT]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [EventType.OFFICE_HOURS]: 'bg-green-100 text-green-800 border-green-300',
      [EventType.OTHER]: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[type];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const todayDate = new Date();
  const isToday = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getDate() === todayDate.getDate() &&
      date.getMonth() === todayDate.getMonth() &&
      date.getFullYear() === todayDate.getFullYear()
    );
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleCreateEvent = async (eventData: CreateCalendarEventData) => {
    try {
      await calendarService.createEvent(eventData);
      setShowCreateModal(false);
      fetchEvents();
      alert('Event created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create event');
    }
  };

  const handleCreateBulkRecurringEvents = async (eventData: CreateBulkRecurringEventData) => {
    try {
      const result = await calendarService.createBulkRecurringEvents(eventData);
      setShowBulkCreateModal(false);
      fetchEvents();
      alert(`Successfully created ${result.count} events!`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create bulk recurring events');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await calendarService.deleteEvent(eventId);
      fetchEvents();
      alert('Event deleted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const sortedEvents = [...events].sort((a, b) =>
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendar</h2>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* View Toggle */}
            <div className="flex rounded-md shadow-sm flex-1 sm:flex-initial">
              <button
                onClick={() => setView('month')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-l-md transition-colors ${
                  view === 'month'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-r-md transition-colors ${
                  view === 'list'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                List
              </button>
            </div>

            {/* Create Event Dropdown */}
            {(isInstructor || isAdmin) && (
              <div className="relative flex-1 sm:flex-initial">
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="w-full px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 active:bg-indigo-800 font-medium text-xs sm:text-sm transition-colors touch-manipulation flex items-center justify-center gap-2"
                >
                  <span className="text-lg">+</span>
                  <span>Create Event</span>
                  <svg className={`w-4 h-4 transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showCreateMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowCreateMenu(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowCreateModal(true);
                            setShowCreateMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium">Single Event</div>
                          <div className="text-xs text-gray-500 mt-1">Create a one-time event</div>
                        </button>
                        <button
                          onClick={() => {
                            setShowBulkCreateModal(true);
                            setShowCreateMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-100"
                        >
                          <div className="font-medium">Recurring Schedule</div>
                          <div className="text-xs text-gray-500 mt-1">Schedule weekly classes for the semester</div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Loading calendar...</div>
          </div>
        ) : view === 'month' ? (
          <>
            {/* Month Navigation */}
            <div className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-lg shadow">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors touch-manipulation"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{monthName}</h3>

              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors touch-manipulation"
                aria-label="Next month"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 auto-rows-fr">
                {getDaysInMonth().map((date, index) => {
                  const dayEvents = getEventsForDay(date);
                  const today = isToday(date);

                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] sm:min-h-[100px] md:min-h-[120px] border-b border-r border-gray-200 p-1 sm:p-2 ${
                        !date ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                      } ${today ? 'bg-blue-50' : ''}`}
                    >
                      {date && (
                        <>
                          <div
                            className={`text-xs sm:text-sm font-medium mb-1 ${
                              today
                                ? 'bg-indigo-600 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center'
                                : 'text-gray-900'
                            }`}
                          >
                            {date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity ${getEventTypeColor(
                                  event.event_type
                                )}`}
                                title={`${event.title} - ${formatTime(event.start_time)}`}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="hidden sm:block text-xs opacity-75">
                                  {formatTime(event.start_time)}
                                </div>
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-600 font-medium pl-1">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* List View */
          <div className="space-y-3 sm:space-y-4">
            {sortedEvents.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
                <p className="text-gray-600 text-sm sm:text-base">No events scheduled for this month.</p>
                {(isInstructor || isAdmin) && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Create Your First Event
                  </button>
                )}
              </div>
            ) : (
              sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className={`bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 ${getEventTypeColor(
                    event.event_type
                  )}`}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {event.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(
                            event.event_type
                          )}`}
                        >
                          {event.event_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Course:</span>
                          <span className="truncate">
                            {event.course_code} - {event.course_title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Time:</span>
                          <span>
                            {new Date(event.start_time).toLocaleDateString()} at{' '}
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Location:</span>
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.meeting_url && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Meeting:</span>
                            <a
                              href={event.meeting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline truncate"
                            >
                              Join Online
                            </a>
                          </div>
                        )}
                        {event.description && (
                          <div className="mt-2">
                            <span className="font-medium">Description:</span>
                            <p className="text-gray-600 mt-1">{event.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {(isInstructor || isAdmin) && event.instructor_id === user?.id && (
                      <div className="flex sm:flex-col gap-2">
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="flex-1 sm:flex-initial px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 active:bg-red-800 font-medium text-xs sm:text-sm transition-colors touch-manipulation"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          courses={courses}
          loading={loadingCourses}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateEvent}
        />
      )}

      {/* Create Bulk Recurring Events Modal */}
      {showBulkCreateModal && (
        <CreateBulkRecurringEventModal
          courses={courses}
          loading={loadingCourses}
          onClose={() => setShowBulkCreateModal(false)}
          onCreate={handleCreateBulkRecurringEvents}
        />
      )}
    </DashboardLayout>
  );
}
