"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRTCSignalingService = void 0;
const socket_io_1 = require("socket.io");
class WebRTCSignalingService {
    constructor(server) {
        this.rooms = new Map();
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
        ];
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: allowedOrigins,
                credentials: true,
            },
            path: '/socket.io',
        });
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('New WebRTC connection:', socket.id);
            // Join room
            socket.on('join-room', ({ roomId, userId, userName, role }) => {
                console.log(`User ${userName} joining room ${roomId}`);
                // Create room if it doesn't exist
                if (!this.rooms.has(roomId)) {
                    this.rooms.set(roomId, {
                        roomId,
                        courseId: '',
                        participants: new Map(),
                        chat: [],
                        createdAt: new Date(),
                    });
                }
                const room = this.rooms.get(roomId);
                // Add participant
                const participant = {
                    userId,
                    userName,
                    socketId: socket.id,
                    role,
                    audioEnabled: true,
                    videoEnabled: true,
                    screenSharing: false,
                };
                room.participants.set(userId, participant);
                socket.join(roomId);
                // Notify others in the room
                socket.to(roomId).emit('user-joined', {
                    userId,
                    userName,
                    role,
                });
                // Send current participants to the new user
                const currentParticipants = Array.from(room.participants.values())
                    .filter((p) => p.userId !== userId)
                    .map((p) => ({
                    userId: p.userId,
                    userName: p.userName,
                    role: p.role,
                    audioEnabled: p.audioEnabled,
                    videoEnabled: p.videoEnabled,
                    screenSharing: p.screenSharing,
                }));
                socket.emit('existing-participants', currentParticipants);
                // Send chat history
                socket.emit('chat-history', room.chat);
                console.log(`Room ${roomId} now has ${room.participants.size} participants`);
            });
            // WebRTC signaling - offer
            socket.on('webrtc-offer', ({ roomId, targetUserId, offer }) => {
                const room = this.rooms.get(roomId);
                if (!room)
                    return;
                const targetParticipant = room.participants.get(targetUserId);
                if (targetParticipant) {
                    this.io.to(targetParticipant.socketId).emit('webrtc-offer', {
                        fromUserId: this.getUserIdBySocketId(socket.id, room),
                        offer,
                    });
                }
            });
            // WebRTC signaling - answer
            socket.on('webrtc-answer', ({ roomId, targetUserId, answer }) => {
                const room = this.rooms.get(roomId);
                if (!room)
                    return;
                const targetParticipant = room.participants.get(targetUserId);
                if (targetParticipant) {
                    this.io.to(targetParticipant.socketId).emit('webrtc-answer', {
                        fromUserId: this.getUserIdBySocketId(socket.id, room),
                        answer,
                    });
                }
            });
            // WebRTC signaling - ICE candidate
            socket.on('ice-candidate', ({ roomId, targetUserId, candidate }) => {
                const room = this.rooms.get(roomId);
                if (!room)
                    return;
                const targetParticipant = room.participants.get(targetUserId);
                if (targetParticipant) {
                    this.io.to(targetParticipant.socketId).emit('ice-candidate', {
                        fromUserId: this.getUserIdBySocketId(socket.id, room),
                        candidate,
                    });
                }
            });
            // Toggle audio
            socket.on('toggle-audio', ({ roomId, enabled }) => {
                const room = this.rooms.get(roomId);
                if (!room)
                    return;
                const userId = this.getUserIdBySocketId(socket.id, room);
                const participant = room.participants.get(userId);
                if (participant) {
                    participant.audioEnabled = enabled;
                    socket.to(roomId).emit('participant-audio-changed', {
                        userId,
                        enabled,
                    });
                }
            });
            // Toggle video
            socket.on('toggle-video', ({ roomId, enabled }) => {
                const room = this.rooms.get(roomId);
                if (!room)
                    return;
                const userId = this.getUserIdBySocketId(socket.id, room);
                const participant = room.participants.get(userId);
                if (participant) {
                    participant.videoEnabled = enabled;
                    socket.to(roomId).emit('participant-video-changed', {
                        userId,
                        enabled,
                    });
                }
            });
            // Start/stop screen sharing
            socket.on('screen-share', ({ roomId, sharing }) => {
                const room = this.rooms.get(roomId);
                if (!room)
                    return;
                const userId = this.getUserIdBySocketId(socket.id, room);
                const participant = room.participants.get(userId);
                if (participant) {
                    participant.screenSharing = sharing;
                    socket.to(roomId).emit('participant-screen-share-changed', {
                        userId,
                        userName: participant.userName,
                        sharing,
                    });
                }
            });
            // Chat message
            socket.on('chat-message', ({ roomId, message }) => {
                const room = this.rooms.get(roomId);
                if (!room)
                    return;
                const userId = this.getUserIdBySocketId(socket.id, room);
                const participant = room.participants.get(userId);
                if (!participant)
                    return;
                const chatMessage = {
                    userId,
                    userName: participant.userName,
                    message,
                    timestamp: new Date(),
                };
                room.chat.push(chatMessage);
                // Broadcast to all in room including sender
                this.io.to(roomId).emit('chat-message', chatMessage);
            });
            // Leave room
            socket.on('leave-room', ({ roomId }) => {
                this.handleUserLeave(socket.id, roomId);
            });
            // Handle disconnect
            socket.on('disconnect', () => {
                console.log('WebRTC disconnection:', socket.id);
                // Find and remove user from all rooms
                this.rooms.forEach((room, roomId) => {
                    this.handleUserLeave(socket.id, roomId);
                });
            });
            // Raise hand
            socket.on('raise-hand', ({ roomId, raised }) => {
                const room = this.rooms.get(roomId);
                if (!room)
                    return;
                const userId = this.getUserIdBySocketId(socket.id, room);
                const participant = room.participants.get(userId);
                if (participant) {
                    socket.to(roomId).emit('hand-raised', {
                        userId,
                        userName: participant.userName,
                        raised,
                    });
                }
            });
            // Mute participant (instructor only)
            socket.on('mute-participant', ({ roomId, targetUserId }) => {
                const room = this.rooms.get(roomId);
                if (!room)
                    return;
                const userId = this.getUserIdBySocketId(socket.id, room);
                const participant = room.participants.get(userId);
                // Only instructors can mute others
                if (participant && participant.role === 'instructor') {
                    const targetParticipant = room.participants.get(targetUserId);
                    if (targetParticipant) {
                        this.io.to(targetParticipant.socketId).emit('force-mute');
                        targetParticipant.audioEnabled = false;
                    }
                }
            });
        });
    }
    handleUserLeave(socketId, roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const userId = this.getUserIdBySocketId(socketId, room);
        const participant = room.participants.get(userId);
        if (participant) {
            room.participants.delete(userId);
            // Notify others
            this.io.to(roomId).emit('user-left', {
                userId,
                userName: participant.userName,
            });
            console.log(`User ${participant.userName} left room ${roomId}`);
            // Clean up empty rooms
            if (room.participants.size === 0) {
                this.rooms.delete(roomId);
                console.log(`Room ${roomId} deleted (empty)`);
            }
        }
    }
    getUserIdBySocketId(socketId, room) {
        for (const [userId, participant] of room.participants) {
            if (participant.socketId === socketId) {
                return userId;
            }
        }
        return '';
    }
    getRoomParticipantCount(roomId) {
        const room = this.rooms.get(roomId);
        return room ? room.participants.size : 0;
    }
    getRoomInfo(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        return {
            roomId: room.roomId,
            participantCount: room.participants.size,
            participants: Array.from(room.participants.values()).map((p) => ({
                userId: p.userId,
                userName: p.userName,
                role: p.role,
                audioEnabled: p.audioEnabled,
                videoEnabled: p.videoEnabled,
                screenSharing: p.screenSharing,
            })),
        };
    }
    getIO() {
        return this.io;
    }
}
exports.WebRTCSignalingService = WebRTCSignalingService;
//# sourceMappingURL=webrtc-signaling.service.js.map