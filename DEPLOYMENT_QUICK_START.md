# Quick Deployment Guide

## 🚀 Deploy in 3 Steps

### Step 1: Push to GitHub (5 minutes)

```bash
# Go to github.com and create a new repository named "FuturaAIse-Academy"
# Then run these commands:

git remote add origin https://github.com/YOUR_USERNAME/FuturaAIse-Academy.git
git push -u origin main
```

### Step 2: Deploy Backend to Railway (10 minutes)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `FuturaAIse-Academy` repository
4. Click "Add variables" and add these:

```
PORT=5001
NODE_ENV=production
FIREBASE_PROJECT_ID=futuraaise-academy
FIREBASE_CLIENT_EMAIL=(get from Firebase Console)
FIREBASE_PRIVATE_KEY=(get from Firebase Console)
FRONTEND_URL=https://your-app.vercel.app
JITSI_DOMAIN=meet.jit.si
```

5. In Settings → set **Root Directory** to `backend`
6. Click "Deploy"
7. **Copy your backend URL** (e.g., `https://futuraaise-academy-production.up.railway.app`)

### Step 3: Deploy Frontend to Vercel (10 minutes)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New" → "Project"
3. Import `FuturaAIse-Academy` repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Vite

5. Add Environment Variables (click "Environment Variables"):

```
VITE_FIREBASE_API_KEY=(from Firebase Console)
VITE_FIREBASE_AUTH_DOMAIN=futuraaise-academy.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=futuraaise-academy
VITE_FIREBASE_STORAGE_BUCKET=futuraaise-academy.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=(from Firebase Console)
VITE_FIREBASE_APP_ID=(from Firebase Console)

VITE_API_URL=https://YOUR-RAILWAY-URL/api/v1
VITE_SOCKET_URL=https://YOUR-RAILWAY-URL
```

Replace `YOUR-RAILWAY-URL` with the URL from Step 2.

6. Click "Deploy"

### Step 4: Update Firebase Settings (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your domains:
   - Your Vercel domain: `your-app.vercel.app`
   - Your Railway domain: `your-app.railway.app`

## ✅ Done!

Your app is now live! Visit your Vercel URL to see it in action.

## 🧪 Testing on Real Devices

1. Open your Vercel URL on your phone: `https://your-app.vercel.app`
2. Log in as instructor on one device
3. Log in as student on another device
4. Create a WebRTC class and test the video/audio

## 📊 Where to Find Your URLs

### Backend (Railway):
- Dashboard: railway.app/project/YOUR_PROJECT
- URL: Settings → Generate Domain

### Frontend (Vercel):
- Dashboard: vercel.com/YOUR_PROJECT
- URL: Automatically shown after deployment

## 🔧 Troubleshooting

### "Cannot connect to server"
- Check that `VITE_API_URL` in Vercel matches your Railway URL
- Ensure Railway deployment is successful (green checkmark)

### "WebRTC not connecting"
- Verify `VITE_SOCKET_URL` in Vercel
- Check browser console for errors
- Ensure both devices are on HTTPS

### "Firebase auth error"
- Verify all Firebase env variables are correct
- Check authorized domains in Firebase Console

## 📱 For Best WebRTC Performance

- Use HTTPS (automatically provided by Vercel/Railway)
- Test on real devices, not just localhost
- Ensure good internet connection on both sides
- Consider adding TURN server for production (see DEPLOYMENT.md)

## 💰 Cost

Everything can run on free tiers:
- ✅ Vercel: Free for personal projects
- ✅ Railway: $5/month free credit
- ✅ Firebase: Free tier (Spark plan)

Total: **$0/month** for testing and development!

## 🎯 Next Steps

1. Test all features on production
2. Set up custom domain (optional)
3. Configure email notifications
4. Add analytics tracking
5. Review DEPLOYMENT.md for advanced configuration
