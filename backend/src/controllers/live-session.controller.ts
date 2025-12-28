import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthRequest, UserRole } from '../types';
import {
  LiveSession,
  CreateLiveSessionDTO,
  UpdateLiveSessionDTO,
  LiveSessionStatus,
  LiveSessionPlatform,
} from '../types/live-session.types';

export class LiveSessionController {
  /**
   * Create a new live session
   */
  static async createSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const data: CreateLiveSessionDTO = req.body;

      // Verify instructor owns the course
      const courseDoc = await db.collection('courses').doc(data.course_id).get();
      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data();
      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized to create sessions for this course' });
        return;
      }

      // Generate Jitsi meeting URL if platform is Jitsi
      let meetingUrl = data.meeting_url || '';
      let meetingId = '';

      if (data.platform === LiveSessionPlatform.JITSI) {
        meetingId = `${data.course_id}-${Date.now()}`;
        meetingUrl = `https://meet.jit.si/${meetingId}`;
      }

      // Get instructor name
      const userDoc = await db.collection('users').doc(user.userId).get();
      const userData = userDoc.data();

      // Get module title if module_id provided
      let moduleTitle = '';
      if (data.module_id) {
        const moduleDoc = await db.collection('modules').doc(data.module_id).get();
        if (moduleDoc.exists) {
          moduleTitle = moduleDoc.data()?.title || '';
        }
      }

      const session: any = {
        course_id: data.course_id,
        course_title: course?.title || '',
        instructor_id: user.userId,
        instructor_name: `${userData?.first_name} ${userData?.last_name}`,
        title: data.title,
        description: data.description,
        platform: data.platform,
        meeting_url: meetingUrl,
        meeting_id: meetingId,
        scheduled_start: data.scheduled_start,
        scheduled_end: data.scheduled_end,
        status: LiveSessionStatus.SCHEDULED,
        recording_enabled: data.recording_enabled || false,
        attendees: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Only add optional fields if they have values
      if (data.module_id) {
        session.module_id = data.module_id;
        session.module_title = moduleTitle;
      }
      if (data.meeting_password) {
        session.meeting_password = data.meeting_password;
      }
      if (data.max_participants) {
        session.max_participants = data.max_participants;
      }

      const sessionRef = await db.collection('live_sessions').add(session);

      res.status(201).json({
        message: 'Live session created successfully',
        session: {
          id: sessionRef.id,
          ...session,
        },
      });
    } catch (error: any) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create live session' });
    }
  }

  /**
   * Get all sessions for a course
   */
  static async getCourseSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { status } = req.query;

      let query = db.collection('live_sessions').where('course_id', '==', courseId);

      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();

      const sessions = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a: any, b: any) => {
          return new Date(b.scheduled_start).getTime() - new Date(a.scheduled_start).getTime();
        });

      res.json({ sessions });
    } catch (error: any) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }

  /**
   * Get session details
   */
  static async getSessionDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const doc = await db.collection('live_sessions').doc(sessionId).get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      res.json({
        session: {
          id: doc.id,
          ...doc.data(),
        },
      });
    } catch (error: any) {
      console.error('Get session details error:', error);
      res.status(500).json({ error: 'Failed to fetch session details' });
    }
  }

  /**
   * Update session
   */
  static async updateSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { sessionId } = req.params;
      const updates: UpdateLiveSessionDTO = req.body;

      const sessionDoc = await db.collection('live_sessions').doc(sessionId).get();

      if (!sessionDoc.exists) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      const session = sessionDoc.data();

      // Verify instructor owns the session
      if (session?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      await db.collection('live_sessions').doc(sessionId).update({
        ...updates,
        updated_at: new Date().toISOString(),
      });

      const updatedDoc = await db.collection('live_sessions').doc(sessionId).get();

      res.json({
        message: 'Session updated successfully',
        session: {
          id: updatedDoc.id,
          ...updatedDoc.data(),
        },
      });
    } catch (error: any) {
      console.error('Update session error:', error);
      res.status(500).json({ error: 'Failed to update session' });
    }
  }

  /**
   * Start live session
   */
  static async startSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { sessionId } = req.params;

      const sessionDoc = await db.collection('live_sessions').doc(sessionId).get();

      if (!sessionDoc.exists) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      const session = sessionDoc.data();

      if (session?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      await db.collection('live_sessions').doc(sessionId).update({
        status: LiveSessionStatus.LIVE,
        actual_start: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const updatedDoc = await db.collection('live_sessions').doc(sessionId).get();

      res.json({
        message: 'Session started successfully',
        session: {
          id: updatedDoc.id,
          ...updatedDoc.data(),
        },
      });
    } catch (error: any) {
      console.error('Start session error:', error);
      res.status(500).json({ error: 'Failed to start session' });
    }
  }

  /**
   * End live session
   */
  static async endSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { sessionId } = req.params;

      const sessionDoc = await db.collection('live_sessions').doc(sessionId).get();

      if (!sessionDoc.exists) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      const session = sessionDoc.data();

      if (session?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      await db.collection('live_sessions').doc(sessionId).update({
        status: LiveSessionStatus.ENDED,
        actual_end: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      res.json({ message: 'Session ended successfully' });
    } catch (error: any) {
      console.error('End session error:', error);
      res.status(500).json({ error: 'Failed to end session' });
    }
  }

  /**
   * Join session (student)
   */
  static async joinSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { sessionId } = req.params;

      const sessionDoc = await db.collection('live_sessions').doc(sessionId).get();

      if (!sessionDoc.exists) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      const session = sessionDoc.data();

      // Check if session is live
      if (session?.status !== LiveSessionStatus.LIVE) {
        res.status(400).json({ error: 'Session is not live yet' });
        return;
      }

      // Check if user is enrolled in the course
      const enrollmentDoc = await db
        .collection('courses')
        .doc(session.course_id)
        .collection('enrollments')
        .doc(user.userId)
        .get();

      if (!enrollmentDoc.exists && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'You are not enrolled in this course' });
        return;
      }

      // Add user to attendees if not already present
      const attendees = session.attendees || [];
      if (!attendees.includes(user.userId)) {
        attendees.push(user.userId);
        await db.collection('live_sessions').doc(sessionId).update({
          attendees,
          updated_at: new Date().toISOString(),
        });
      }

      res.json({
        message: 'Joined session successfully',
        session: {
          id: sessionId,
          meeting_url: session.meeting_url,
          meeting_password: session.meeting_password,
          title: session.title,
          instructor_name: session.instructor_name,
        },
      });
    } catch (error: any) {
      console.error('Join session error:', error);
      res.status(500).json({ error: 'Failed to join session' });
    }
  }

  /**
   * Get upcoming sessions for student
   */
  static async getUpcomingSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      // Get all courses
      const coursesSnapshot = await db.collection('courses').get();

      // Filter courses where user is enrolled
      const courseIds: string[] = [];
      for (const courseDoc of coursesSnapshot.docs) {
        const enrollmentDoc = await db
          .collection('courses')
          .doc(courseDoc.id)
          .collection('enrollments')
          .doc(user.userId)
          .get();

        if (enrollmentDoc.exists && enrollmentDoc.data()?.status === 'active') {
          courseIds.push(courseDoc.id);
        }
      }

      if (courseIds.length === 0) {
        res.json({ sessions: [] });
        return;
      }

      // Get upcoming sessions for enrolled courses
      const sessions: any[] = [];

      for (const courseId of courseIds) {
        const snapshot = await db
          .collection('live_sessions')
          .where('course_id', '==', courseId)
          .where('status', 'in', [LiveSessionStatus.SCHEDULED, LiveSessionStatus.LIVE])
          .get();

        snapshot.docs.forEach((doc) => {
          sessions.push({
            id: doc.id,
            ...doc.data(),
          });
        });
      }

      // Sort by scheduled start time
      sessions.sort((a, b) => {
        return new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime();
      });

      res.json({ sessions });
    } catch (error: any) {
      console.error('Get upcoming sessions error:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming sessions' });
    }
  }

  /**
   * Delete session
   */
  static async deleteSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { sessionId } = req.params;

      const sessionDoc = await db.collection('live_sessions').doc(sessionId).get();

      if (!sessionDoc.exists) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      const session = sessionDoc.data();

      if (session?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      await db.collection('live_sessions').doc(sessionId).delete();

      res.json({ message: 'Session deleted successfully' });
    } catch (error: any) {
      console.error('Delete session error:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }
}
