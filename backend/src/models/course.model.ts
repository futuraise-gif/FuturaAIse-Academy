import { db } from '../config/firebase';
import {
  Course,
  CourseEnrollment,
  CourseStatus,
  EnrollmentStatus,
  EnrollmentRole,
  CreateCourseDTO,
  UpdateCourseDTO,
  EnrollStudentDTO
} from '../types/course.types';

const COURSES_COLLECTION = 'courses';
const ENROLLMENTS_SUBCOLLECTION = 'enrollments';

export class CourseModel {
  /**
   * Create a new course
   */
  static async create(instructorId: string, instructorName: string, data: CreateCourseDTO): Promise<Course> {
    const courseRef = db.collection(COURSES_COLLECTION).doc();

    const course: any = {
      code: data.code,
      title: data.title,
      description: data.description,
      instructor_id: instructorId,
      instructor_name: instructorName,
      program_id: data.program_id,
      term: data.term,
      year: data.year,
      status: CourseStatus.DRAFT,
      max_students: data.max_students,
      allow_self_enrollment: data.allow_self_enrollment ?? false,
      require_approval: data.require_approval ?? false,
      credits: data.credits,
      department: data.department,
      prerequisites: data.prerequisites || [],
      start_date: data.start_date,
      end_date: data.end_date,
      thumbnail_url: data.thumbnail_url,
      category: data.category,
      level: data.level,
      duration_hours: data.duration_hours,
      tags: data.tags || [],
      learning_outcomes: data.learning_outcomes || [],
      syllabus: data.syllabus,
      price: data.price,
      order: data.order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await courseRef.set(course);

    // Auto-enroll instructor
    await this.enrollUser(courseRef.id, {
      user_id: instructorId,
      user_name: instructorName,
      user_email: '', // Will be filled by controller
      role: EnrollmentRole.INSTRUCTOR,
    });

    return {
      id: courseRef.id,
      ...course,
    };
  }

  /**
   * Get course by ID
   */
  static async findById(courseId: string): Promise<Course | null> {
    const doc = await db.collection(COURSES_COLLECTION).doc(courseId).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Course;
  }

  /**
   * Get all courses with optional filters
   */
  static async findAll(filters?: {
    status?: CourseStatus;
    term?: string;
    year?: number;
    instructor_id?: string;
    limit?: number;
  }): Promise<Course[]> {
    let query: any = db.collection(COURSES_COLLECTION);

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters?.term) {
      query = query.where('term', '==', filters.term);
    }

    if (filters?.year) {
      query = query.where('year', '==', filters.year);
    }

    if (filters?.instructor_id) {
      query = query.where('instructor_id', '==', filters.instructor_id);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    // Removed orderBy to avoid composite index requirement
    const snapshot = await query.get();
    let courses: Course[] = [];

    snapshot.forEach((doc: any) => {
      courses.push({
        id: doc.id,
        ...doc.data(),
      } as Course);
    });

    // Sort by created_at in application layer
    courses.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return courses;
  }

  /**
   * Update course
   */
  static async update(courseId: string, updates: UpdateCourseDTO): Promise<Course | null> {
    const courseRef = db.collection(COURSES_COLLECTION).doc(courseId);
    const doc = await courseRef.get();

    if (!doc.exists) {
      return null;
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await courseRef.update(updateData);

    return this.findById(courseId);
  }

  /**
   * Delete course (soft delete by archiving)
   */
  static async delete(courseId: string): Promise<boolean> {
    const courseRef = db.collection(COURSES_COLLECTION).doc(courseId);
    const doc = await courseRef.get();

    if (!doc.exists) {
      return false;
    }

    await courseRef.update({
      status: CourseStatus.ARCHIVED,
      updated_at: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Publish course (make it visible to students)
   */
  static async publish(courseId: string): Promise<Course | null> {
    return this.update(courseId, { status: CourseStatus.PUBLISHED });
  }

  /**
   * Enroll a user in a course
   */
  static async enrollUser(courseId: string, data: EnrollStudentDTO): Promise<CourseEnrollment> {
    const enrollmentRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(ENROLLMENTS_SUBCOLLECTION)
      .doc(data.user_id);

    const enrollment: Omit<CourseEnrollment, 'course_id'> = {
      user_id: data.user_id,
      user_name: data.user_name,
      user_email: data.user_email,
      role: data.role || EnrollmentRole.STUDENT,
      status: EnrollmentStatus.ACTIVE,
      enrolled_at: new Date().toISOString(),
    };

    await enrollmentRef.set(enrollment);

    return {
      course_id: courseId,
      ...enrollment,
    };
  }

  /**
   * Drop/unenroll a user from a course
   */
  static async dropUser(courseId: string, userId: string): Promise<boolean> {
    const enrollmentRef = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(ENROLLMENTS_SUBCOLLECTION)
      .doc(userId);

    const doc = await enrollmentRef.get();

    if (!doc.exists) {
      return false;
    }

    await enrollmentRef.update({
      status: EnrollmentStatus.DROPPED,
    });

    return true;
  }

  /**
   * Get all enrollments for a course
   */
  static async getEnrollments(courseId: string, filters?: {
    role?: EnrollmentRole;
    status?: EnrollmentStatus;
  }): Promise<CourseEnrollment[]> {
    let query: any = db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(ENROLLMENTS_SUBCOLLECTION);

    if (filters?.role) {
      query = query.where('role', '==', filters.role);
    }

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    const snapshot = await query.get();
    const enrollments: CourseEnrollment[] = [];

    snapshot.forEach((doc: any) => {
      enrollments.push({
        course_id: courseId,
        ...doc.data(),
      } as CourseEnrollment);
    });

    return enrollments;
  }

  /**
   * Get user's enrollment in a course
   */
  static async getUserEnrollment(courseId: string, userId: string): Promise<CourseEnrollment | null> {
    const doc = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(ENROLLMENTS_SUBCOLLECTION)
      .doc(userId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return {
      course_id: courseId,
      ...doc.data(),
    } as CourseEnrollment;
  }

  /**
   * Get all courses a user is enrolled in
   */
  static async getUserCourses(userId: string, status?: EnrollmentStatus): Promise<Course[]> {
    // Rewritten to avoid collectionGroup index requirement
    // Get all courses first
    const coursesSnapshot = await db.collection(COURSES_COLLECTION).get();
    const enrolledCourses: Course[] = [];

    // Check each course for user enrollment
    for (const courseDoc of coursesSnapshot.docs) {
      const enrollmentDoc = await db
        .collection(COURSES_COLLECTION)
        .doc(courseDoc.id)
        .collection(ENROLLMENTS_SUBCOLLECTION)
        .doc(userId)
        .get();

      if (enrollmentDoc.exists) {
        const enrollmentData = enrollmentDoc.data();

        // If status filter is provided, check if it matches
        if (!status || enrollmentData?.status === status) {
          enrolledCourses.push({
            id: courseDoc.id,
            ...courseDoc.data(),
          } as Course);
        }
      }
    }

    return enrolledCourses;
  }

  /**
   * Check if user is enrolled in course
   */
  static async isUserEnrolled(courseId: string, userId: string): Promise<boolean> {
    const enrollment = await this.getUserEnrollment(courseId, userId);
    return enrollment !== null && enrollment.status === EnrollmentStatus.ACTIVE;
  }

  /**
   * Get enrollment count for a course
   */
  static async getEnrollmentCount(courseId: string): Promise<number> {
    // Get all enrollments and filter in application layer to avoid composite index
    const snapshot = await db
      .collection(COURSES_COLLECTION)
      .doc(courseId)
      .collection(ENROLLMENTS_SUBCOLLECTION)
      .get();

    let count = 0;
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      if (data.status === EnrollmentStatus.ACTIVE && data.role === EnrollmentRole.STUDENT) {
        count++;
      }
    });

    return count;
  }

  /**
   * Alias for getUserCourses - Get all courses a user is enrolled in
   */
  static async findEnrolledCourses(userId: string, status?: EnrollmentStatus): Promise<Course[]> {
    return this.getUserCourses(userId, status);
  }
}
