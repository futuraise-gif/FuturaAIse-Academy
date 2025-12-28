import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore.firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export default function LiveClassRoom() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveClass, setLiveClass] = useState<any>(null);
  const [roomUrl, setRoomUrl] = useState('');

  useEffect(() => {
    joinRoom();
  }, [classId]);

  const joinRoom = async () => {
    try {
      setLoading(true);

      // Fetch live class details
      const classResponse = await axios.get(`${API_URL}/live-classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLiveClass(classResponse.data);

      // Join the room
      const joinResponse = await axios.post(
        `${API_URL}/live-classes/${classId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { room_url, displayName } = joinResponse.data;

      // Append display name and config to Jitsi URL
      const urlWithName = `${room_url}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.startWithVideoMuted=false&config.startWithAudioMuted=false`;
      setRoomUrl(urlWithName);
      setLoading(false);
    } catch (err: any) {
      console.error('Error joining room:', err);
      setError(err.response?.data?.error || 'Failed to join class');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Joining class...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => navigate('/courses')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-xl font-semibold">{liveClass?.title}</h1>
          <button
            onClick={() => window.open(roomUrl, '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Open in New Window
          </button>
        </div>
        <button
          onClick={() => navigate('/courses')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Leave Class
        </button>
      </div>

      {/* Jitsi Meet Iframe */}
      <div className="flex-1">
        <iframe
          src={roomUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Live Class Room"
        />
      </div>
    </div>
  );
}
