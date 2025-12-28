// Register ts-node to handle TypeScript files
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  },
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✓ Firebase Admin initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

const app = express();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS check - Origin:', origin);
    if (!origin) return callback(null, true);

    // Allow Vercel preview deployments and configured origins
    if (origin.includes('.vercel.app') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now during setup
    }
  },
  credentials: true,
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    firebase: admin.apps.length > 0 ? 'initialized' : 'not initialized'
  });
});

// Load TypeScript routes
try {
  const routes = require('../src/routes/index.firebase').default;
  app.use('/api/v1', routes);
  console.log('✓ API routes loaded');
} catch (error) {
  console.error('Failed to load routes:', error);
  
  // Fallback simple API endpoint
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'API is running (routes failed to load)',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: `The requested path ${req.path} was not found on this server.`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

module.exports = app;
