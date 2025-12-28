#!/bin/bash

echo "🚀 FuturaAIse Academy - Firebase Deployment Script"
echo "=================================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✓ Firebase CLI found"
echo ""

# Check if user is logged in
firebase projects:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase"
    echo "Please run: firebase login"
    exit 1
fi

echo "✓ Logged in to Firebase"
echo ""

# Set the project
echo "Setting Firebase project to: fir-academy-8f2c4"
firebase use fir-academy-8f2c4

if [ $? -ne 0 ]; then
    echo "❌ Failed to set Firebase project"
    exit 1
fi

echo "✓ Firebase project set"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Build backend
echo "🔨 Building backend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✓ Backend built successfully"
echo ""

# Go back to root
cd ..

# Deploy to Firebase Functions
echo "🚀 Deploying to Firebase Functions..."
firebase deploy --only functions

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""
echo "📝 Next steps:"
echo "1. Copy your Firebase Functions URL from the output above"
echo "2. It should look like: https://us-central1-fir-academy-8f2c4.cloudfunctions.net/api"
echo "3. Update Vercel environment variable:"
echo "   VITE_API_URL=https://us-central1-fir-academy-8f2c4.cloudfunctions.net/api/api/v1"
echo "4. Redeploy your frontend on Vercel"
echo ""
