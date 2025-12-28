import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
import * as admin from 'firebase-admin';
import { UserRole } from '../types';
import {
  AttendanceRecord,
  MarkAttendanceDTO,
  BulkAttendanceDTO,
  AttendanceStats,
  AttendanceStatus,
  AttendanceMethod,
} from '../types/attendance.types';

const db = admin.firestore();

export class InstructorAttendanceController {
  /**
   * Mark attendance for a student
   */
  static async markAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const data: MarkAttendanceDTO = req.body;

      if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only instructors can mark attendance' });
        return;
      }

      // Verify course ownership
      const courseDoc = await db.collection('courses').doc(data.course_id).get();
      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data();
      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      // Get student info
      const studentDoc = await db.collection('users').doc(data.student_id).get();
      if (!studentDoc.exists) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      const student = studentDoc.data();

      const now = new Date().toISOString();
      const attendance: Omit<AttendanceRecord, 'id'> = {
        student_id: data.student_id,
        student_name: `${student?.first_name} ${student?.last_name}`,
        student_email: student?.email || '',
        course_id: data.course_id,
        module_id: data.module_id,
        live_session_id: data.live_session_id,
        status: data.status,
        method: data.method,
        marked_at: now,
        join_time: data.join_time,
        leave_time: data.leave_time,
        duration_minutes: data.join_time && data.leave_time ?
          this.calculateDuration(data.join_time, data.leave_time) : undefined,
        marked_by_instructor_id: user.userId,
        notes: data.notes,
        created_at: now,
        updated_at: now,
      };

      const attendanceRef = await db.collection('attendance').add(attendance);

      res.status(201).json({
        message: 'Attendance marked successfully',
        attendance: { id: attendanceRef.id, ...attendance },
      });
    } catch (error: any) {
      console.error('Mark attendance error:', error);
      res.status(500).json({ error: 'Failed to mark attendance' });
    }
  }

  /**
   * Bulk mark attendance
   */
  static async bulkMarkAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const data: BulkAttendanceDTO = req.body;

      if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only instructors can mark attendance' });
        return;
      }

      // Verify course ownership
      const courseDoc = await db.collection('courses').doc(data.course_id).get();
      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data();
      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      const now = new Date().toISOString();
      const batch = db.batch();
      const results = [];

      for (const record of data.attendance) {
        // Get student info
        const studentDoc = await db.collection('users').doc(record.student_id).get();
        if (!studentDoc.exists) continue;

        const student = studentDoc.data();

        const attendance: Omit<AttendanceRecord, 'id'> = {
          student_id: record.student_id,
          student_name: `${student?.first_name} ${student?.last_name}`,
          student_email: student?.email || '',
          course_id: data.course_id,
          module_id: data.module_id,
          live_session_id: data.live_session_id,
          status: record.status,
          method: AttendanceMethod.MANUAL,
          marked_at: data.date,
          marked_by_instructor_id: user.userId,
          notes: record.notes,
          created_at: now,
          updated_at: now,
        };

        const attendanceRef = db.collection('attendance').doc();
        batch.set(attendanceRef, attendance);
        results.push({ student_id: record.student_id, status: 'success' });
      }

      await batch.commit();

      res.json({
        message: 'Bulk attendance marked successfully',
        total: data.attendance.length,
        results,
      });
    } catch (error: any) {
      console.error('Bulk mark attendance error:', error);
      res.status(500).json({ error: 'Failed to mark bulk attendance' });
    }
  }

  /**
   * Get attendance records for a course
   */
  static async getCourseAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;
      const { module_id, date_from, date_to } = req.query;

      // Verify course ownership
      const courseDoc = await db.collection('courses').doc(courseId).get();
      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data();
      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      let query = db.collection('attendance').where('course_id', '==', courseId);

      if (module_id) {
        query = query.where('module_id', '==', module_id);
      }

      if (date_from) {
        query = query.where('marked_at', '>=', date_from);
      }

      if (date_to) {
        query = query.where('marked_at', '<=', date_to);
      }

      const snapshot = await query.orderBy('marked_at', 'desc').get();

      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ records, total: records.length });
    } catch (error: any) {
      console.error('Get attendance error:', error);
      res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  }

  /**
   * Get attendance statistics for a student
   */
  static async getStudentAttendanceStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { studentId, courseId } = req.params;
      const user = req.user!;

      // Verify course ownership
      const courseDoc = await db.collection('courses').doc(courseId).get();
      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data();
      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      const snapshot = await db
        .collection('attendance')
        .where('student_id', '==', studentId)
        .where('course_id', '==', courseId)
        .get();

      const records = snapshot.docs.map((doc) => doc.data() as AttendanceRecord);

      const stats: AttendanceStats = {
        student_id: studentId,
        course_id: courseId,
        total_sessions: records.length,
        attended: records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
        absent: records.filter((r) => r.status === AttendanceStatus.ABSENT).length,
        late: records.filter((r) => r.status === AttendanceStatus.LATE).length,
        excused: records.filter((r) => r.status === AttendanceStatus.EXCUSED).length,
        attendance_percentage: 0,
      };

      stats.attendance_percentage = stats.total_sessions > 0 ?
        ((stats.attended + stats.late + stats.excused) / stats.total_sessions) * 100 : 0;

      res.json({ stats });
    } catch (error: any) {
      console.error('Get attendance stats error:', error);
      res.status(500).json({ error: 'Failed to fetch attendance stats' });
    }
  }

  /**
   * Get attendance summary for entire course
   */
  static async getCourseAttendanceSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;

      // Verify course ownership
      const courseDoc = await db.collection('courses').doc(courseId).get();
      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data();
      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      // Get all enrollments
      const enrollmentsSnapshot = await db
        .collection('enrollments')
        .where('course_id', '==', courseId)
        .get();

      const studentIds = enrollmentsSnapshot.docs.map((doc) => doc.data().student_id);

      // Get attendance for each student
      const studentStats = await Promise.all(
        studentIds.map(async (studentId) => {
          const snapshot = await db
            .collection('attendance')
            .where('student_id', '==', studentId)
            .where('course_id', '==', courseId)
            .get();

          const records = snapshot.docs.map((doc) => doc.data() as AttendanceRecord);

          const attended = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
          const total = records.length;

          const studentDoc = await db.collection('users').doc(studentId).get();
          const student = studentDoc.data();

          return {
            student_id: studentId,
            student_name: `${student?.first_name} ${student?.last_name}`,
            total_sessions: total,
            attended,
            attendance_percentage: total > 0 ? (attended / total) * 100 : 0,
          };
        })
      );

      res.json({ summary: studentStats });
    } catch (error: any) {
      console.error('Get attendance summary error:', error);
      res.status(500).json({ error: 'Failed to fetch attendance summary' });
    }
  }

  /**
   * Helper: Calculate duration between two times
   */
  private static calculateDuration(joinTime: string, leaveTime: string): number {
    const join = new Date(joinTime).getTime();
    const leave = new Date(leaveTime).getTime();
    return Math.round((leave - join) / (1000 * 60)); // minutes
  }
}
