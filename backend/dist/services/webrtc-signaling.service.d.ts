import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
export declare class WebRTCSignalingService {
    private io;
    private rooms;
    constructor(server: HTTPServer);
    private setupSocketHandlers;
    private handleUserLeave;
    private getUserIdBySocketId;
    getRoomParticipantCount(roomId: string): number;
    getRoomInfo(roomId: string): {
        roomId: string;
        participantCount: number;
        participants: {
            userId: string;
            userName: string;
            role: "student" | "instructor";
            audioEnabled: boolean;
            videoEnabled: boolean;
            screenSharing: boolean;
        }[];
    } | null;
    getIO(): SocketIOServer;
}
//# sourceMappingURL=webrtc-signaling.service.d.ts.map