# Firebase Setup Guide for FuturaAIse Academy

This guide will walk you through setting up Firebase for the FuturaAIse Academy LMS.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `futuraaise-academy` (or your preferred name)
4. Click **Continue**
5. Disable Google Analytics (optional, you can enable it later)
6. Click **Create project**
7. Wait for the project to be created, then click **Continue**

## Step 2: Enable Authentication

1. In your Firebase project, click **Authentication** in the left sidebar
2. Click **Get started**
3. Click on the **Sign-in method** tab
4. Click on **Email/Password**
5. Toggle **Enable** to ON
6. Click **Save**

## Step 3: Create Firestore Database

1. Click **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (we'll secure it later)
4. Click **Next**
5. Select your preferred Cloud Firestore location (choose one closest to your users)
6. Click **Enable**

## Step 4: Set up Firestore Security Rules

1. In Firestore Database, click on the **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Allow users to read their own data
      allow read: if request.auth != null && request.auth.uid == userId;

      // Allow admins and instructors to read all users
      allow read: if request.auth != null &&
                    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'instructor']);

      // Only allow users to update their own profile
      allow update: if request.auth != null && request.auth.uid == userId;

      // Only allow system to create users (via backend)
      allow create: if request.auth != null;

      // Only admins can delete users
      allow delete: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Courses collection
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'instructor'];
      allow update, delete: if request.auth != null &&
                              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'instructor'];
    }

    // Enrollments collection
    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'instructor'];
    }
  }
}
```

3. Click **Publish**

## Step 5: Get Frontend Firebase Configuration

1. In the Firebase Console, click the **gear icon** (Settings) next to "Project Overview"
2. Click **Project settings**
3. Scroll down to **Your apps** section
4. Click the **Web icon** (`</>`)
5. Register app nickname: `FuturaAIse Academy Web`
6. Click **Register app**
7. Copy the `firebaseConfig` object

## Step 6: Configure Frontend Environment

1. Navigate to your frontend directory:
```bash
cd frontend
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Edit the `.env` file and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=futuraaise-academy.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=futuraaise-academy
VITE_FIREBASE_STORAGE_BUCKET=futuraaise-academy.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 7: Set up Backend Firebase Admin SDK

### Option A: Using Service Account (Recommended for Production)

1. In Firebase Console, go to **Project Settings** > **Service accounts**
2. Click **Generate new private key**
3. Click **Generate key** - this will download a JSON file
4. **IMPORTANT**: Keep this file secure and never commit it to Git!

5. In your backend directory, create `.env` file:
```bash
cd backend
cp .env.example .env
```

6. Open the downloaded JSON file and copy its contents
7. Edit `.env` and add the service account as a single-line JSON string:
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"futuraaise-academy",...}
```

### Option B: Using Application Default Credentials (Easy for Development)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. In your backend `.env` file, leave `FIREBASE_SERVICE_ACCOUNT` empty:
```env
# FIREBASE_SERVICE_ACCOUNT=
```

The backend will automatically use your Firebase CLI credentials.

## Step 8: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 9: Start the Application

### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

You should see:
```
✓ Firebase initialized
✓ Server running on port 5000
✓ API available at http://localhost:5000/api/v1
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

## Step 10: Test the Application

1. Open your browser to http://localhost:3000
2. Click **Register**
3. Fill in the registration form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Role: Student
   - Password: TestPassword123
   - Confirm Password: TestPassword123
4. Click **Create account**
5. You should be redirected to the dashboard

## Verify in Firebase Console

1. Go to **Authentication** in Firebase Console
2. Click on **Users** tab
3. You should see your new user listed
4. Go to **Firestore Database**
5. You should see a `users` collection with your user document

## Security Best Practices

1. **Never commit your `.env` files** - they're already in `.gitignore`
2. **Never commit service account JSON files**
3. **Use environment variables** for all sensitive data
4. **Enable App Check** for production (protects against abuse)
5. **Set up proper Firestore security rules** (already done in Step 4)
6. **Enable MFA** for admin accounts
7. **Regular security audits** in Firebase Console

## Troubleshooting

### "Permission denied" errors
- Check Firestore security rules
- Ensure user is authenticated
- Verify user role in Firestore

### "Firebase not initialized" error
- Check `.env` files are present and configured
- Verify Firebase project ID matches
- Ensure dependencies are installed

### Authentication errors
- Verify Email/Password is enabled in Firebase Console
- Check API key is correct in frontend `.env`
- Clear browser cache and localStorage

### CORS errors
- Check `ALLOWED_ORIGINS` in backend `.env`
- Ensure frontend URL matches allowed origins

## Next Steps

Once Firebase is set up, you can:

1. **Add more authentication methods** (Google, GitHub, etc.)
2. **Set up Storage** for file uploads (course materials, profile pictures)
3. **Enable Cloud Functions** for backend logic
4. **Set up Firebase Hosting** for deployment
5. **Add Cloud Messaging** for push notifications
6. **Enable Analytics** for usage tracking

## Useful Commands

```bash
# Check Firebase project
firebase projects:list

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# View logs
firebase functions:log
```

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**Need Help?**
If you encounter any issues, check the Firebase Console for error messages and logs.
