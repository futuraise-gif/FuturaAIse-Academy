import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
import { CourseModel } from '../models/course.model';
import { UserModel } from '../models/user.firebase';
import {
  CreateCourseDTO,
  UpdateCourseDTO,
  CourseStatus,
  EnrollmentRole,
  EnrollmentStatus
} from '../types/course.types';
import { UserRole } from '../types';

export class CourseController {
  /**
   * Create a new course (Instructors & Admins only)
   */
  static async createCourse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      // Only instructors and admins can create courses
      if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only instructors and admins can create courses' });
        return;
      }

      const data: CreateCourseDTO = req.body;

      // Get full user details
      const userDetails = await UserModel.findById(user.userId);
      if (!userDetails) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const course = await CourseModel.create(
        user.userId,
        `${userDetails.first_name} ${userDetails.last_name}`,
        data
      );

      res.status(201).json({
        message: 'Course created successfully',
        course,
      });
    } catch (error: any) {
      console.error('Create course error:', error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  }

  /**
   * Get all courses (filtered by role)
   */
  static async getAllCourses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { status, term, year, limit } = req.query;

      let courses;

      if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
        // Admins and Super Admins see all courses
        courses = await CourseModel.findAll({
          status: status as CourseStatus,
          term: term as string,
          year: year ? parseInt(year as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        });
      } else if (user.role === UserRole.INSTRUCTOR) {
        // Instructors see their own courses + published courses
        const ownCourses = await CourseModel.findAll({
          instructor_id: user.userId,
          status: status as CourseStatus,
          term: term as string,
          year: year ? parseInt(year as string) : undefined,
        });

        const publishedCourses = await CourseModel.findAll({
          status: CourseStatus.PUBLISHED,
          term: term as string,
          year: year ? parseInt(year as string) : undefined,
        });

        // Merge and deduplicate
        const courseMap = new Map();
        [...ownCourses, ...publishedCourses].forEach(course => {
          courseMap.set(course.id, course);
        });
        courses = Array.from(courseMap.values());
      } else {
        // Students only see published courses
        courses = await CourseModel.findAll({
          status: CourseStatus.PUBLISHED,
          term: term as string,
          year: year ? parseInt(year as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        });
      }

      res.json({ courses, count: courses.length });
    } catch (error: any) {
      console.error('Get all courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  }

  /**
   * Get a single course by ID
   */
  static async getCourseById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Check access permissions
      if (
        course.status === CourseStatus.DRAFT &&
        course.instructor_id !== user.userId &&
        user.role !== UserRole.ADMIN
      ) {
        res.status(403).json({ error: 'Access denied to draft course' });
        return;
      }

      // Get user's enrollment status
      const enrollment = await CourseModel.getUserEnrollment(courseId, user.userId);

      res.json({
        course,
        enrollment: enrollment || null,
      });
    } catch (error: any) {
      console.error('Get course by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch course' });
    }
  }

  /**
   * Update a course (Instructor of course or Admin only)
   */
  static async updateCourse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;
      const updates: UpdateCourseDTO = req.body;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Only course instructor or admin can update
      if (course.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only the course instructor or admin can update this course' });
        return;
      }

      const updatedCourse = await CourseModel.update(courseId, updates);

      res.json({
        message: 'Course updated successfully',
        course: updatedCourse,
      });
    } catch (error: any) {
      console.error('Update course error:', error);
      res.status(500).json({ error: 'Failed to update course' });
    }
  }

  /**
   * Delete (archive) a course (Instructor or Admin only)
   */
  static async deleteCourse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Only course instructor or admin can delete
      if (course.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only the course instructor or admin can delete this course' });
        return;
      }

      await CourseModel.delete(courseId);

      res.json({ message: 'Course archived successfully' });
    } catch (error: any) {
      console.error('Delete course error:', error);
      res.status(500).json({ error: 'Failed to delete course' });
    }
  }

  /**
   * Publish a course (Instructor or Admin only)
   */
  static async publishCourse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Only course instructor or admin can publish
      if (course.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only the course instructor or admin can publish this course' });
        return;
      }

      const updatedCourse = await CourseModel.publish(courseId);

      res.json({
        message: 'Course published successfully',
        course: updatedCourse,
      });
    } catch (error: any) {
      console.error('Publish course error:', error);
      res.status(500).json({ error: 'Failed to publish course' });
    }
  }

  /**
   * Enroll a student in a course
   */
  static async enrollStudent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;
      const { user_id, user_name, user_email, role } = req.body;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Check if course is published (unless admin/instructor enrolling)
      if (
        course.status !== CourseStatus.PUBLISHED &&
        course.instructor_id !== user.userId &&
        user.role !== UserRole.ADMIN
      ) {
        res.status(400).json({ error: 'Cannot enroll in unpublished course' });
        return;
      }

      // Check enrollment limits
      if (course.max_students) {
        const enrollmentCount = await CourseModel.getEnrollmentCount(courseId);
        if (enrollmentCount >= course.max_students) {
          res.status(400).json({ error: 'Course is full' });
          return;
        }
      }

      // Check if already enrolled
      const existingEnrollment = await CourseModel.getUserEnrollment(courseId, user_id);
      if (existingEnrollment && existingEnrollment.status === EnrollmentStatus.ACTIVE) {
        res.status(400).json({ error: 'User is already enrolled in this course' });
        return;
      }

      const enrollment = await CourseModel.enrollUser(courseId, {
        user_id,
        user_name,
        user_email,
        role,
      });

      res.json({
        message: 'Student enrolled successfully',
        enrollment,
      });
    } catch (error: any) {
      console.error('Enroll student error:', error);
      res.status(500).json({ error: 'Failed to enroll student' });
    }
  }

  /**
   * Self-enroll in a course by course code
   */
  static async selfEnroll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { course_code } = req.body;

      // Find course by code
      const courses = await CourseModel.findAll({ status: CourseStatus.PUBLISHED });
      const course = courses.find(c => c.code === course_code);

      if (!course) {
        res.status(404).json({ error: 'Course not found or not available for enrollment' });
        return;
      }

      // Check if self-enrollment is allowed
      if (!course.allow_self_enrollment) {
        res.status(403).json({ error: 'Self-enrollment is not allowed for this course' });
        return;
      }

      // Check enrollment limits
      if (course.max_students) {
        const enrollmentCount = await CourseModel.getEnrollmentCount(course.id);
        if (enrollmentCount >= course.max_students) {
          res.status(400).json({ error: 'Course is full' });
          return;
        }
      }

      // Check if already enrolled
      const existingEnrollment = await CourseModel.getUserEnrollment(course.id, user.userId);
      if (existingEnrollment && existingEnrollment.status === EnrollmentStatus.ACTIVE) {
        res.status(400).json({ error: 'You are already enrolled in this course' });
        return;
      }

      // Get user details
      const userDetails = await UserModel.findById(user.userId);
      if (!userDetails) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const enrollment = await CourseModel.enrollUser(course.id, {
        user_id: user.userId,
        user_name: `${userDetails.first_name} ${userDetails.last_name}`,
        user_email: userDetails.email,
        role: EnrollmentRole.STUDENT,
      });

      res.json({
        message: course.require_approval
          ? 'Enrollment request submitted for approval'
          : 'Successfully enrolled in course',
        enrollment,
        course,
      });
    } catch (error: any) {
      console.error('Self-enroll error:', error);
      res.status(500).json({ error: 'Failed to enroll in course' });
    }
  }

  /**
   * Drop a student from a course
   */
  static async dropStudent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId, userId } = req.params;
      const user = req.user!;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Check permissions: students can drop themselves, instructors/admins can drop anyone
      if (
        user.userId !== userId &&
        course.instructor_id !== user.userId &&
        user.role !== UserRole.ADMIN
      ) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const dropped = await CourseModel.dropUser(courseId, userId);

      if (!dropped) {
        res.status(404).json({ error: 'Enrollment not found' });
        return;
      }

      res.json({ message: 'Student dropped from course successfully' });
    } catch (error: any) {
      console.error('Drop student error:', error);
      res.status(500).json({ error: 'Failed to drop student from course' });
    }
  }

  /**
   * Get all enrollments for a course (Instructor or Admin only)
   */
  static async getCourseEnrollments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;
      const { role, status } = req.query;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Only course instructor or admin can view enrollments
      if (course.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const enrollments = await CourseModel.getEnrollments(courseId, {
        role: role as any,
        status: status as any,
      });

      res.json({ enrollments, count: enrollments.length });
    } catch (error: any) {
      console.error('Get course enrollments error:', error);
      res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
  }

  /**
   * Get all courses a user is enrolled in
   */
  static async getMyEnrolledCourses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { status } = req.query;

      const courses = await CourseModel.getUserCourses(
        user.userId,
        status as EnrollmentStatus
      );

      res.json({ courses, count: courses.length });
    } catch (error: any) {
      console.error('Get enrolled courses error:', error);
      res.status(500).json({ error: 'Failed to fetch enrolled courses' });
    }
  }
}
