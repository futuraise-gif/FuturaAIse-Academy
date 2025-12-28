# Firebase Deployment Guide - FuturaAIse Academy

## Quick Deployment Steps

### Step 1: Login to Firebase

```bash
firebase login
```

This will open a browser window for you to authenticate with your Google account.

### Step 2: Use Your Firebase Project

```bash
firebase use fir-academy-8f2c4
```

This sets the active project to your Firebase project ID.

### Step 3: Deploy to Firebase Functions

```bash
firebase deploy --only functions
```

This will:
1. Build your TypeScript backend code
2. Deploy the API as a Firebase Function
3. Give you a URL like: `https://us-central1-fir-academy-8f2c4.cloudfunctions.net/api`

### Step 4: Deploy Firestore Rules (Optional)

```bash
firebase deploy --only firestore:rules
```

### Step 5: Get Your Functions URL

After deployment, you'll see output like:

```
✔  functions[api(us-central1)]: Successful create operation.
Function URL (api): https://us-central1-fir-academy-8f2c4.cloudfunctions.net/api
```

**Copy this URL!** You'll need it for Vercel environment variables.

## Update Vercel Environment Variables

Once you have your Firebase Functions URL, update these in Vercel:

```
VITE_API_URL=https://us-central1-fir-academy-8f2c4.cloudfunctions.net/api/api/v1
```

Note: The `/api` appears twice because:
1. First `/api` is the function name
2. Second `/api/v1` is the route prefix in your Express app

## Important Notes About WebRTC

⚠️ **Firebase Functions does NOT support WebSocket connections (Socket.IO)** because Functions are stateless and serverless.

For WebRTC functionality, you have two options:

### Option 1: Use Jitsi for Video Calls (Current Implementation)
Your live classes already use Jitsi Meet, which handles WebRTC externally. This will work fine with Firebase Functions for the API.

### Option 2: Deploy WebRTC Signaling Server Separately
If you want custom WebRTC classes, deploy the WebRTC signaling server to:
- **Railway** (recommended): Free tier available
- **Render**: Free tier available
- **Google Cloud Run**: Supports WebSockets

For now, stick with Option 1 (Jitsi) as it's already implemented.

## Environment Variables for Firebase Functions

Firebase Functions reads environment variables differently. Set them using:

```bash
firebase functions:config:set \
  firebase.project_id="fir-academy-8f2c4" \
  firebase.client_email="YOUR_SERVICE_ACCOUNT_EMAIL" \
  firebase.private_key="YOUR_PRIVATE_KEY" \
  jitsi.domain="meet.jit.si"
```

**OR** use a `.env` file (recommended for local development):

Create `backend/.env`:
```
FIREBASE_PROJECT_ID=fir-academy-8f2c4
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@fir-academy-8f2c4.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
JITSI_DOMAIN=meet.jit.si
ALLOWED_ORIGINS=https://futura-aise-academy.vercel.app,https://your-app.vercel.app
```

## Testing Your Deployment

1. **Test the health check**:
   ```bash
   curl https://us-central1-fir-academy-8f2c4.cloudfunctions.net/api/health
   ```

2. **Test an API endpoint**:
   ```bash
   curl https://us-central1-fir-academy-8f2c4.cloudfunctions.net/api/api/v1/health
   ```

## Deployment Commands Cheat Sheet

```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Firestore indexes
firebase deploy --only firestore:indexes

# View logs
firebase functions:log

# View function details
firebase functions:list
```

## Cost

Firebase Functions pricing:
- **Free tier**: 2 million invocations/month
- **Paid tier**: $0.40 per million invocations

For a learning platform with moderate usage, you'll likely stay within the free tier.

## Troubleshooting

### "Permission denied" error
Make sure you're logged in:
```bash
firebase login --reauth
```

### "No project active" error
Set your project:
```bash
firebase use fir-academy-8f2c4
```

### "Build failed" error
Make sure TypeScript compiles:
```bash
cd backend
npm run build
```

### CORS errors
Update the `allowedOrigins` array in `backend/src/index.ts` to include your Vercel domain.

## Next Steps After Deployment

1. ✅ Copy your Firebase Functions URL
2. ✅ Update `VITE_API_URL` in Vercel
3. ✅ Redeploy frontend on Vercel
4. ✅ Test the application on real devices
5. ✅ Add your Vercel domain to Firebase authorized domains
