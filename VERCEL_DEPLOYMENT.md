# Vercel Deployment Guide - FuturaAIse Academy

## Architecture

We'll deploy two separate Vercel projects:
1. **Frontend**: React + Vite application
2. **Backend**: Node.js Express API

This is the simplest approach and works with Vercel's free tier.

---

## Part 1: Deploy Frontend to Vercel

You've already started this! Here's what to do:

### Step 1: Configure Vercel Project

In your Vercel dashboard (you should already have the project created):

**Build & Development Settings**:
- Framework Preset: **Vite**
- Root Directory: **frontend**
- Build Command: `npm run build`
- Output Directory: `dist`

### Step 2: Add Environment Variables

Add these in Vercel → Settings → Environment Variables:

```
VITE_FIREBASE_API_KEY=AIzaSyCW8ULWjyYetMBJqfZ6_Ti_jvQa_XuZ1qA
VITE_FIREBASE_AUTH_DOMAIN=fir-academy-8f2c4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fir-academy-8f2c4
VITE_FIREBASE_STORAGE_BUCKET=fir-academy-8f2c4.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=778711564888
VITE_FIREBASE_APP_ID=1:778711564888:web:c2139e17dcaad33919802d
```

**For now, use these temporary API URLs** (we'll update after deploying backend):
```
VITE_API_URL=http://localhost:5001/api/v1
VITE_SOCKET_URL=http://localhost:5001
```

### Step 3: Deploy

Click **Deploy** in Vercel.

Your frontend will be deployed to something like:
`https://futura-aise-academy.vercel.app`

---

## Part 2: Deploy Backend to Vercel

### Step 1: Create New Vercel Project for Backend

1. Go to Vercel dashboard
2. Click **"Add New"** → **"Project"**
3. Import the same GitHub repo: `FuturaAIse-Academy`
4. **Important**: Give it a different name like `FuturaAIse-Academy-API`

### Step 2: Configure Backend Project

**Build & Development Settings**:
- Framework Preset: **Other**
- Root Directory: **backend**
- Build Command: `npm run build`
- Output Directory: `dist`

### Step 3: Create vercel.json in Backend

I'll create this file for you - it tells Vercel how to run the API.

### Step 4: Add Backend Environment Variables

In the backend Vercel project, add these environment variables:

```
NODE_ENV=production
PORT=3000

FIREBASE_PROJECT_ID=fir-academy-8f2c4
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@fir-academy-8f2c4.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

JITSI_DOMAIN=meet.jit.si

ALLOWED_ORIGINS=https://futura-aise-academy.vercel.app,https://your-frontend-url.vercel.app
```

**To get Firebase credentials**:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Open the downloaded JSON file
4. Copy `project_id`, `client_email`, and `private_key`

### Step 5: Deploy Backend

Click **Deploy**.

Your backend will be deployed to something like:
`https://futura-aise-academy-api.vercel.app`

---

## Part 3: Connect Frontend to Backend

### Step 1: Update Frontend Environment Variables

Go back to your **frontend** Vercel project:

1. Go to Settings → Environment Variables
2. Update these variables:

```
VITE_API_URL=https://futura-aise-academy-api.vercel.app/api/v1
VITE_SOCKET_URL=https://futura-aise-academy-api.vercel.app
```

Replace `futura-aise-academy-api.vercel.app` with your actual backend URL.

### Step 2: Redeploy Frontend

1. Go to Deployments tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"

---

## Part 4: Update Firebase Authorized Domains

1. Go to Firebase Console → Authentication → Settings
2. Add these domains:
   - `futura-aise-academy.vercel.app` (your frontend)
   - `futura-aise-academy-api.vercel.app` (your backend)

---

## Testing

1. Open your frontend URL: `https://futura-aise-academy.vercel.app`
2. Try to log in
3. Try to create a course
4. Try to create a live class (Jitsi)

---

## ⚠️ Important Notes

### About WebRTC Custom Classes

Vercel serverless functions **do not support WebSocket connections (Socket.IO)**.

This means:
- ✅ **Jitsi live classes will work** (they use Jitsi's servers for WebRTC)
- ❌ **Custom WebRTC classes won't work** (they need Socket.IO server)

**Solutions for Custom WebRTC**:
1. **Option A**: Use only Jitsi for all live classes (recommended, no extra setup needed)
2. **Option B**: Deploy WebRTC signaling server to Railway/Render separately
3. **Option C**: Upgrade Firebase to Blaze plan and deploy WebRTC to Cloud Run

For now, stick with **Option A** - Jitsi works great and is already implemented!

---

## Cost

Both frontend and backend on Vercel free tier:
- ✅ **100 GB bandwidth/month**
- ✅ **Unlimited projects**
- ✅ **Automatic HTTPS**
- ✅ **Automatic deployments from Git**

**Total cost: $0/month**

---

## Troubleshooting

### "Cannot connect to server"
- Check that backend is deployed successfully
- Verify `VITE_API_URL` matches your backend URL
- Check backend logs in Vercel dashboard

### "CORS error"
- Make sure `ALLOWED_ORIGINS` in backend includes your frontend URL
- Make sure both URLs use HTTPS

### "Authentication failed"
- Verify Firebase credentials in backend environment variables
- Check Firebase authorized domains include your Vercel domains

---

## Next Steps

After both are deployed and connected:

1. ✅ Test authentication
2. ✅ Test course creation
3. ✅ Test Jitsi live classes
4. ✅ Test on mobile devices
5. ✅ Set up custom domain (optional)
