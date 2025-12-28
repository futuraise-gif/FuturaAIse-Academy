import { useParams, useNavigate } from 'react-router-dom';
import WebRTCRoom from '@/components/video/WebRTCRoom';
import DashboardLayout from '@/components/DashboardLayout';

export default function WebRTCTestRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  if (!roomId) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">Room ID is required</p>
        </div>
      </DashboardLayout>
    );
  }

  return <WebRTCRoom roomId={roomId} onLeave={() => navigate(-1)} />;
}
