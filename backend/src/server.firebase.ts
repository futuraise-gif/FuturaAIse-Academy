import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import routes from './routes/index.firebase';
import { errorHandler, notFound } from './middleware/error.middleware';
import { WebRTCSignalingService } from './services/webrtc-signaling.service';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS check - Origin:', origin, 'Allowed:', allowedOrigins);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/api/v1/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    console.log('✓ Firebase initialized');

    // Initialize WebRTC signaling service
    const webrtcService = new WebRTCSignalingService(httpServer);
    console.log('✓ WebRTC signaling service initialized');

    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API available at http://localhost:${PORT}/api/v1`);
      console.log(`✓ WebRTC Socket.IO ready at http://localhost:${PORT}/socket.io`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
