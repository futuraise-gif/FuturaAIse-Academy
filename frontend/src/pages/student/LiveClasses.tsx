import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore.firebase';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

interface LiveClass {
  id: string;
  course_id: string;
  course_name?: string;
  instructor_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  room_id?: string;
  room_code?: string;
  recording_url?: string;
  created_at: string;
  updated_at: string;
}

export default function StudentLiveClasses() {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    fetchLiveClasses();
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

  const handleJoinClass = async (classId: string) => {
    navigate(`/live-class/${classId}`);
  };

  const filteredClasses = Array.isArray(liveClasses) ? liveClasses.filter((liveClass) => {
    if (selectedFilter === 'all') return true;
    return liveClass.status === selectedFilter;
  }) : [];

  const upcomingClasses = filteredClasses.filter((c) => c.status === 'scheduled');
  const liveNow = filteredClasses.filter((c) => c.status === 'live');
  const pastClasses = filteredClasses.filter((c) => c.status === 'ended');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
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
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading live classes...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
          <p className="text-gray-600 mt-2">
            Join scheduled live classes for your enrolled courses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Classes</p>
                <p className="text-3xl font-bold text-blue-600">{upcomingClasses.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                📅
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Live Now</p>
                <p className="text-3xl font-bold text-green-600">{liveNow.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                🔴
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Past Classes</p>
                <p className="text-3xl font-bold text-gray-600">{pastClasses.length}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                ✓
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['all', 'scheduled', 'live', 'ended'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-6 py-3 text-sm font-medium capitalize ${
                    selectedFilter === filter
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </nav>
          </div>

          {/* Classes List */}
          <div className="p-6">
            {filteredClasses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No live classes found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Check back later for scheduled classes
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClasses.map((liveClass) => (
                  <div
                    key={liveClass.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {liveClass.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              liveClass.status
                            )}`}
                          >
                            {liveClass.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          📚 {liveClass.course_name || 'Unknown Course'}
                        </p>

                        {liveClass.description && (
                          <p className="text-sm text-gray-500 mb-3">
                            {liveClass.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>🕐 {formatDate(liveClass.scheduled_at)}</span>
                          <span>⏱️ {liveClass.duration_minutes} minutes</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {liveClass.status === 'live' && (
                          <button
                            onClick={() => handleJoinClass(liveClass.id)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                          >
                            Join Now
                          </button>
                        )}

                        {liveClass.status === 'scheduled' && (
                          <button
                            disabled
                            className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                          >
                            Not Started
                          </button>
                        )}

                        {liveClass.status === 'ended' && liveClass.recording_url && (
                          <a
                            href={liveClass.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
                          >
                            📹 View Recording
                          </a>
                        )}

                        {liveClass.status === 'ended' && !liveClass.recording_url && (
                          <span className="px-6 py-2 bg-gray-100 text-gray-500 rounded-lg text-center text-sm">
                            No Recording
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
      </div>
    </DashboardLayout>
  );
}
