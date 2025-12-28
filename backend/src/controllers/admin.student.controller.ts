import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
import { UserModel } from '../models/user.firebase';
import { UserRole, UserStatus } from '../types';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export interface StudentRegistrationDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  enroll_in_courses?: string[];
}

export interface BillingRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export class AdminStudentController {
  /**
   * Check if user has admin access (ADMIN or SUPER_ADMIN)
   */
  private static hasAdminAccess(userRole: UserRole): boolean {
    return userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
  }

  /**
   * Generate unique student ID (STU{YEAR}{NUMBER})
   */
  private static async generateStudentId(): Promise<string> {
    const year = new Date().getFullYear();

    // Get count of students for sequential numbering
    const usersSnapshot = await db.collection('users')
      .where('role', '==', UserRole.STUDENT)
      .get();

    const count = usersSnapshot.size + 1;
    const paddedCount = count.toString().padStart(4, '0');

    return `STU${year}${paddedCount}`;
  }

  /**
   * Register a new student - ADMIN and SUPER_ADMIN
   */
  static async registerStudent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      if (!AdminStudentController.hasAdminAccess(user.role)) {
        res.status(403).json({ error: 'Only Admin or Super Admin can register students' });
        return;
      }

      const data: StudentRegistrationDTO = req.body;

      // Validate required fields
      if (!data.email || !data.password || !data.first_name || !data.last_name) {
        res.status(400).json({ error: 'Missing required fields: email, password, first_name, last_name' });
        return;
      }

      // Validate password length
      if (data.password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }

      // Check if email already exists
      const existingUser = await UserModel.findByEmail(data.email);
      if (existingUser) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }

      // Create Firebase Auth user
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().createUser({
          email: data.email,
          password: data.password,
          displayName: `${data.first_name} ${data.last_name}`,
        });
      } catch (error: any) {
        console.error('Firebase Auth error:', error);
        res.status(400).json({ error: error.message });
        return;
      }

      // Generate student ID
      const student_id = await AdminStudentController.generateStudentId();

      // Create user data object
      const userData: any = {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        student_id,
      };

      // Add optional fields only if they have values
      if (data.phone) userData.phone = data.phone;
      if (data.date_of_birth) userData.date_of_birth = data.date_of_birth;
      if (data.address) userData.address = data.address;
      if (data.city) userData.city = data.city;
      if (data.state) userData.state = data.state;
      if (data.country) userData.country = data.country;
      if (data.postal_code) userData.postal_code = data.postal_code;
      if (data.emergency_contact_name) userData.emergency_contact_name = data.emergency_contact_name;
      if (data.emergency_contact_phone) userData.emergency_contact_phone = data.emergency_contact_phone;
      if (data.guardian_name) userData.guardian_name = data.guardian_name;
      if (data.guardian_phone) userData.guardian_phone = data.guardian_phone;
      if (data.guardian_email) userData.guardian_email = data.guardian_email;

      // Create user in Firestore
      const newUser = await UserModel.create(firebaseUser.uid, userData);

      // Enroll student in courses if specified
      const enrolledCourses: string[] = [];
      if (data.enroll_in_courses && data.enroll_in_courses.length > 0) {
        console.log(`Enrolling student ${firebaseUser.uid} in ${data.enroll_in_courses.length} courses`);
        for (const courseId of data.enroll_in_courses) {
          try {
            // Verify course exists
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
              console.warn(`Course ${courseId} not found, skipping enrollment`);
              continue;
            }

            // Create enrollment in main enrollments collection
            const enrollmentId = `${firebaseUser.uid}_${courseId}`;
            await db.collection('enrollments').doc(enrollmentId).set({
              student_id: firebaseUser.uid,
              course_id: courseId,
              status: 'active',
              enrolled_at: new Date().toISOString(),
              progress: 0,
            });

            enrolledCourses.push(courseId);
            console.log(`✓ Successfully enrolled in course ${courseId}`);
          } catch (error) {
            console.error(`✗ Failed to enroll in course ${courseId}:`, error);
          }
        }
      }

      res.status(201).json({
        message: 'Student registered successfully',
        student: newUser,
        enrolled_courses: enrolledCourses,
        credentials: {
          student_id,
          email: data.email,
          password_note: 'Use the password provided during registration',
        },
      });
    } catch (error: any) {
      console.error('Register student error:', error);
      res.status(500).json({ error: 'Failed to register student' });
    }
  }

  /**
   * Get all students with filters - ADMIN and SUPER_ADMIN
   */
  static async getAllStudents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      if (!AdminStudentController.hasAdminAccess(user.role)) {
        res.status(403).json({ error: 'Only Admin or Super Admin can view students' });
        return;
      }

      const { status, search } = req.query;

      let query: admin.firestore.Query = db.collection('users').where('role', '==', UserRole.STUDENT);

      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();

      let students = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: typeof data.created_at === 'string' ? data.created_at : data.created_at?.toDate?.().toISOString(),
          updated_at: typeof data.updated_at === 'string' ? data.updated_at : data.updated_at?.toDate?.().toISOString(),
        };
      });

      // Sort by created_at (most recent first)
      students.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      // Apply search filter if provided
      if (search) {
        const searchLower = (search as string).toLowerCase();
        students = students.filter(
          (s: any) =>
            s.first_name?.toLowerCase().includes(searchLower) ||
            s.last_name?.toLowerCase().includes(searchLower) ||
            s.email?.toLowerCase().includes(searchLower) ||
            s.student_id?.toLowerCase().includes(searchLower)
        );
      }

      res.json({
        students,
        count: students.length,
      });
    } catch (error: any) {
      console.error('Get all students error:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  }

  /**
   * Enroll student in courses - ADMIN and SUPER_ADMIN
   */
  static async enrollStudentInCourses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { studentId } = req.params;
      const { course_ids } = req.body;

      if (!AdminStudentController.hasAdminAccess(user.role)) {
        res.status(403).json({ error: 'Only Admin or Super Admin can enroll students' });
        return;
      }

      if (!Array.isArray(course_ids) || course_ids.length === 0) {
        res.status(400).json({ error: 'course_ids must be a non-empty array' });
        return;
      }

      // Verify student exists
      const student = await UserModel.findById(studentId);
      if (!student || student.role !== UserRole.STUDENT) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      const results = {
        success: [] as string[],
        failed: [] as any[],
      };

      for (const courseId of course_ids) {
        try {
          // Verify course exists
          const courseDoc = await db.collection('courses').doc(courseId).get();
          if (!courseDoc.exists) {
            results.failed.push({
              course_id: courseId,
              error: 'Course not found',
            });
            continue;
          }

          // Check if already enrolled
          const enrollmentId = `${studentId}_${courseId}`;
          const existingEnrollment = await db.collection('enrollments').doc(enrollmentId).get();
          if (existingEnrollment.exists) {
            results.failed.push({
              course_id: courseId,
              error: 'Already enrolled',
            });
            continue;
          }

          // Create enrollment
          await db.collection('enrollments').doc(enrollmentId).set({
            student_id: studentId,
            course_id: courseId,
            status: 'active',
            enrolled_at: new Date().toISOString(),
            progress: 0,
          });

          results.success.push(courseId);
        } catch (error: any) {
          results.failed.push({
            course_id: courseId,
            error: error.message,
          });
        }
      }

      res.json({
        message: 'Enrollment completed',
        total: course_ids.length,
        success_count: results.success.length,
        failed_count: results.failed.length,
        results,
      });
    } catch (error: any) {
      console.error('Enroll student error:', error);
      res.status(500).json({ error: 'Failed to enroll student' });
    }
  }

  /**
   * Get student enrollments - ADMIN and SUPER_ADMIN
   */
  static async getStudentEnrollments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { studentId } = req.params;

      if (!AdminStudentController.hasAdminAccess(user.role)) {
        res.status(403).json({ error: 'Only Admin or Super Admin can view enrollments' });
        return;
      }

      // Verify student exists
      const student = await UserModel.findById(studentId);
      if (!student || student.role !== UserRole.STUDENT) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      const enrollmentsSnapshot = await db.collection('enrollments')
        .where('student_id', '==', studentId)
        .get();

      const enrollments = [];
      for (const doc of enrollmentsSnapshot.docs) {
        const enrollmentData = doc.data();

        // Get course details
        const courseDoc = await db.collection('courses').doc(enrollmentData.course_id).get();
        const courseData = courseDoc.exists ? courseDoc.data() : null;

        enrollments.push({
          id: doc.id,
          ...enrollmentData,
          course_title: courseData?.title || 'Unknown Course',
          course_description: courseData?.description,
          instructor_id: courseData?.instructor_id,
        });
      }

      res.json({
        enrollments,
        count: enrollments.length,
      });
    } catch (error: any) {
      console.error('Get student enrollments error:', error);
      res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
  }

  /**
   * Create billing record - ADMIN and SUPER_ADMIN
   */
  static async createBillingRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      if (!AdminStudentController.hasAdminAccess(user.role)) {
        res.status(403).json({ error: 'Only Admin or Super Admin can create billing records' });
        return;
      }

      const { student_id, amount, currency, description, due_date, notes } = req.body;

      // Validate required fields
      if (!student_id || !amount || !currency || !description || !due_date) {
        res.status(400).json({ error: 'Missing required fields: student_id, amount, currency, description, due_date' });
        return;
      }

      // Verify student exists
      const student = await UserModel.findById(student_id);
      if (!student || student.role !== UserRole.STUDENT) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      const now = new Date().toISOString();
      const billingData: any = {
        student_id,
        student_name: `${student.first_name} ${student.last_name}`,
        student_email: student.email,
        amount: parseFloat(amount),
        currency,
        description,
        status: 'pending',
        due_date,
        created_at: now,
        updated_at: now,
        created_by: user.userId,
      };

      if (notes) {
        billingData.notes = notes;
      }

      const billingRef = await db.collection('billing').add(billingData);

      res.status(201).json({
        message: 'Billing record created successfully',
        billing: {
          id: billingRef.id,
          ...billingData,
        },
      });
    } catch (error: any) {
      console.error('Create billing record error:', error);
      res.status(500).json({ error: 'Failed to create billing record' });
    }
  }

  /**
   * Get all billing records with filters - ADMIN and SUPER_ADMIN
   */
  static async getAllBillingRecords(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      if (!AdminStudentController.hasAdminAccess(user.role)) {
        res.status(403).json({ error: 'Only Admin or Super Admin can view billing records' });
        return;
      }

      const { student_id, status } = req.query;

      let query: admin.firestore.Query = db.collection('billing');

      if (student_id) {
        query = query.where('student_id', '==', student_id);
      }

      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();

      let billingRecords = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by created_at (most recent first)
      billingRecords.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      res.json({
        billing_records: billingRecords,
        count: billingRecords.length,
      });
    } catch (error: any) {
      console.error('Get billing records error:', error);
      res.status(500).json({ error: 'Failed to fetch billing records' });
    }
  }

  /**
   * Update billing record status - ADMIN and SUPER_ADMIN
   */
  static async updateBillingStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { billingId } = req.params;
      const { status, payment_method, transaction_id, notes } = req.body;

      if (!AdminStudentController.hasAdminAccess(user.role)) {
        res.status(403).json({ error: 'Only Admin or Super Admin can update billing records' });
        return;
      }

      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      const validStatuses = ['pending', 'paid', 'overdue', 'cancelled'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be: pending, paid, overdue, or cancelled' });
        return;
      }

      const billingDoc = await db.collection('billing').doc(billingId).get();
      if (!billingDoc.exists) {
        res.status(404).json({ error: 'Billing record not found' });
        return;
      }

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'paid') {
        updateData.paid_date = new Date().toISOString();
      }

      if (payment_method) {
        updateData.payment_method = payment_method;
      }

      if (transaction_id) {
        updateData.transaction_id = transaction_id;
      }

      if (notes) {
        updateData.notes = notes;
      }

      await db.collection('billing').doc(billingId).update(updateData);

      const updated = await db.collection('billing').doc(billingId).get();

      res.json({
        message: 'Billing record updated successfully',
        billing: {
          id: updated.id,
          ...updated.data(),
        },
      });
    } catch (error: any) {
      console.error('Update billing status error:', error);
      res.status(500).json({ error: 'Failed to update billing record' });
    }
  }

  /**
   * Delete billing record - ADMIN and SUPER_ADMIN
   */
  static async deleteBillingRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { billingId } = req.params;

      if (!AdminStudentController.hasAdminAccess(user.role)) {
        res.status(403).json({ error: 'Only Admin or Super Admin can delete billing records' });
        return;
      }

      const billingDoc = await db.collection('billing').doc(billingId).get();
      if (!billingDoc.exists) {
        res.status(404).json({ error: 'Billing record not found' });
        return;
      }

      await db.collection('billing').doc(billingId).delete();

      res.json({ message: 'Billing record deleted successfully' });
    } catch (error: any) {
      console.error('Delete billing record error:', error);
      res.status(500).json({ error: 'Failed to delete billing record' });
    }
  }
}
