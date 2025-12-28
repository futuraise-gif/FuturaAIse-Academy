"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminInfoController = void 0;
const firebase_1 = require("../config/firebase");
const types_1 = require("../types");
class AdminInfoController {
    // Check if user has admin access
    static hasAdminAccess(userRole) {
        return userRole === types_1.UserRole.ADMIN || userRole === types_1.UserRole.SUPER_ADMIN;
    }
    // Get all students
    static async getAllStudents(req, res) {
        try {
            if (!req.user || !AdminInfoController.hasAdminAccess(req.user.role)) {
                res.status(403).json({ message: 'Access denied. Admin privileges required.' });
                return;
            }
            // Fetch all users with student role
            const usersSnapshot = await firebase_1.db.collection('users')
                .where('role', '==', types_1.UserRole.STUDENT)
                .get();
            const students = await Promise.all(usersSnapshot.docs.map(async (doc) => {
                const userData = doc.data();
                const studentId = doc.id;
                // Get enrolled courses
                const enrollmentsSnapshot = await firebase_1.db.collection('enrollments')
                    .where('student_id', '==', studentId)
                    .get();
                const enrolledCourses = enrollmentsSnapshot.docs.map((d) => d.data().course_id);
                // Get completed courses
                const completedCourses = enrollmentsSnapshot.docs
                    .filter((d) => d.data().status === 'completed')
                    .map((d) => d.data().course_id);
                // Get billing information
                const billingSnapshot = await firebase_1.db.collection('billing')
                    .where('student_id', '==', studentId)
                    .get();
                let totalFees = 0;
                let feesPaid = 0;
                let feesPending = 0;
                billingSnapshot.docs.forEach((doc) => {
                    const billing = doc.data();
                    totalFees += billing.total_amount || 0;
                    feesPaid += billing.paid_amount || 0;
                    feesPending += billing.pending_amount || 0;
                });
                return {
                    id: studentId,
                    student_id: userData.student_id || `STU${studentId.substring(0, 8).toUpperCase()}`,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    email: userData.email,
                    phone: userData.phone,
                    date_of_birth: userData.date_of_birth,
                    enrollment_date: userData.created_at,
                    status: userData.status || 'active',
                    enrolled_courses: enrolledCourses,
                    completed_courses: completedCourses,
                    current_gpa: userData.gpa,
                    total_fees: totalFees,
                    fees_paid: feesPaid,
                    fees_pending: feesPending,
                    created_at: userData.created_at,
                };
            }));
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.json(students);
        }
        catch (error) {
            console.error('Error fetching students:', error);
            res.status(500).json({ message: 'Failed to fetch students' });
        }
    }
    // Get all instructors
    static async getAllInstructors(req, res) {
        try {
            if (!req.user || !AdminInfoController.hasAdminAccess(req.user.role)) {
                res.status(403).json({ message: 'Access denied. Admin privileges required.' });
                return;
            }
            // Fetch all users with instructor role
            const usersSnapshot = await firebase_1.db.collection('users')
                .where('role', '==', types_1.UserRole.INSTRUCTOR)
                .get();
            const instructors = await Promise.all(usersSnapshot.docs.map(async (doc) => {
                const userData = doc.data();
                const instructorId = doc.id;
                // Get courses taught by this instructor
                const coursesSnapshot = await firebase_1.db.collection('courses')
                    .where('instructor_id', '==', instructorId)
                    .get();
                const totalCourses = coursesSnapshot.size;
                const activeCourses = coursesSnapshot.docs.filter((d) => d.data().status === 'published' || d.data().status === 'active').length;
                // Get total students across all courses
                let totalStudents = 0;
                for (const courseDoc of coursesSnapshot.docs) {
                    const enrollmentsSnapshot = await firebase_1.db.collection('enrollments')
                        .where('course_id', '==', courseDoc.id)
                        .get();
                    totalStudents += enrollmentsSnapshot.size;
                }
                // Calculate average rating from course reviews
                let totalRating = 0;
                let ratingCount = 0;
                for (const courseDoc of coursesSnapshot.docs) {
                    const reviewsSnapshot = await firebase_1.db.collection('reviews')
                        .where('course_id', '==', courseDoc.id)
                        .get();
                    reviewsSnapshot.docs.forEach((reviewDoc) => {
                        const review = reviewDoc.data();
                        if (review.rating) {
                            totalRating += review.rating;
                            ratingCount++;
                        }
                    });
                }
                const averageRating = ratingCount > 0 ? totalRating / ratingCount : undefined;
                return {
                    id: instructorId,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    email: userData.email,
                    phone: userData.phone,
                    department: userData.department,
                    specialization: userData.specialization,
                    bio: userData.bio,
                    qualifications: userData.qualifications || [],
                    total_courses: totalCourses,
                    active_courses: activeCourses,
                    total_students: totalStudents,
                    rating: averageRating,
                    years_of_experience: userData.years_of_experience,
                    status: userData.status || 'active',
                    created_at: userData.created_at,
                };
            }));
            res.json(instructors);
        }
        catch (error) {
            console.error('Error fetching instructors:', error);
            res.status(500).json({ message: 'Failed to fetch instructors' });
        }
    }
    // Get student by ID with detailed information
    static async getStudentById(req, res) {
        try {
            if (!req.user || !AdminInfoController.hasAdminAccess(req.user.role)) {
                res.status(403).json({ message: 'Access denied. Admin privileges required.' });
                return;
            }
            const { studentId } = req.params;
            const studentDoc = await firebase_1.db.collection('users').doc(studentId).get();
            if (!studentDoc.exists) {
                res.status(404).json({ message: 'Student not found' });
                return;
            }
            const userData = studentDoc.data();
            // Get detailed enrollment information
            const enrollmentsSnapshot = await firebase_1.db.collection('enrollments')
                .where('student_id', '==', studentId)
                .get();
            const enrollments = await Promise.all(enrollmentsSnapshot.docs.map(async (enrollDoc) => {
                const enrollment = enrollDoc.data();
                const courseDoc = await firebase_1.db.collection('courses').doc(enrollment.course_id).get();
                const courseData = courseDoc.data();
                return {
                    course_id: enrollment.course_id,
                    course_name: courseData?.title,
                    enrollment_date: enrollment.enrolled_at,
                    status: enrollment.status,
                    progress: enrollment.progress,
                    grade: enrollment.grade,
                };
            }));
            // Get billing history
            const billingSnapshot = await firebase_1.db.collection('billing')
                .where('student_id', '==', studentId)
                .orderBy('created_at', 'desc')
                .get();
            const billingHistory = billingSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            res.json({
                id: studentId,
                ...userData,
                enrollments,
                billing_history: billingHistory,
            });
        }
        catch (error) {
            console.error('Error fetching student details:', error);
            res.status(500).json({ message: 'Failed to fetch student details' });
        }
    }
    // Get instructor by ID with detailed information
    static async getInstructorById(req, res) {
        try {
            if (!req.user || !AdminInfoController.hasAdminAccess(req.user.role)) {
                res.status(403).json({ message: 'Access denied. Admin privileges required.' });
                return;
            }
            const { instructorId } = req.params;
            const instructorDoc = await firebase_1.db.collection('users').doc(instructorId).get();
            if (!instructorDoc.exists) {
                res.status(404).json({ message: 'Instructor not found' });
                return;
            }
            const userData = instructorDoc.data();
            // Get detailed course information
            const coursesSnapshot = await firebase_1.db.collection('courses')
                .where('instructor_id', '==', instructorId)
                .get();
            const courses = await Promise.all(coursesSnapshot.docs.map(async (courseDoc) => {
                const courseData = courseDoc.data();
                // Get enrollment count
                const enrollmentsSnapshot = await firebase_1.db.collection('enrollments')
                    .where('course_id', '==', courseDoc.id)
                    .get();
                return {
                    id: courseDoc.id,
                    title: courseData.title,
                    status: courseData.status,
                    enrolled_students: enrollmentsSnapshot.size,
                    created_at: courseData.created_at,
                };
            }));
            res.json({
                id: instructorId,
                ...userData,
                courses,
            });
        }
        catch (error) {
            console.error('Error fetching instructor details:', error);
            res.status(500).json({ message: 'Failed to fetch instructor details' });
        }
    }
}
exports.AdminInfoController = AdminInfoController;
//# sourceMappingURL=admin.info.controller.js.map