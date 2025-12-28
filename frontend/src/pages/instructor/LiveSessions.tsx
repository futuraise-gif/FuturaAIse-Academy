import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { liveSessionService } from '@/services/liveSessionService';
import { courseService } from '@/services/instructorService';
import {
  LiveSession,
  LiveSessionPlatform,
  LiveSessionStatus,
  CreateLiveSessionDTO,
} from '@/types/live-session.types';
import { Course } from '@/types/instructor.types';

export default function LiveSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateLiveSessionDTO>({
    course_id: '',
    title: '',
    description: '',
    platform: LiveSessionPlatform.JITSI,
    scheduled_start: '',
    scheduled_end: '',
    recording_enabled: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const coursesData = await courseService.getInstructorCourses();
      setCourses(coursesData);

      // Fetch sessions for all courses
      const allSessions: LiveSession[] = [];
      for (const course of coursesData) {
        const courseSessions = await liveSessionService.getCourseSessions(course.id);
        allSessions.push(...courseSessions);
      }
      setSessions(allSessions);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await liveSessionService.createSession(formData);
      setShowCreateModal(false);
      fetchData();
      resetForm();
      alert('Live session created successfully!');
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session');
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await liveSessionService.startSession(sessionId);
      navigate(`/live/${sessionId}`);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start session');
    }
  };

  const handleEndSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to end this session?')) return;
    try {
      await liveSessionService.endSession(sessionId);
      fetchData();
    } catch (error) {
      console.error('Failed to end session:', error);
      alert('Failed to end session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await liveSessionService.deleteSession(sessionId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session');
    }
  };

  const resetForm = () => {
    setFormData({
      course_id: '',
      title: '',
      description: '',
      platform: LiveSessionPlatform.JITSI,
      scheduled_start: '',
      scheduled_end: '',
      recording_enabled: false,
    });
  };

  const getStatusBadge = (status: LiveSessionStatus) => {
    const colors = {
      [LiveSessionStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
      [LiveSessionStatus.LIVE]: 'bg-green-100 text-green-800 animate-pulse',
      [LiveSessionStatus.ENDED]: 'bg-gray-100 text-gray-800',
      [LiveSessionStatus.CANCELLED]: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading sessions...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Sessions</h1>
            <p className="text-gray-600 mt-1">Manage your live video classes</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            📹 Schedule Live Class
          </button>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No live sessions yet</h3>
            <p className="text-gray-600 mb-6">Schedule your first live class to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Schedule Live Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusBadge(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{session.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Course</p>
                        <p className="font-semibold text-gray-900">{session.course_title}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Platform</p>
                        <p className="font-semibold text-gray-900 capitalize">{session.platform}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Start Time</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(session.scheduled_start).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Attendees</p>
                        <p className="font-semibold text-gray-900">{session.attendees.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {session.status === LiveSessionStatus.SCHEDULED && (
                      <button
                        onClick={() => handleStartSession(session.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700"
                      >
                        Start Class
                      </button>
                    )}
                    {session.status === LiveSessionStatus.LIVE && (
                      <>
                        <button
                          onClick={() => navigate(`/live/${session.id}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
                        >
                          Join Class
                        </button>
                        <button
                          onClick={() => handleEndSession(session.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
                        >
                          End Class
                        </button>
                      </>
                    )}
                    {session.status === LiveSessionStatus.SCHEDULED && (
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Session Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Schedule Live Class</h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateSession} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                    <select
                      required
                      value={formData.course_id}
                      onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Introduction to AI - Week 1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="What will be covered in this session?"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.scheduled_start}
                        onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.scheduled_end}
                        onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value as LiveSessionPlatform })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value={LiveSessionPlatform.JITSI}>Jitsi Meet (Built-in)</option>
                      <option value={LiveSessionPlatform.ZOOM}>Zoom</option>
                      <option value={LiveSessionPlatform.GOOGLE_MEET}>Google Meet</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.recording_enabled}
                      onChange={(e) => setFormData({ ...formData, recording_enabled: e.target.checked })}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Enable recording</label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Schedule Session
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
