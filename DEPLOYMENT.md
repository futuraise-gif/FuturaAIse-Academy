# Deployment Guide - FuturaAIse Academy

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Firebase project configured
- Backend deployed and accessible

## Step 1: Push to GitHub

```bash
# Create a new repository on GitHub first (https://github.com/new)
# Then run these commands in your terminal:

git remote add origin https://github.com/YOUR_USERNAME/FuturaAIse-Academy.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend

### Option A: Deploy to Railway/Render/Fly.io

1. **Railway** (Recommended for Node.js):
   - Go to railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Add a new service for `backend`
   - Set root directory to `backend`
   - Add environment variables (see below)

2. **Render**:
   - Go to render.com
   - Click "New Web Service"
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

### Backend Environment Variables:
```
PORT=5001
NODE_ENV=production

# Firebase Admin SDK (from Firebase Console → Project Settings → Service Accounts)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key

# CORS
FRONTEND_URL=https://your-vercel-app.vercel.app

# Jitsi
JITSI_DOMAIN=meet.jit.si
```

**Get your backend URL** (e.g., `https://your-app.railway.app` or `https://your-app.onrender.com`)

## Step 3: Deploy Frontend to Vercel

### 3.1: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.2: Environment Variables in Vercel

Add these in Vercel → Project Settings → Environment Variables:

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_from_firebase_console
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration (USE YOUR BACKEND URL FROM STEP 2)
VITE_API_URL=https://your-backend-url.railway.app/api/v1
VITE_SOCKET_URL=https://your-backend-url.railway.app
```

### 3.3: Deploy

Click "Deploy" - Vercel will build and deploy your frontend.

## Step 4: Configure CORS in Backend

Update your backend to allow requests from your Vercel domain:

In `backend/src/server.firebase.ts`, the CORS is configured to use `FRONTEND_URL` environment variable.

Make sure you set this in your backend deployment:
```
FRONTEND_URL=https://your-app.vercel.app
```

## Step 5: Firebase Configuration

### 5.1: Authorized Domains

1. Go to Firebase Console → Authentication → Settings
2. Add your domains to "Authorized domains":
   - `your-app.vercel.app`
   - `your-backend.railway.app` (or render.com)

### 5.2: Firestore Security Rules

Ensure your Firestore rules allow authenticated access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'instructor' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin');
    }

    // Add more rules as needed
  }
}
```

## Step 6: Test Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try logging in
3. Test creating a WebRTC class
4. Test joining a class

## Troubleshooting

### WebRTC Not Connecting
- Check browser console for CORS errors
- Verify `VITE_SOCKET_URL` points to your backend
- Ensure backend allows WebSocket connections
- Check that CORS is properly configured in backend

### Authentication Issues
- Verify Firebase environment variables are correct
- Check authorized domains in Firebase Console
- Ensure backend has correct Firebase Admin SDK credentials

### API Calls Failing
- Verify `VITE_API_URL` is correct
- Check backend logs for errors
- Ensure CORS allows your frontend domain

## WebRTC on Real Devices

### For Production WebRTC:

1. **STUN/TURN Servers**: The current implementation uses Google's free STUN servers. For production, consider:
   - [Twilio STUN/TURN](https://www.twilio.com/docs/stun-turn)
   - [Xirsys](https://xirsys.com/)
   - Self-hosted TURN server using [coturn](https://github.com/coturn/coturn)

2. **HTTPS Required**: WebRTC requires HTTPS in production. Both Vercel and Railway/Render provide HTTPS automatically.

3. **Mobile Testing**:
   - Test on actual devices, not just desktop
   - iOS Safari has stricter autoplay policies
   - Android Chrome generally works better

## Continuous Deployment

Once set up, any push to your main branch will automatically:
- Trigger a new build in Vercel (frontend)
- Trigger a new deployment in Railway/Render (backend)

## Monitoring

### Vercel:
- Check deployment logs: Vercel Dashboard → Your Project → Deployments
- View runtime logs: Vercel Dashboard → Your Project → Logs

### Backend (Railway/Render):
- Check deployment logs in the platform dashboard
- Monitor WebSocket connections
- Track API response times

## Cost Estimates

### Free Tier Limitations:
- **Vercel**: Free for personal projects, generous limits
- **Railway**: $5/month free credit (500 hours)
- **Render**: Free tier available (may sleep after inactivity)
- **Firebase**: Free tier (Spark plan) with limits

For production use with real users, expect:
- **Vercel**: Free to $20/month
- **Backend Hosting**: $5-20/month
- **Firebase**: Free to $25/month (depends on usage)
- **TURN Server**: $10-50/month (if needed)

## Next Steps

1. Set up monitoring (e.g., Sentry for error tracking)
2. Configure custom domain
3. Set up email notifications
4. Implement analytics
5. Add rate limiting for API endpoints
6. Set up automated backups for Firestore
