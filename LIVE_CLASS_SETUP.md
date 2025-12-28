# Live Class Setup Guide - 100ms Integration

## Overview
Your Learning Management System now has fully integrated live video classes with:
- ✅ Real-time video/audio
- ✅ Screen sharing
- ✅ Recording capabilities
- ✅ Chat functionality
- ✅ Q&A support
- ✅ Interactive whiteboard support

## Step 1: Create 100ms Account

1. Go to https://www.100ms.live/
2. Sign up for a free account
3. Navigate to the Dashboard

## Step 2: Create a Template

1. In the 100ms dashboard, click "Templates"
2. Click "Create Template"
3. Configure roles:

### Instructor Role:
- **Permissions**:
  - ✅ Publish audio
  - ✅ Publish video
  - ✅ Publish screen
  - ✅ Mute others
  - ✅ Remove participants
  - ✅ End room
  - ✅ Start/stop recording
- **Priority**: High
- **Name**: instructor

### Student Role:
- **Permissions**:
  - ✅ Publish audio
  - ✅ Publish video
  - ❌ Publish screen (optional)
  - ❌ Mute others
  - ❌ Remove participants
- **Priority**: Normal
- **Name**: student

4. Enable these features in template settings:
   - **Recording**: ON (Cloud Recording)
   - **RTMP Streaming**: ON (optional)
   - **Chat**: ON
   - **Hand Raise**: ON
   - **Whiteboard**: ON

5. Save the template and note the **Template ID**

## Step 3: Get API Credentials

1. Go to "Developer" section in 100ms dashboard
2. Click on your app
3. Copy the following:
   - **App Access Key**
   - **App Secret**
   - **Template ID** (from Step 2)

## Step 4: Configure Backend Environment

Add these variables to `/backend/.env`:

```env
# 100ms Configuration
HMS_APP_ACCESS_KEY=your_app_access_key_here
HMS_APP_SECRET=your_app_secret_here
HMS_TEMPLATE_ID=your_template_id_here
```

## Step 5: Add Route to Frontend

Update `frontend/src/App.tsx` to include the live class route:

```typescript
import LiveClassRoom from './pages/LiveClassRoom';

// Add this route:
<Route path="/live-class/:classId" element={
  <ProtectedRoute allowedRoles={[UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN]}>
    <LiveClassRoom />
  </ProtectedRoute>
} />
```

## Step 6: Create HMS Provider Wrapper

The 100ms SDK needs a provider. Update `frontend/src/main.tsx`:

```typescript
import { HMSRoomProvider } from '@100mslive/react-sdk';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <HMSRoomProvider>
        <App />
      </HMSRoomProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

## API Endpoints Created

### Create Live Class
```
POST /api/v1/live-classes
Headers: Authorization: Bearer <token>
Body: {
  "course_id": "course_123",
  "title": "Introduction to React",
  "description": "Learn React fundamentals",
  "scheduled_at": "2025-01-15T10:00:00Z",
  "duration_minutes": 60
}
```

### Get All Live Classes
```
GET /api/v1/live-classes?course_id=course_123
Headers: Authorization: Bearer <token>
```

### Join Live Class
```
POST /api/v1/live-classes/:classId/join
Headers: Authorization: Bearer <token>
Response: {
  "token": "auth_token_for_100ms",
  "room_id": "room_id",
  "room_code": "room_code",
  "role": "instructor" | "student"
}
```

### Start Recording
```
POST /api/v1/live-classes/:classId/recording/start
Headers: Authorization: Bearer <token>
```

### Stop Recording
```
POST /api/v1/live-classes/:classId/recording/stop
Headers: Authorization: Bearer <token>
Response: {
  "recording_url": "https://..."
}
```

## Features Implemented

### For Instructors:
- Create and schedule live classes
- Start/stop video and audio
- Share screen
- Start/stop recording
- Control participant permissions
- Send messages in chat
- See all participants

### For Students:
- Join scheduled live classes
- Enable/disable video and audio
- View instructor's screen share
- Participate in chat
- Raise hand (if template configured)

## Usage Example

### 1. Instructor Creates a Class:
```javascript
const response = await axios.post('/api/v1/live-classes', {
  course_id: 'course_123',
  title: 'Week 1: Introduction',
  scheduled_at: '2025-01-15T10:00:00Z',
  duration_minutes: 90
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 2. Student Joins the Class:
Navigate to `/live-class/{classId}` and the component will:
- Fetch class details
- Get authentication token
- Join the 100ms room
- Display video interface

## Firestore Schema

The `live_classes` collection stores:
```typescript
{
  id: string;                    // Unique class ID
  course_id: string;             // Associated course
  instructor_id: string;         // Instructor UID
  title: string;                 // Class title
  description: string;           // Class description
  scheduled_at: string;          // ISO datetime
  duration_minutes: number;      // Duration
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  room_id: string;               // 100ms room ID
  room_code: string;             // 100ms room code
  recording_url?: string;        // Recording URL after class
  created_at: string;            // Creation timestamp
  updated_at: string;            // Last update timestamp
}
```

## Next Steps

1. **Add to Sidebar Navigation**:
   - Add "Live Classes" menu item
   - Show upcoming classes
   - Show recording library

2. **Create Management UI**:
   - Build a page to create/schedule classes
   - Show upcoming/past classes list
   - Allow students to see their enrolled class schedules

3. **Add Notifications**:
   - Send notification 15 mins before class starts
   - Notify when recording is available

4. **Recording Storage**:
   - Recordings are stored by 100ms
   - URLs are saved in Firestore
   - Create a recordings library page

## Troubleshooting

### "Failed to join class"
- Check that HMS_APP_ACCESS_KEY and HMS_APP_SECRET are set correctly
- Verify the user is enrolled in the course (for students)
- Check browser console for detailed errors

### Video/Audio not working
- Ensure browser permissions for camera/microphone
- Check if user's device has a camera/microphone
- Try in a different browser (Chrome recommended)

### Recording not starting
- Verify template has recording enabled
- Check instructor permissions in template
- Ensure 100ms account has recording credits

## Pricing

100ms Free Tier includes:
- 10,000 minutes/month
- Up to 100 participants per room
- Recording & storage (limited)
- All features enabled

For production, consider upgrading based on usage.

## Support

- 100ms Docs: https://www.100ms.live/docs
- 100ms Discord: https://100ms.live/discord
- React SDK: https://www.100ms.live/docs/react/v2/guides/react-quickstart

---

Created: December 2025
Integration: 100ms + Firebase + React
