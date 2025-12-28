import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore.firebase';
import { UserRole } from '@/types';

interface Participant {
  userId: string;
  userName: string;
  role: 'instructor' | 'student';
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  stream?: MediaStream;
  screenStream?: MediaStream;
}

interface ChatMessage {
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface WebRTCRoomProps {
  roomId: string;
  onLeave: () => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function WebRTCRoom({ roomId, onLeave }: WebRTCRoomProps) {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  // Initialize media and socket
  useEffect(() => {
    const init = async () => {
      await initializeMedia();
      initializeSocket();
    };

    init();

    return () => {
      cleanup();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      console.log('Requesting media access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log('Media stream obtained:', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
      });

      stream.getAudioTracks().forEach((track) => {
        console.log('Audio track:', {
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          label: track.label,
        });
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const initializeSocket = () => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    const newSocket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    const isInstr = user?.role === UserRole.INSTRUCTOR;
    setIsInstructor(isInstr);

    newSocket.on('connect', () => {
      console.log('Connected to signaling server');

      // Join room
      newSocket.emit('join-room', {
        roomId,
        userId: user?.id,
        userName: `${user?.first_name} ${user?.last_name}`,
        role: isInstr ? 'instructor' : 'student',
      });
    });

    // Handle existing participants
    newSocket.on('existing-participants', (existingParticipants: any[]) => {
      console.log('Existing participants:', existingParticipants);

      existingParticipants.forEach((participant) => {
        // Don't create peer connection to yourself!
        if (participant.userId !== user?.id) {
          // Add to participants state
          setParticipants((prev) => {
            const newParticipants = new Map(prev);
            newParticipants.set(participant.userId, {
              userId: participant.userId,
              userName: participant.userName,
              role: participant.role,
              audioEnabled: participant.audioEnabled ?? true,
              videoEnabled: participant.videoEnabled ?? true,
              screenSharing: participant.screenSharing ?? false,
            });
            return newParticipants;
          });

          // Create peer connection
          createPeerConnection(participant.userId, true);
        } else {
          console.log('Skipping peer connection to self');
        }
      });
    });

    // Handle new user joined
    newSocket.on('user-joined', ({ userId, userName, role }) => {
      console.log('New user joined:', userName);

      // Don't add yourself as a participant!
      if (userId === user?.id) {
        console.log('Ignoring self join event');
        return;
      }

      setParticipants((prev) => {
        const newParticipants = new Map(prev);
        newParticipants.set(userId, {
          userId,
          userName,
          role,
          audioEnabled: true,
          videoEnabled: true,
          screenSharing: false,
        });
        return newParticipants;
      });

      createPeerConnection(userId, false);
    });

    // Handle WebRTC offer
    newSocket.on('webrtc-offer', async ({ fromUserId, offer }) => {
      console.log('Received offer from:', fromUserId);

      const pc = peerConnections.current.get(fromUserId);
      if (!pc) return;

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      newSocket.emit('webrtc-answer', {
        roomId,
        targetUserId: fromUserId,
        answer,
      });
    });

    // Handle WebRTC answer
    newSocket.on('webrtc-answer', async ({ fromUserId, answer }) => {
      console.log('Received answer from:', fromUserId);

      const pc = peerConnections.current.get(fromUserId);
      if (!pc) return;

      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Handle ICE candidate
    newSocket.on('ice-candidate', async ({ fromUserId, candidate }) => {
      const pc = peerConnections.current.get(fromUserId);
      if (!pc) return;

      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Handle user left
    newSocket.on('user-left', ({ userId }) => {
      console.log('User left:', userId);

      closePeerConnection(userId);

      setParticipants((prev) => {
        const newParticipants = new Map(prev);
        newParticipants.delete(userId);
        return newParticipants;
      });
    });

    // Handle chat messages
    newSocket.on('chat-message', (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    // Handle chat history
    newSocket.on('chat-history', (history: ChatMessage[]) => {
      setChatMessages(history);
    });

    // Handle media state changes
    newSocket.on('participant-audio-changed', ({ userId, enabled }) => {
      setParticipants((prev) => {
        const newParticipants = new Map(prev);
        const participant = newParticipants.get(userId);
        if (participant) {
          participant.audioEnabled = enabled;
        }
        return newParticipants;
      });
    });

    newSocket.on('participant-video-changed', ({ userId, enabled }) => {
      setParticipants((prev) => {
        const newParticipants = new Map(prev);
        const participant = newParticipants.get(userId);
        if (participant) {
          participant.videoEnabled = enabled;
        }
        return newParticipants;
      });
    });

    newSocket.on('participant-screen-share-changed', ({ userId, sharing }) => {
      setParticipants((prev) => {
        const newParticipants = new Map(prev);
        const participant = newParticipants.get(userId);
        if (participant) {
          participant.screenSharing = sharing;
        }
        return newParticipants;
      });
    });

    newSocket.on('hand-raised', ({ userName, raised }) => {
      console.log(`${userName} ${raised ? 'raised' : 'lowered'} hand`);
      // You can show a notification or update participant UI
    });

    newSocket.on('force-mute', () => {
      toggleAudio();
      alert('You have been muted by the instructor');
    });

    setSocket(newSocket);
  };

  const createPeerConnection = (userId: string, isInitiator: boolean) => {
    console.log(`Creating peer connection for ${userId}, isInitiator: ${isInitiator}`);
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Monitor connection state
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${userId}:`, pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.error(`Connection ${pc.connectionState} for ${userId}, attempting to reconnect...`);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${userId}:`, pc.iceConnectionState);
    };

    pc.onicegatheringstatechange = () => {
      console.log(`ICE gathering state for ${userId}:`, pc.iceGatheringState);
    };

    // Add local stream tracks
    if (localStream) {
      console.log(`Adding ${localStream.getTracks().length} tracks to peer connection for ${userId}`);
      localStream.getTracks().forEach((track) => {
        console.log(`Adding ${track.kind} track:`, track.id);
        pc.addTrack(track, localStream);
      });
    } else {
      console.warn('No local stream available when creating peer connection!');
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log('Received track from:', userId, {
        kind: event.track.kind,
        enabled: event.track.enabled,
        muted: event.track.muted,
        readyState: event.track.readyState,
        streams: event.streams.length,
      });

      const stream = event.streams[0];
      console.log('Stream details:', {
        id: stream.id,
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
      });

      stream.getAudioTracks().forEach((track) => {
        console.log('Received audio track:', {
          id: track.id,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          label: track.label,
        });
      });

      setParticipants((prev) => {
        const newParticipants = new Map(prev);
        const participant = newParticipants.get(userId);
        if (participant) {
          console.log(`Setting stream for participant ${userId}`);
          participant.stream = stream;
        } else {
          console.warn(`Participant ${userId} not found in state!`);
        }
        return newParticipants;
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        console.log(`Sending ICE candidate to ${userId}`);
        socket.emit('ice-candidate', {
          roomId,
          targetUserId: userId,
          candidate: event.candidate,
        });
      } else if (!event.candidate) {
        console.log(`ICE gathering complete for ${userId}`);
      }
    };

    peerConnections.current.set(userId, pc);

    // If initiator, create and send offer
    if (isInitiator) {
      console.log(`Creating offer for ${userId}`);
      pc.createOffer()
        .then((offer) => {
          console.log(`Setting local description for ${userId}`);
          return pc.setLocalDescription(offer);
        })
        .then(() => {
          if (socket) {
            console.log(`Sending offer to ${userId}`);
            socket.emit('webrtc-offer', {
              roomId,
              targetUserId: userId,
              offer: pc.localDescription,
            });
          }
        })
        .catch((error) => {
          console.error(`Error creating offer for ${userId}:`, error);
        });
    }

    return pc;
  };

  const closePeerConnection = (userId: string) => {
    const pc = peerConnections.current.get(userId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(userId);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);

        if (socket) {
          socket.emit('toggle-audio', { roomId, enabled: audioTrack.enabled });
        }
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);

        if (socket) {
          socket.emit('toggle-video', { roomId, enabled: videoTrack.enabled });
        }
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        setScreenStream(stream);
        setScreenSharing(true);

        // Replace video track in all peer connections
        const videoTrack = stream.getVideoTracks()[0];
        peerConnections.current.forEach((pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((sender) => sender.track?.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(videoTrack);
          }
        });

        if (socket) {
          socket.emit('screen-share', { roomId, sharing: true });
        }

        // Handle stream end
        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }

    setScreenSharing(false);

    // Restore camera video track
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      peerConnections.current.forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find((sender) => sender.track?.kind === 'video');
        if (videoSender && videoTrack) {
          videoSender.replaceTrack(videoTrack);
        }
      });
    }

    if (socket) {
      socket.emit('screen-share', { roomId, sharing: false });
    }
  };

  const sendChatMessage = () => {
    if (chatInput.trim() && socket) {
      socket.emit('chat-message', { roomId, message: chatInput.trim() });
      setChatInput('');
    }
  };

  const toggleHandRaise = () => {
    const newState = !handRaised;
    setHandRaised(newState);

    if (socket) {
      socket.emit('raise-hand', { roomId, raised: newState });
    }
  };

  const cleanup = () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }

    // Close all peer connections
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    // Disconnect socket
    if (socket) {
      socket.emit('leave-room', { roomId });
      socket.disconnect();
    }
  };

  const handleLeave = () => {
    cleanup();
    onLeave();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
        <h2 className="text-white font-semibold">Live Class - Room: {roomId}</h2>
        <button
          onClick={handleLeave}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Leave Class
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Local video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                You {handRaised && '✋'}
              </div>
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.first_name?.charAt(0)}
                  </div>
                </div>
              )}
            </div>

            {/* Participant videos */}
            {Array.from(participants.values()).map((participant) => (
              <ParticipantVideo key={participant.userId} participant={participant} />
            ))}
          </div>
        </div>

        {/* Participants sidebar - Instructors only */}
        {showParticipants && isInstructor && (
          <div className="w-80 bg-gray-800 flex flex-col border-l border-gray-700">
            <div className="p-3 border-b border-gray-700">
              <h3 className="text-white font-semibold">
                Participants ({participants.size + 1})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* Current user */}
              <div className="flex items-center gap-3 p-2 bg-gray-700 rounded-md">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.first_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">
                    You 👨‍🏫
                  </p>
                </div>
                <div className="flex gap-1">
                  {!audioEnabled && (
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Muted</span>
                  )}
                  {!videoEnabled && (
                    <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">No Video</span>
                  )}
                </div>
              </div>

              {/* Other participants */}
              {Array.from(participants.values()).map((participant) => (
                <div key={participant.userId} className="flex items-center gap-3 p-2 bg-gray-700 rounded-md">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {participant.userName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {participant.userName}
                      {participant.role === 'instructor' && ' 👨‍🏫'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!participant.audioEnabled && (
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Muted</span>
                    )}
                    {!participant.videoEnabled && (
                      <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">No Video</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 flex flex-col border-l border-gray-700">
            <div className="p-3 border-b border-gray-700">
              <h3 className="text-white font-semibold">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="text-sm">
                  <span className="text-gray-400">{msg.userName}:</span>
                  <span className="text-white ml-2">{msg.message}</span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={sendChatMessage}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-4 py-4 flex justify-center gap-3">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors ${
            audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          }`}
          title={audioEnabled ? 'Mute' : 'Unmute'}
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            {audioEnabled ? (
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${
            videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          }`}
          title={videoEnabled ? 'Stop Video' : 'Start Video'}
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full transition-colors ${
            screenSharing ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={screenSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isInstructor && (
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`p-3 rounded-full transition-colors ${
              showParticipants ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Toggle Participants"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </button>
        )}

        <button
          onClick={() => setShowChat(!showChat)}
          className={`p-3 rounded-full transition-colors ${
            showChat ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title="Toggle Chat"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={toggleHandRaise}
          className={`p-3 rounded-full transition-colors ${
            handRaised ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={handRaised ? 'Lower Hand' : 'Raise Hand'}
        >
          <span className="text-2xl">✋</span>
        </button>
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}

function ParticipantVideo({ participant }: { participant: Participant }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      console.log(`Setting stream for participant video: ${participant.userName}`, {
        streamId: participant.stream.id,
        audioTracks: participant.stream.getAudioTracks().length,
        videoTracks: participant.stream.getVideoTracks().length,
      });

      const videoElement = videoRef.current;
      videoElement.srcObject = participant.stream;

      // CRITICAL: Set volume to maximum and unmute
      videoElement.volume = 1.0;
      videoElement.muted = false;

      // Force set audio properties on the stream itself
      participant.stream.getAudioTracks().forEach((track) => {
        track.enabled = true;
        console.log(`Audio track for ${participant.userName}:`, {
          id: track.id,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          label: track.label,
        });
      });

      // Ensure video plays with audio
      videoElement.play()
        .then(() => {
          console.log(`✅ Video and audio playing for ${participant.userName}`);
          console.log('Video element state:', {
            muted: videoElement.muted,
            volume: videoElement.volume,
            paused: videoElement.paused,
            srcObject: videoElement.srcObject ? 'SET' : 'NULL',
          });
          setAudioBlocked(false);
        })
        .catch((error) => {
          console.error(`❌ Error playing video for ${participant.userName}:`, error);
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);

          // Browser might be blocking autoplay
          if (error.name === 'NotAllowedError') {
            console.warn('Autoplay blocked - user interaction required');
            setAudioBlocked(true);
          } else {
            // Try again with muted first, then unmute
            videoElement.muted = true;
            videoElement.play()
              .then(() => {
                // Successfully playing muted, now try to unmute
                videoElement.muted = false;
                console.log('Unmuted after muted autoplay');
              })
              .catch(e => console.error('Second play attempt failed:', e));
          }
        });
    }
  }, [participant.stream, participant.userName]);

  const handleEnableAudio = () => {
    if (videoRef.current) {
      const videoElement = videoRef.current;
      videoElement.muted = false;
      videoElement.volume = 1.0;
      videoElement.play()
        .then(() => {
          console.log('Audio enabled via user interaction');
          setAudioBlocked(false);
        })
        .catch((error) => {
          console.error('Failed to enable audio:', error);
        });
    }
  };

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
      {participant.stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <audio
            ref={(audioRef) => {
              if (audioRef && participant.stream) {
                audioRef.srcObject = participant.stream;
                audioRef.volume = 1.0;
                audioRef.play().catch(e => console.error('Audio play failed:', e));
              }
            }}
            autoPlay
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-700">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {participant.userName.charAt(0)}
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
        {participant.userName}
        {participant.role === 'instructor' && ' 👨‍🏫'}
      </div>

      {audioBlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <button
            onClick={handleEnableAudio}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            Enable Audio
          </button>
        </div>
      )}

      {!participant.videoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {participant.userName.charAt(0)}
          </div>
        </div>
      )}

      {!participant.audioEnabled && (
        <div className="absolute top-2 right-2 bg-red-600 p-1 rounded-full">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
