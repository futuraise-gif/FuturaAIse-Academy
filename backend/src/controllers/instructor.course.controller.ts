import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
import * as admin from 'firebase-admin';
import { UserRole } from '../types';
import { Course, CreateCourseDTO, UpdateCourseDTO, CourseStatus } from '../types/course.types';

const db = admin.firestore();

export class InstructorCourseController {
  /**
   * Create course inside a program
   */
  static async createCourse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const data: CreateCourseDTO = req.body;

      if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only instructors can create courses' });
        return;
      }

      // Validate
      if (!data.program_id || !data.title || !data.description) {
        res.status(400).json({ error: 'Program ID, title, and description are required' });
        return;
      }

      // Verify program ownership
      const programDoc = await db.collection('programs').doc(data.program_id).get();
      if (!programDoc.exists) {
        res.status(404).json({ error: 'Program not found' });
        return;
      }

      const program = programDoc.data();
      if (program?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized to add courses to this program' });
        return;
      }

      const now = new Date().toISOString();
      const course: Omit<Course, 'id'> = {
        program_id: data.program_id,
        title: data.title,
        description: data.description,
        instructor_id: user.userId,
        instructor_name: `${user.first_name || ''} ${user.last_name || ''}`,
        thumbnail_url: data.thumbnail_url || '',
        status: CourseStatus.DRAFT,
        category: data.category || '',
        level: data.level || 'beginner',
        duration_hours: data.duration_hours || 0,
        tags: data.tags || [],
        prerequisites: data.prerequisites || [],
        learning_outcomes: data.learning_outcomes || [],
        syllabus: data.syllabus || '',
        price: data.price || 0,
        max_students: data.max_students || 0,
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        enrolled_count: 0,
        created_at: now,
        updated_at: now,
      };

      const courseRef = await db.collection('courses').add(course);

      // Update program's total_courses count
      await db.collection('programs').doc(data.program_id).update({
        total_courses: admin.firestore.FieldValue.increment(1),
        updated_at: now,
      });

      res.status(201).json({
        message: 'Course created successfully',
        course: { id: courseRef.id, ...course },
      });
    } catch (error: any) {
      console.error('Create course error:', error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  }

  /**
   * Get all courses for instructor
   */
  static async getInstructorCourses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { program_id } = req.query;

      let query = db.collection('courses').where('instructor_id', '==', user.userId);

      if (program_id) {
        query = query.where('program_id', '==', program_id);
      }

      const snapshot = await query.get();

      const courses = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      res.json({ courses });
    } catch (error: any) {
      console.error('Get courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  }

  /**
   * Get course details with modules
   */
  static async getCourseDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;

      const courseDoc = await db.collection('courses').doc(courseId).get();

      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = { id: courseDoc.id, ...courseDoc.data() } as Course;

      // Verify access
      if (
        course.instructor_id !== user.userId &&
        course.status !== 'published' &&
        user.role !== UserRole.ADMIN
      ) {
        res.status(403).json({ error: 'Not authorized to view this course' });
        return;
      }

      res.json({ course });
    } catch (error: any) {
      console.error('Get course error:', error);
      res.status(500).json({ error: 'Failed to fetch course' });
    }
  }

  /**
   * Update course
   */
  static async updateCourse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;
      const updates: UpdateCourseDTO = req.body;

      const courseDoc = await db.collection('courses').doc(courseId).get();

      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data() as Course;

      if (course.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized to update this course' });
        return;
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await db.collection('courses').doc(courseId).update(updateData);

      res.json({ message: 'Course updated successfully' });
    } catch (error: any) {
      console.error('Update course error:', error);
      res.status(500).json({ error: 'Failed to update course' });
    }
  }

  /**
   * Delete course
   */
  static async deleteCourse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;

      const courseDoc = await db.collection('courses').doc(courseId).get();

      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data() as Course;

      if (course.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized to delete this course' });
        return;
      }

      // Check for enrolled students
      if (course.enrolled_count && course.enrolled_count > 0) {
        res.status(400).json({
          error: 'Cannot delete course with enrolled students',
        });
        return;
      }

      await db.collection('courses').doc(courseId).delete();

      // Update program's total_courses count
      if (course.program_id) {
        await db.collection('programs').doc(course.program_id).update({
          total_courses: admin.firestore.FieldValue.increment(-1),
          updated_at: new Date().toISOString(),
        });
      }

      res.json({ message: 'Course deleted successfully' });
    } catch (error: any) {
      console.error('Delete course error:', error);
      res.status(500).json({ error: 'Failed to delete course' });
    }
  }

  /**
   * Publish course
   */
  static async publishCourse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;

      const courseDoc = await db.collection('courses').doc(courseId).get();

      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data() as Course;

      if (course.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized to publish this course' });
        return;
      }

      await db.collection('courses').doc(courseId).update({
        status: 'published',
        updated_at: new Date().toISOString(),
      });

      res.json({ message: 'Course published successfully' });
    } catch (error: any) {
      console.error('Publish course error:', error);
      res.status(500).json({ error: 'Failed to publish course' });
    }
  }

  /**
   * Get enrolled students for a course
   */
  static async getEnrolledStudents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;

      const courseDoc = await db.collection('courses').doc(courseId).get();

      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data() as Course;

      if (course.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      const enrollmentsSnapshot = await db
        .collection('enrollments')
        .where('course_id', '==', courseId)
        .get();

      const students = await Promise.all(
        enrollmentsSnapshot.docs.map(async (doc) => {
          const enrollment = doc.data();
          const studentDoc = await db.collection('users').doc(enrollment.student_id).get();
          const student = studentDoc.data();

          return {
            id: enrollment.student_id,
            enrollment_id: doc.id,
            name: `${student?.first_name} ${student?.last_name}`,
            email: student?.email,
            student_id: student?.student_id,
            enrolled_at: enrollment.enrolled_at,
            progress: enrollment.progress || 0,
            status: enrollment.status || 'active',
          };
        })
      );

      res.json({ students });
    } catch (error: any) {
      console.error('Get enrolled students error:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  }
}
