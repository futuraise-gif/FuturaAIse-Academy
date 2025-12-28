# Quick Start Guide - FuturaAIse Academy LMS

Get up and running with Firebase in 10 minutes!

## Prerequisites

- Node.js (v18+)
- npm
- A Google account (for Firebase)

## Step 1: Set up Firebase (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it `futuraaise-academy`
4. Disable Google Analytics (for now)
5. Click **Create project**

### Enable Authentication
1. Click **Authentication** → **Get started**
2. Click **Email/Password** → Enable → Save

### Create Firestore
1. Click **Firestore Database** → **Create database**
2. Choose **Test mode** → Next
3. Select location → Enable

### Get Web Config
1. Click **Settings** (gear icon) → **Project settings**
2. Scroll to **Your apps** → Click Web icon `</>`
3. Register app: `FuturaAIse Academy Web`
4. Copy the `firebaseConfig` values

## Step 2: Configure Frontend (2 minutes)

```bash
cd FuturaAIse-Academy/frontend
cp .env.example .env
```

Edit `frontend/.env` with your Firebase config:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=futuraaise-academy.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=futuraaise-academy
VITE_FIREBASE_STORAGE_BUCKET=futuraaise-academy.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123...
VITE_FIREBASE_APP_ID=1:123...
```

Install dependencies:
```bash
npm install
```

## Step 3: Configure Backend (2 minutes)

### Easy Way (Development)
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

cd ../backend
cp .env.example .env
npm install
```

Your `backend/.env` can be minimal:
```env
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000
```

The backend will use your Firebase CLI credentials automatically!

### Production Way (Optional)
1. In Firebase Console: Settings → Service accounts
2. Click **Generate new private key** → Download JSON
3. Copy JSON content to `backend/.env`:
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...paste entire JSON...}
```

## Step 4: Start the Application (1 minute)

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## Step 5: Test It! (30 seconds)

1. Open http://localhost:3000
2. Click **Register**
3. Create an account:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: Test123456
   - Role: Student
4. Click **Create account**
5. You're in! 🎉

## Verify in Firebase

Check Firebase Console:
- **Authentication** → You'll see your user
- **Firestore** → You'll see `users` collection

## What's Next?

Now that it's running, you can:

1. **Add more users** with different roles (Student, Instructor, Admin)
2. **Customize the UI** in `frontend/src/pages/`
3. **Add features** like courses, assignments, etc.
4. **Deploy** to Firebase Hosting

## Troubleshooting

**Frontend won't start?**
- Check Node.js version: `node --version` (need v18+)
- Delete `node_modules` and run `npm install` again

**Backend errors?**
- Run `firebase login` if using default credentials
- Check `.env` file exists and has correct values

**Can't register?**
- Verify Email/Password is enabled in Firebase Auth
- Check browser console for errors
- Verify Firebase config in frontend `.env`

**Need detailed help?**
See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for comprehensive guide.

## Commands Cheat Sheet

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Install all dependencies
cd backend && npm install && cd ../frontend && npm install

# Build for production
cd backend && npm run build
cd frontend && npm run build

# Firebase login
firebase login

# View Firebase project
firebase projects:list
```

---

**You're all set!** Frontend: http://localhost:3000 | Backend: http://localhost:5000
