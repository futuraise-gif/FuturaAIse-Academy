import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore.firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

interface LiveClass {
  id: string;
  course_id: string;
  course_name?: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  room_id?: string;
  room_code?: string;
  recording_url?: string;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
}

export default function InstructorLiveClasses() {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();

  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  console.log('InstructorLiveClasses rendered', { showCreateModal, coursesCount: courses.length });

  // Form state
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: 60,
  });

  useEffect(() => {
    fetchLiveClasses();
    fetchCourses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/live-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Backend now returns course names already enriched
      setLiveClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      setLiveClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses from:', `${API_URL}/instructor/courses`);
      const response = await axios.get(`${API_URL}/instructor/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Courses response:', response.data);
      setCourses(response.data.courses || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      console.error('Error details:', error.response?.data);
      setCourses([]);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Convert datetime-local to ISO string
      const scheduledDate = new Date(formData.scheduled_at).toISOString();

      await axios.post(
        `${API_URL}/live-classes`,
        {
          ...formData,
          scheduled_at: scheduledDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowCreateModal(false);
      setFormData({
        course_id: '',
        title: '',
        description: '',
        scheduled_at: '',
        duration_minutes: 60,
      });

      fetchLiveClasses();
      alert('Live class created successfully!');
    } catch (error: any) {
      console.error('Error creating live class:', error);
      alert(error.response?.data?.error || 'Failed to create live class');
    }
  };

  const handleStartClass = async (classId: string) => {
    try {
      // Update status to live
      await axios.put(
        `${API_URL}/live-classes/${classId}/status`,
        { status: 'live' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Navigate to the live class room
      navigate(`/live-class/${classId}`);
    } catch (error) {
      console.error('Error starting class:', error);
      alert('Failed to start class');
    }
  };

  const handleJoinClass = (classId: string) => {
    navigate(`/live-class/${classId}`);
  };

  const handleEndClass = async (classId: string) => {
    if (!confirm('Are you sure you want to end this class?')) return;

    try {
      await axios.put(
        `${API_URL}/live-classes/${classId}/status`,
        { status: 'ended' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchLiveClasses();
      alert('Class ended successfully');
    } catch (error) {
      console.error('Error ending class:', error);
      alert('Failed to end class');
    }
  };

  const filteredClasses = Array.isArray(liveClasses) ? liveClasses.filter((liveClass) => {
    if (selectedFilter === 'all') return true;
    return liveClass.status === selectedFilter;
  }) : [];

  const upcomingClasses = filteredClasses.filter((c) => c.status === 'scheduled');
  const liveNow = filteredClasses.filter((c) => c.status === 'live');
  const pastClasses = filteredClasses.filter((c) => c.status === 'ended');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
            <p className="text-gray-600 mt-1">Schedule and manage your live video classes</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            + Schedule Live Class
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{upcomingClasses.length}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Live Now</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{liveNow.length}</p>
              </div>
              <div className="text-4xl">🔴</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pastClasses.length}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {['all', 'scheduled', 'live', 'ended'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    selectedFilter === filter
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Classes List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading classes...</div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No {selectedFilter !== 'all' ? selectedFilter : ''} classes found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClasses.map((liveClass) => (
                  <div
                    key={liveClass.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {liveClass.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              liveClass.status === 'live'
                                ? 'bg-green-100 text-green-800'
                                : liveClass.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : liveClass.status === 'ended'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {liveClass.status === 'live' && '🔴 '}{liveClass.status}
                          </span>
                        </div>

                        <p className="text-gray-600 mt-2">{liveClass.course_name}</p>

                        {liveClass.description && (
                          <p className="text-gray-500 text-sm mt-2">{liveClass.description}</p>
                        )}

                        <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="mr-2">📅</span>
                            {new Date(liveClass.scheduled_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">🕐</span>
                            {new Date(liveClass.scheduled_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">⏱️</span>
                            {liveClass.duration_minutes} minutes
                          </div>
                        </div>

                        {liveClass.recording_url && (
                          <div className="mt-4">
                            <a
                              href={liveClass.recording_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                              📹 View Recording
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {liveClass.status === 'scheduled' && (
                          <button
                            onClick={() => handleStartClass(liveClass.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium whitespace-nowrap"
                          >
                            Start Class
                          </button>
                        )}

                        {liveClass.status === 'live' && (
                          <>
                            <button
                              onClick={() => handleJoinClass(liveClass.id)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium whitespace-nowrap"
                            >
                              Join Class
                            </button>
                            <button
                              onClick={() => handleEndClass(liveClass.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium whitespace-nowrap"
                            >
                              End Class
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Schedule Live Class</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateClass} className="p-6 space-y-6">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a course</option>
                  {Array.isArray(courses) && courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Week 1: Introduction to React"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="What will you cover in this class?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    required
                    min="15"
                    max="240"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
