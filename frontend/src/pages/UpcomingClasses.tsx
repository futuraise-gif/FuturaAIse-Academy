import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { liveSessionService } from '@/services/liveSessionService';
import { LiveSession, LiveSessionStatus } from '@/types/live-session.types';

export default function UpcomingClasses() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await liveSessionService.getUpcomingSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (sessionId: string, status: LiveSessionStatus) => {
    if (status !== LiveSessionStatus.LIVE) {
      alert('This session is not live yet. Please wait for the instructor to start it.');
      return;
    }
    navigate(`/live/${sessionId}`);
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

  const getTimeRemaining = (scheduledStart: string) => {
    const now = new Date().getTime();
    const start = new Date(scheduledStart).getTime();
    const diff = start - now;

    if (diff < 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading upcoming classes...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Live Classes</h1>
          <p className="text-gray-600 mt-1">Join your scheduled video classes</p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming classes</h3>
            <p className="text-gray-600">You don't have any scheduled live classes at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 ${
                  session.status === LiveSessionStatus.LIVE ? 'border-2 border-green-500' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusBadge(session.status)}`}>
                        {session.status}
                      </span>
                      {session.status === LiveSessionStatus.LIVE && (
                        <span className="px-3 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 animate-pulse">
                          🔴 LIVE NOW
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{session.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Course</p>
                        <p className="font-semibold text-gray-900">{session.course_title}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Instructor</p>
                        <p className="font-semibold text-gray-900">{session.instructor_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date & Time</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(session.scheduled_start).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(session.scheduled_start).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-semibold text-gray-900">
                          {Math.round(
                            (new Date(session.scheduled_end).getTime() -
                              new Date(session.scheduled_start).getTime()) /
                              (1000 * 60)
                          )}{' '}
                          min
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Starts</p>
                        <p className="font-semibold text-gray-900">{getTimeRemaining(session.scheduled_start)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {session.status === LiveSessionStatus.LIVE ? (
                      <button
                        onClick={() => handleJoinSession(session.id, session.status)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors animate-pulse"
                      >
                        Join Now
                      </button>
                    ) : session.status === LiveSessionStatus.SCHEDULED ? (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
                      >
                        Not Started
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
                      >
                        Ended
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
