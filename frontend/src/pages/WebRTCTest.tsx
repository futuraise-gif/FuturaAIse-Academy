import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

export default function WebRTCTest() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      navigate(`/webrtc-test/${roomId.trim()}`);
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = `room-${Date.now()}`;
    navigate(`/webrtc-test/${newRoomId}`);
  };

  console.log('WebRTCTest component rendering');

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WebRTC Video Test</h1>
          <p className="text-gray-600 mb-8">
            Test the new custom video conferencing system. Create a new room or join an existing one.
          </p>

          <div className="space-y-6">
            {/* Create New Room */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Create New Room</h2>
              <p className="text-gray-600 mb-4">
                Start a new video conference with a unique room ID
              </p>
              <button
                onClick={handleCreateRoom}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors"
              >
                Create & Join New Room
              </button>
            </div>

            {/* Join Existing Room */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Join Existing Room</h2>
              <p className="text-gray-600 mb-4">
                Enter a room ID to join an ongoing video conference
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  placeholder="Enter room ID (e.g., room-1234567890)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!roomId.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Join Room
                </button>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Features</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>HD Video & Audio (720p)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Screen Sharing</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Real-time Chat</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Hand Raise Feature</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Instructor Controls (Mute Participants)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Responsive Grid View</span>
                </li>
              </ul>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Testing Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Click "Create & Join New Room" to start a new video conference</li>
                <li>Share the room ID with others to invite them</li>
                <li>Allow camera and microphone permissions when prompted</li>
                <li>Test all features: video, audio, screen share, and chat</li>
                <li>Open multiple browser tabs/windows to simulate multiple participants</li>
              </ol>
            </div>

            {/* Technical Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Requirements</h3>
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Modern browser (Chrome, Firefox, Safari, Edge)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Camera and microphone permissions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>HTTPS or localhost (required for WebRTC)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Backend server must be running on port 5001</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
