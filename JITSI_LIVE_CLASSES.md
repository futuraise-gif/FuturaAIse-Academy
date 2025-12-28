# Live Classes with Jitsi Meet - Complete Guide

## Overview
Your Learning Management System now uses **Jitsi Meet** for live video classes - completely free, no API keys required!

## ✅ Features Implemented

### For Instructors:
- ✅ Schedule live classes from the Instructor Panel
- ✅ Start classes with one click
- ✅ Full Jitsi Meet interface with:
  - Video/audio controls
  - Screen sharing
  - Chat
  - Recording (browser-based)
  - Participant management
  - Reactions and hand raising
  - Virtual backgrounds

### For Students:
- ✅ View upcoming classes
- ✅ Join live classes when they start
- ✅ Full participant features

## 🚀 How to Use

### As an Instructor:

#### 1. Schedule a Live Class
1. Navigate to **Live Classes** in the sidebar
2. Click **"+ Schedule Live Class"**
3. Fill in the form:
   - Select your course
   - Enter class title
   - Add description (optional)
   - Set date and time
   - Set duration (15-240 minutes)
4. Click **"Schedule Class"**

#### 2. Start a Live Class
1. When it's time for class, go to **Live Classes**
2. Find your scheduled class
3. Click **"Start Class"**
4. You'll join the Jitsi meeting room
5. Students can now join

#### 3. During the Class
Available controls:
- **🎤 Microphone**: Toggle audio on/off
- **📹 Camera**: Toggle video on/off
- **🖥️ Screen Share**: Share your screen
- **💬 Chat**: Send messages to participants
- **✋ Raise Hand**: Request attention
- **⚙️ Settings**: Adjust audio/video settings
- **📹 Record**: Start local recording
- **🎨 Background**: Virtual background effects

#### 4. End the Class
1. Click **"Leave Class"** button
2. Or close the browser tab
3. Update class status to "ended" in the dashboard

### As a Student:

#### 1. View Upcoming Classes
1. Go to **Live Classes** (or assigned location)
2. See all scheduled classes for your courses

#### 2. Join a Live Class
1. When class is live, click **"Join"**
2. You'll enter the Jitsi room
3. Enable your camera/microphone as needed

## 🎥 Recording Classes

Jitsi offers **local recording** (free):

1. During class, click the **three dots menu** (...)
2. Select **"Start recording"**
3. Recording saves to your computer
4. Later, you can upload to your preferred storage
5. Share the link with students

### Alternative: Cloud Recording
For automatic cloud recording, you can:
- Self-host Jitsi (free, requires server)
- Use Jitsi-as-a-Service premium plans

## 🔧 Technical Details

### Backend
- **Controller**: `/backend/src/controllers/live-class.controller.ts`
- **Routes**: `/backend/src/routes/live-class.routes.ts`
- **Database**: Firebase Firestore collection `live_classes`

### Frontend
- **Instructor Dashboard**: `/frontend/src/pages/instructor/LiveClasses.tsx`
- **Video Room**: `/frontend/src/pages/LiveClassRoom.tsx`
- **Jitsi Integration**: iframe embed (no SDK needed)

### API Endpoints
```
POST   /api/v1/live-classes              - Create a class
GET    /api/v1/live-classes              - List all classes
GET    /api/v1/live-classes/:id          - Get class details
POST   /api/v1/live-classes/:id/join     - Join a class
PUT    /api/v1/live-classes/:id/status   - Update status
```

### Firestore Schema
```typescript
{
  id: string;
  course_id: string;
  instructor_id: string;
  title: string;
  description: string;
  scheduled_at: string; // ISO date
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  room_id: string;      // Jitsi room name
  room_code: string;    // Full Jitsi URL
  recording_url?: string;
  created_at: string;
  updated_at: string;
}
```

## 🆓 Why Jitsi?

### Advantages:
- ✅ **100% Free** - No limits, no API keys
- ✅ **No Sign-up Required** - Works immediately
- ✅ **Open Source** - Fully transparent
- ✅ **Privacy-focused** - No data collection
- ✅ **Scalable** - Can self-host for unlimited users
- ✅ **Feature-rich** - Screen share, recording, reactions, etc.
- ✅ **Mobile Apps** - iOS and Android available
- ✅ **Browser-based** - No installation needed

### vs 100ms/Agora/Daily:
| Feature | Jitsi (Free) | 100ms (Free Tier) | Agora | Daily |
|---------|--------------|-------------------|-------|-------|
| Cost | $0 forever | 10k min/month | Paid | Limited free |
| Setup | No API keys | Requires signup | Requires signup | Requires signup |
| Participants | Unlimited* | 100 | Paid plans | 5-10 |
| Time Limit | None | None | Paid plans | 45 min |
| Recording | Local (free) | Cloud (credits) | Paid | Limited |

*Practical limit ~75-100 for public server, unlimited if self-hosted

## 🔒 Security & Privacy

Jitsi provides:
- End-to-end encryption (optional)
- Password-protected rooms (optional)
- Lobby/waiting room (optional)
- Moderator controls
- Kick participants
- Mute all

To enable:
- During class, click **"Security Options"**
- Set a password
- Enable lobby mode

## 🚀 Upgrade Options (Optional)

If you need more control:

### Option 1: Self-Host Jitsi (Free)
- Install on your own server
- Unlimited participants
- Full control over data
- Custom branding
- Guide: https://jitsi.github.io/handbook/docs/devops-guide/

### Option 2: Jitsi-as-a-Service
- Managed hosting by 8x8
- Custom domain
- Advanced features
- Priority support
- Pricing: https://jaas.8x8.vc/

## 🎯 Next Steps

### Immediate Use:
1. ✅ System is ready - no setup needed!
2. ✅ Go to Instructor Panel → Live Classes
3. ✅ Schedule your first class
4. ✅ Start teaching!

### Optional Enhancements:
- Add email notifications for upcoming classes
- Implement student attendance tracking
- Create a recordings library page
- Add calendar integration
- Build a student live class dashboard

## 📱 Mobile Support

Students and instructors can join from mobile:
- **iOS**: https://apps.apple.com/us/app/jitsi-meet/id1165103905
- **Android**: https://play.google.com/store/apps/details?id=org.jitsi.meet

Just open the class link in the app!

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions
- Allow camera/microphone access
- Try a different browser (Chrome recommended)

### Can't Join Class
- Verify you're enrolled in the course
- Check class status is "live"
- Clear browser cache

### Poor Video Quality
- Check internet connection
- Reduce video quality in settings
- Turn off video, use audio only
- Close other bandwidth-heavy apps

## 📚 Resources

- Jitsi User Guide: https://jitsi.github.io/handbook/
- Jitsi Community: https://community.jitsi.org/
- Report Issues: https://github.com/jitsi/jitsi-meet/issues

---

**Created**: December 2025
**Platform**: Jitsi Meet (Open Source)
**Cost**: $0 - Completely Free
**Setup Time**: 0 minutes (Already integrated!)
