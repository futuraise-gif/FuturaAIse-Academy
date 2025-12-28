import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore.firebase';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

interface Course {
  id: string;
  title: string;
  code: string;
  enrolled_count?: number;
}

interface WebRTCClass {
  id: string;
  course_id: string;
  course_name: string;
  room_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'ended';
  created_at: string;
}

export default function InstructorBetaTesting() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [courses, setCourses] = useState<Course[]>([]);
  const [webrtcClasses, setWebrtcClasses] = useState<WebRTCClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [selectedCourse, setSelectedCourse] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    fetchCourses();
    fetchWebRTCClasses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data?.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchWebRTCClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/webrtc-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWebrtcClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching WebRTC classes:', error);
      setWebrtcClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const scheduledAt = `${scheduledDate}T${scheduledTime}:00`;

      await axios.post(
        `${API_URL}/webrtc-classes`,
        {
          course_id: selectedCourse,
          title,
          description,
          scheduled_at: scheduledAt,
          duration_minutes: duration,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('WebRTC class created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchWebRTCClasses();
    } catch (error: any) {
      console.error('Error creating WebRTC class:', error);
      alert(error.response?.data?.error || 'Failed to create class');
    }
  };

  const handleStartClass = async (classId: string, roomId: string) => {
    try {
      await axios.patch(
        `${API_URL}/webrtc-classes/${classId}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Navigate to WebRTC room
      navigate(`/webrtc-test/${roomId}`);
    } catch (error: any) {
      console.error('Error starting class:', error);
      alert(error.response?.data?.error || 'Failed to start class');
    }
  };

  const handleJoinClass = (roomId: string) => {
    navigate(`/webrtc-test/${roomId}`);
  };

  const handleEndClass = async (classId: string) => {
    if (!confirm('Are you sure you want to end this class?')) return;

    try {
      await axios.patch(
        `${API_URL}/webrtc-classes/${classId}/end`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Class ended successfully');
      fetchWebRTCClasses();
    } catch (error: any) {
      console.error('Error ending class:', error);
      alert(error.response?.data?.error || 'Failed to end class');
    }
  };

  const resetForm = () => {
    setSelectedCourse('');
    setTitle('');
    setDescription('');
    setScheduledDate('');
    setScheduledTime('');
    setDuration(60);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800',
      live: 'bg-green-100 text-green-800 animate-pulse',
      ended: 'bg-gray-100 text-gray-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const copyRoomLink = (roomId: string) => {
    const link = `${window.location.origin}/webrtc-test/${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Room link copied to clipboard!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">WebRTC Beta Testing</h1>
            <p className="text-gray-600 mt-2">
              Create and manage WebRTC live classes for your courses
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-xl">🧪</span>
              <span className="font-semibold">Beta</span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              + Create WebRTC Class
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">About WebRTC Classes</h3>
              <p className="text-sm text-blue-800">
                WebRTC classes are custom video conferencing sessions. Students enrolled in the selected course
                will automatically see these classes in their Live Classes page and can join when the class is live.
              </p>
            </div>
          </div>
        </div>

        {/* Classes List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your WebRTC Classes</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading classes...</div>
            ) : webrtcClasses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No WebRTC classes created yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Create your first class
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {webrtcClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{cls.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(cls.status)}`}>
                            {cls.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">📚 {cls.course_name}</p>

                        {cls.description && (
                          <p className="text-sm text-gray-500 mb-3">{cls.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>🕐 {formatDate(cls.scheduled_at)}</span>
                          <span>⏱️ {cls.duration_minutes} min</span>
                          <span>🆔 Room: {cls.room_id}</span>
                        </div>

                        <button
                          onClick={() => copyRoomLink(cls.room_id)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          📋 Copy Room Link
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {cls.status === 'scheduled' && (
                          <button
                            onClick={() => handleStartClass(cls.id, cls.room_id)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                          >
                            Start Class
                          </button>
                        )}

                        {cls.status === 'live' && (
                          <>
                            <button
                              onClick={() => handleJoinClass(cls.room_id)}
                              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                            >
                              Join Class
                            </button>
                            <button
                              onClick={() => handleEndClass(cls.id)}
                              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                            >
                              End Class
                            </button>
                          </>
                        )}

                        {cls.status === 'ended' && (
                          <span className="px-6 py-2 bg-gray-100 text-gray-500 rounded-lg text-center text-sm">
                            Ended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Class Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">Create WebRTC Class</h2>
              </div>

              <form onSubmit={handleCreateClass} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course *
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select a course --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.title} ({course.enrolled_count || 0} students)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g., Introduction to React Hooks"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Brief description of what will be covered..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    required
                    min={15}
                    max={240}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Create Class
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
