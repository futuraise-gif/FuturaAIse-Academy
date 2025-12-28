# Live Classes - Instructor Guide

## Overview
A complete live video class management system has been integrated into the Instructor Panel, allowing you to schedule, manage, and conduct live video classes for your students.

## Features Implemented

### For Instructors:

#### 1. **Schedule Live Classes**
- Create new live classes from the Instructor Panel
- Select course, title, description
- Set date, time, and duration
- Automatic room creation in 100ms

#### 2. **Manage Live Classes**
View all your classes in one dashboard:
- **Upcoming** - Scheduled classes ready to start
- **Live Now** - Currently running classes
- **Completed** - Past classes with recordings

#### 3. **Start & Conduct Classes**
- One-click "Start Class" button for scheduled sessions
- Automatically joins you as instructor with full permissions
- Access to:
  - Video/audio controls
  - Screen sharing
  - Recording (start/stop)
  - Chat with students
  - Participant management

#### 4. **End Classes**
- End live classes when done
- Recordings automatically saved
- Students can access recordings later

## How to Use

### 1. Navigate to Live Classes
- Login as Instructor
- Click **"Live Classes" 🎥** in the sidebar
- You'll see your dashboard with stats

### 2. Schedule a New Class
```
1. Click "+ Schedule Live Class" button
2. Select the course
3. Enter class title (e.g., "Week 1: Introduction to React")
4. Add description (optional)
5. Set date and time
6. Set duration (15-240 minutes)
7. Click "Schedule Class"
```

### 3. Start a Live Class
```
When it's time for class:
1. Find the scheduled class in your list
2. Click "Start Class" button
3. You'll be taken to the live classroom
4. Students can now join
```

### 4. During the Class
As an instructor, you can:
- **Toggle video/audio** - Bottom control bar
- **Share screen** - Click screen share button (🖥️)
- **Start recording** - Click "Start Recording"
- **Chat with students** - Use chat sidebar
- **See all participants** - Video grid shows everyone
- **Mute/remove students** - (if needed)

### 5. End the Class
```
1. Click "End Class" button (red button)
2. Recording will be stopped automatically
3. Recording URL will be saved
4. Students can no longer join
```

## Student Experience

### How Students Join:
1. Students see "Live Classes" in their sidebar
2. They see all upcoming classes for courses they're enrolled in
3. When class is live, they click "Join" button
4. They enter the video room
5. They can:
   - Enable/disable their video/audio
   - See instructor's screen share
   - Participate in chat
   - Ask questions

### Recordings:
- After class ends, recording URL is saved
- Students can access recordings from class list
- Click "📹 View Recording" to watch

## Class Status Flow

```
scheduled → live → ended
     ↓        ↓
  cancelled  cancelled
```

- **Scheduled**: Class created, waiting to start
- **Live**: Class in progress, students can join
- **Ended**: Class finished, recording available
- **Cancelled**: Class cancelled (manual)

## Dashboard Stats

Your instructor dashboard shows:
- **Upcoming Classes Count** - How many scheduled
- **Live Now Count** - Currently running
- **Completed Count** - Total finished classes

## Filter Tabs

Quickly filter classes by status:
- **All** - See everything
- **Scheduled** - Only upcoming classes
- **Live** - Currently running
- **Ended** - Past classes with recordings

## API Endpoints Used

The instructor panel uses these endpoints:
- `POST /api/v1/live-classes` - Create class
- `GET /api/v1/live-classes` - List all classes
- `POST /api/v1/live-classes/:id/join` - Join as instructor
- `PUT /api/v1/live-classes/:id/status` - Update status
- `POST /api/v1/live-classes/:id/recording/start` - Start recording
- `POST /api/v1/live-classes/:id/recording/stop` - Stop recording

## Files Created

### Frontend:
- `/frontend/src/pages/instructor/LiveClasses.tsx` - Main management page
- `/frontend/src/pages/LiveClassRoom.tsx` - Video classroom interface

### Backend:
- `/backend/src/controllers/live-class.controller.ts` - API logic
- `/backend/src/routes/live-class.routes.ts` - API routes

### Navigation:
- Updated `/frontend/src/components/Sidebar.tsx` - Added "Live Classes" link
- Updated `/frontend/src/App.tsx` - Added route

## Access Permissions

### Instructors Can:
- ✅ Create live classes for their courses
- ✅ Start, join, and end classes
- ✅ Share screen
- ✅ Record classes
- ✅ See all participants
- ✅ Manage student permissions

### Students Can:
- ✅ View upcoming classes for enrolled courses
- ✅ Join when class is live
- ✅ Enable video/audio
- ✅ Participate in chat
- ✅ View screen shares
- ✅ Access recordings after class

### Admins Can:
- ✅ Everything instructors can do
- ✅ Create classes for any course
- ✅ Manage all classes

## Next Steps

### Before Using:
1. **Setup 100ms Account** (See LIVE_CLASS_SETUP.md)
   - Sign up at https://www.100ms.live/
   - Create template with instructor/student roles
   - Get credentials

2. **Add to Backend .env**:
   ```env
   HMS_APP_ACCESS_KEY=your_key
   HMS_APP_SECRET=your_secret
   HMS_TEMPLATE_ID=your_template_id
   ```

3. **Test**:
   - Login as instructor
   - Create a test class
   - Start the class
   - Login as student (different browser)
   - Join the class

### Optional Enhancements:
- Email notifications for upcoming classes
- Calendar integration
- Waiting room for students
- Polls and quizzes during class
- Breakout rooms
- Class attendance tracking

## Troubleshooting

### Can't create class
- Check that you have courses created
- Verify 100ms credentials in .env
- Check browser console for errors

### Can't start class
- Ensure class is in "scheduled" status
- Check 100ms dashboard for room status
- Verify network connection

### Recording not working
- Check 100ms template has recording enabled
- Verify you have recording credits
- Check if recording feature is in your plan

## Support

For 100ms specific issues:
- Documentation: https://www.100ms.live/docs
- Dashboard: https://dashboard.100ms.live
- Support: support@100ms.live

---

**Note**: The system is fully functional and ready to use once you configure your 100ms credentials in the backend .env file.
