// Vercel serverless function entry point
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import the compiled Express app
const app = require('../dist/index.vercel').default;

// Export as Vercel serverless function
module.exports = app;
