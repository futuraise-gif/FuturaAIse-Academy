import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore.firebase';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

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

export default function StudentBetaTesting() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [webrtcClasses, setWebrtcClasses] = useState<WebRTCClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebRTCClasses();
  }, []);

  const fetchWebRTCClasses = async () => {
    try {
      setLoading(true);
      console.log('Fetching WebRTC classes from:', `${API_URL}/webrtc-classes`);
      const response = await axios.get(`${API_URL}/webrtc-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('WebRTC classes response:', response.data);
      console.log('Number of classes received:', response.data?.length || 0);
      setWebrtcClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching WebRTC classes:', error);
      setWebrtcClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = (roomId: string) => {
    navigate(`/webrtc-test/${roomId}`);
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

  const isUpcoming = (scheduledAt: string) => {
    return new Date(scheduledAt) > new Date();
  };

  // Separate classes by status
  console.log('All WebRTC classes:', webrtcClasses);
  console.log('Total classes count:', webrtcClasses.length);

  const liveClasses = webrtcClasses.filter((cls) => cls.status === 'live');
  console.log('Live classes:', liveClasses.length);

  // Show ALL scheduled classes, not just upcoming ones
  const upcomingClasses = webrtcClasses.filter((cls) => cls.status === 'scheduled');
  console.log('Scheduled classes (all):', upcomingClasses.length);

  const pastClasses = webrtcClasses.filter((cls) => cls.status === 'ended');
  console.log('Past classes:', pastClasses.length);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">WebRTC Beta Testing</h1>
            <p className="text-gray-600 mt-2">
              Join live WebRTC classes for your enrolled courses
            </p>
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="text-xl">🧪</span>
            <span className="font-semibold">Beta</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">About WebRTC Classes</h3>
              <p className="text-sm text-blue-800">
                WebRTC classes are live video conferencing sessions for your enrolled courses. Join when the
                class status shows "live" to participate in real-time sessions with your instructor and
                classmates.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading classes...</div>
        ) : (
          <>
            {/* Live Classes */}
            {liveClasses.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 bg-green-50">
                  <h2 className="text-xl font-semibold text-green-900 flex items-center gap-2">
                    <span className="animate-pulse">🔴</span>
                    Live Now ({liveClasses.length})
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  {liveClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="border-2 border-green-300 rounded-lg p-4 bg-green-50 hover:shadow-md transition-shadow"
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

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>🕐 {formatDate(cls.scheduled_at)}</span>
                            <span>⏱️ {cls.duration_minutes} min</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoinClass(cls.room_id)}
                          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg shadow-lg animate-pulse"
                        >
                          Join Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled Classes */}
            {upcomingClasses.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Scheduled Classes ({upcomingClasses.length})
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  {upcomingClasses.map((cls) => (
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

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>🕐 {formatDate(cls.scheduled_at)}</span>
                            <span>⏱️ {cls.duration_minutes} min</span>
                          </div>
                        </div>

                        <span className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg text-center text-sm font-medium">
                          Scheduled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Classes */}
            {pastClasses.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Past Classes ({pastClasses.length})
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  {pastClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-700">{cls.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(cls.status)}`}>
                              {cls.status}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">📚 {cls.course_name}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>🕐 {formatDate(cls.scheduled_at)}</span>
                            <span>⏱️ {cls.duration_minutes} min</span>
                          </div>
                        </div>

                        <span className="px-6 py-2 bg-gray-200 text-gray-500 rounded-lg text-center text-sm">
                          Ended
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Classes Message */}
            {liveClasses.length === 0 && upcomingClasses.length === 0 && pastClasses.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">📹</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No WebRTC Classes Yet</h3>
                <p className="text-gray-600">
                  Your instructors haven't scheduled any WebRTC classes for your enrolled courses yet.
                  Check back later!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
