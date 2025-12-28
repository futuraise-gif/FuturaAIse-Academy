import * as functions from 'firebase-functions';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.firebase';
import { errorHandler, notFound } from './middleware/error.middleware';

const app: Application = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://futura-aise-academy.vercel.app',
  // Add your Vercel domain here
];

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is allowed or is a Vercel deployment preview
    if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);
