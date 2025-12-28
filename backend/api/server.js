const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const admin = require('firebase-admin');

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
  : ['http://localhost:3000'];

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS check - Origin:', origin);
    if (!origin) return callback(null, true);

    // Allow all .vercel.app domains and configured origins
    if (origin.includes('.vercel.app') || allowedOrigins.some(allowed => origin.includes(allowed))) {
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

// Try to load compiled routes from dist folder
let routesLoaded = false;
const path = require('path');
const fs = require('fs');

// Debug: Log current directory and check if dist exists
console.log('Current __dirname:', __dirname);
console.log('Current working directory:', process.cwd());

const distPath = path.join(__dirname, '..', 'dist');
console.log('Checking for dist directory at:', distPath);
console.log('Dist exists:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  const distContents = fs.readdirSync(distPath);
  console.log('Dist contents:', distContents);

  const routesPath = path.join(distPath, 'routes');
  if (fs.existsSync(routesPath)) {
    const routesContents = fs.readdirSync(routesPath);
    console.log('Routes contents:', routesContents.slice(0, 10)); // First 10 files
  }
}

// Try multiple possible paths for the routes
const possiblePaths = [
  path.join(__dirname, '..', 'dist', 'routes', 'index.firebase.js'),
  path.join(__dirname, '..', 'dist', 'routes', 'index.firebase'),
  '../dist/routes/index.firebase',
];

for (const routePath of possiblePaths) {
  try {
    console.log('Trying to load routes from:', routePath);
    const routes = require(routePath).default || require(routePath);
    app.use('/api/v1', routes);
    routesLoaded = true;
    console.log('✓ API routes loaded from:', routePath);
    break;
  } catch (error) {
    console.error(`Failed to load from ${routePath}:`, error.message);
  }
}

// Fallback API endpoint if routes didn't load
if (!routesLoaded) {
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'API is running',
      note: 'Full routes not loaded - build may be required',
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
