import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore.firebase';
import JitsiMeeting from '@/components/JitsiMeeting';
import { liveSessionService } from '@/services/liveSessionService';
import { LiveSession } from '@/types/live-session.types';

export default function LiveClass() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [session, setSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const sessionData = await liveSessionService.getSessionDetails(sessionId!);
      setSession(sessionData);
    } catch (error) {
      console.error('Failed to fetch session:', error);
      alert('Failed to load session');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    try {
      setJoining(true);
      await liveSessionService.joinSession(sessionId!);
      setJoining(false);
    } catch (error: any) {
      console.error('Failed to join session:', error);
      alert(error.response?.data?.error || 'Failed to join session');
      setJoining(false);
    }
  };

  const handleMeetingEnd = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Session not found</div>
      </div>
    );
  }

  // Auto-join for instructor or if already joined
  useEffect(() => {
    if (session && !joining && user) {
      if (session.instructor_id === user.userId || session.attendees.includes(user.userId)) {
        // Already authorized
      } else {
        handleJoinSession();
      }
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">{session.title}</h1>
            <p className="text-gray-400 text-sm mt-1">{session.course_title}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Leave Class
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-black rounded-lg overflow-hidden">
          {session.meeting_url && (
            <JitsiMeeting
              roomName={session.meeting_id || session.meeting_url}
              displayName={`${user?.first_name} ${user?.last_name}`}
              onMeetingEnd={handleMeetingEnd}
            />
          )}
        </div>

        {/* Session Info */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Session Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Instructor</p>
              <p className="text-white font-semibold">{session.instructor_name}</p>
            </div>
            <div>
              <p className="text-gray-400">Start Time</p>
              <p className="text-white font-semibold">
                {new Date(session.scheduled_start).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400">End Time</p>
              <p className="text-white font-semibold">
                {new Date(session.scheduled_end).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Participants</p>
              <p className="text-white font-semibold">{session.attendees.length}</p>
            </div>
          </div>
          {session.description && (
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-2">Description</p>
              <p className="text-white">{session.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
