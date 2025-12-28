"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructorAnalyticsController = void 0;
const admin = __importStar(require("firebase-admin"));
const types_1 = require("../types");
const assignment_types_1 = require("../types/assignment.types");
const attendance_types_1 = require("../types/attendance.types");
const db = admin.firestore();
class InstructorAnalyticsController {
    /**
     * Get student progress for a course
     */
    static async getStudentProgress(req, res) {
        try {
            const { courseId, studentId } = req.params;
            const user = req.user;
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            // Get student info
            const studentDoc = await db.collection('users').doc(studentId).get();
            if (!studentDoc.exists) {
                res.status(404).json({ error: 'Student not found' });
                return;
            }
            const student = studentDoc.data();
            // Get enrollment
            const enrollmentSnapshot = await db
                .collection('enrollments')
                .where('course_id', '==', courseId)
                .where('student_id', '==', studentId)
                .limit(1)
                .get();
            if (enrollmentSnapshot.empty) {
                res.status(404).json({ error: 'Student not enrolled in this course' });
                return;
            }
            const enrollment = enrollmentSnapshot.docs[0].data();
            // Get modules
            const modulesSnapshot = await db
                .collection('modules')
                .where('course_id', '==', courseId)
                .orderBy('order', 'asc')
                .get();
            const totalModules = modulesSnapshot.size;
            // Get module progress
            const moduleProgress = await Promise.all(modulesSnapshot.docs.map(async (moduleDoc) => {
                const module = moduleDoc.data();
                const progressDoc = await db
                    .collection('module_progress')
                    .where('student_id', '==', studentId)
                    .where('module_id', '==', moduleDoc.id)
                    .limit(1)
                    .get();
                const progress = progressDoc.empty ? null : progressDoc.docs[0].data();
                return {
                    module_id: moduleDoc.id,
                    module_title: module.title,
                    progress_percentage: progress?.progress_percentage || 0,
                    completed_at: progress?.completed_at,
                    time_spent_minutes: progress?.time_spent_minutes || 0,
                };
            }));
            const modulesCompleted = moduleProgress.filter((m) => m.completed_at).length;
            // Get assignments
            const assignmentsSnapshot = await db
                .collection('assignments')
                .where('course_id', '==', courseId)
                .get();
            const totalAssignments = assignmentsSnapshot.size;
            // Get submissions
            const submissionsSnapshot = await db
                .collection('assignment_submissions')
                .where('course_id', '==', courseId)
                .where('student_id', '==', studentId)
                .get();
            const submissions = submissionsSnapshot.docs.map((doc) => doc.data());
            const assignmentsCompleted = submissions.filter((s) => s.status === assignment_types_1.SubmissionStatus.GRADED || s.status === assignment_types_1.SubmissionStatus.RETURNED).length;
            const grades = submissions
                .filter((s) => s.adjusted_grade !== undefined)
                .map((s) => s.adjusted_grade);
            const averageAssignmentScore = grades.length > 0
                ? grades.reduce((a, b) => a + b, 0) / grades.length
                : 0;
            // Get attendance
            const attendanceSnapshot = await db
                .collection('attendance')
                .where('course_id', '==', courseId)
                .where('student_id', '==', studentId)
                .get();
            const attendanceRecords = attendanceSnapshot.docs.map((doc) => doc.data());
            const totalClasses = attendanceRecords.length;
            const classesAttended = attendanceRecords.filter((a) => a.status === attendance_types_1.AttendanceStatus.PRESENT ||
                a.status === attendance_types_1.AttendanceStatus.LATE ||
                a.status === attendance_types_1.AttendanceStatus.EXCUSED).length;
            const attendancePercentage = totalClasses > 0 ? (classesAttended / totalClasses) * 100 : 0;
            // Calculate overall progress
            const overallProgressPercentage = enrollment.progress || 0;
            // Calculate total time spent
            const totalTimeSpentMinutes = moduleProgress.reduce((sum, m) => sum + m.time_spent_minutes, 0);
            // Determine completion status
            let completionStatus = 'in_progress';
            if (overallProgressPercentage === 0) {
                completionStatus = 'not_started';
            }
            else if (overallProgressPercentage >= 100) {
                completionStatus = 'completed';
            }
            else if (enrollment.status === 'dropped') {
                completionStatus = 'dropped';
            }
            const progress = {
                id: enrollmentSnapshot.docs[0].id,
                student_id: studentId,
                student_name: `${student?.first_name} ${student?.last_name}`,
                student_email: student?.email || '',
                course_id: courseId,
                program_id: course?.program_id || '',
                overall_progress_percentage: Math.round(overallProgressPercentage * 100) / 100,
                modules_completed: modulesCompleted,
                total_modules: totalModules,
                total_time_spent_minutes: totalTimeSpentMinutes,
                last_accessed_at: enrollment.last_accessed_at || enrollment.enrolled_at,
                enrolled_at: enrollment.enrolled_at,
                average_assignment_score: Math.round(averageAssignmentScore * 100) / 100,
                assignments_completed: assignmentsCompleted,
                total_assignments: totalAssignments,
                attendance_percentage: Math.round(attendancePercentage * 100) / 100,
                classes_attended: classesAttended,
                total_classes: totalClasses,
                is_active: enrollment.status === 'active',
                completion_status: completionStatus,
                expected_completion_date: course?.end_date,
                actual_completion_date: enrollment.completed_at,
                module_progress: moduleProgress,
                created_at: enrollment.enrolled_at,
                updated_at: new Date().toISOString(),
            };
            res.json({ progress });
        }
        catch (error) {
            console.error('Get student progress error:', error);
            res.status(500).json({ error: 'Failed to fetch student progress' });
        }
    }
    /**
     * Get all students progress for a course
     */
    static async getCourseStudentsProgress(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            // Get all enrollments
            const enrollmentsSnapshot = await db
                .collection('enrollments')
                .where('course_id', '==', courseId)
                .get();
            const studentIds = enrollmentsSnapshot.docs.map((doc) => doc.data().student_id);
            // Get progress for each student (simplified version)
            const progressList = await Promise.all(studentIds.map(async (studentId) => {
                const studentDoc = await db.collection('users').doc(studentId).get();
                const student = studentDoc.data();
                const enrollment = enrollmentsSnapshot.docs.find((doc) => doc.data().student_id === studentId)?.data();
                // Get assignments completed
                const submissionsSnapshot = await db
                    .collection('assignment_submissions')
                    .where('course_id', '==', courseId)
                    .where('student_id', '==', studentId)
                    .get();
                const submissions = submissionsSnapshot.docs.map((doc) => doc.data());
                const assignmentsCompleted = submissions.filter((s) => s.status === assignment_types_1.SubmissionStatus.GRADED || s.status === assignment_types_1.SubmissionStatus.RETURNED).length;
                const grades = submissions
                    .filter((s) => s.adjusted_grade !== undefined)
                    .map((s) => s.adjusted_grade);
                const averageScore = grades.length > 0
                    ? grades.reduce((a, b) => a + b, 0) / grades.length
                    : 0;
                // Get attendance
                const attendanceSnapshot = await db
                    .collection('attendance')
                    .where('course_id', '==', courseId)
                    .where('student_id', '==', studentId)
                    .get();
                const attendanceRecords = attendanceSnapshot.docs.map((doc) => doc.data());
                const totalClasses = attendanceRecords.length;
                const classesAttended = attendanceRecords.filter((a) => a.status === attendance_types_1.AttendanceStatus.PRESENT ||
                    a.status === attendance_types_1.AttendanceStatus.LATE ||
                    a.status === attendance_types_1.AttendanceStatus.EXCUSED).length;
                const attendancePercentage = totalClasses > 0 ? (classesAttended / totalClasses) * 100 : 0;
                return {
                    student_id: studentId,
                    student_name: `${student?.first_name} ${student?.last_name}`,
                    student_email: student?.email || '',
                    overall_progress: enrollment?.progress || 0,
                    assignments_completed: assignmentsCompleted,
                    average_score: Math.round(averageScore * 100) / 100,
                    attendance_percentage: Math.round(attendancePercentage * 100) / 100,
                    last_accessed: enrollment?.last_accessed_at || enrollment?.enrolled_at,
                    status: enrollment?.status || 'active',
                };
            }));
            res.json({ students: progressList, total: progressList.length });
        }
        catch (error) {
            console.error('Get course students progress error:', error);
            res.status(500).json({ error: 'Failed to fetch students progress' });
        }
    }
    /**
     * Get course analytics
     */
    static async getCourseAnalytics(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            // Get enrollments
            const enrollmentsSnapshot = await db
                .collection('enrollments')
                .where('course_id', '==', courseId)
                .get();
            const totalEnrolled = enrollmentsSnapshot.size;
            const activeStudents = enrollmentsSnapshot.docs.filter((doc) => doc.data().status === 'active').length;
            const studentIds = enrollmentsSnapshot.docs.map((doc) => doc.data().student_id);
            // Calculate average completion rate
            const completionRates = enrollmentsSnapshot.docs.map((doc) => doc.data().progress || 0);
            const averageCompletionRate = completionRates.length > 0
                ? completionRates.reduce((a, b) => a + b, 0) / completionRates.length
                : 0;
            // Get all submissions
            const submissionsSnapshot = await db
                .collection('assignment_submissions')
                .where('course_id', '==', courseId)
                .get();
            const allSubmissions = submissionsSnapshot.docs.map((doc) => doc.data());
            const gradedSubmissions = allSubmissions.filter((s) => s.adjusted_grade !== undefined);
            const averageAssignmentScore = gradedSubmissions.length > 0
                ? gradedSubmissions.reduce((sum, s) => sum + s.adjusted_grade, 0) / gradedSubmissions.length
                : 0;
            // Get attendance
            const attendanceSnapshot = await db
                .collection('attendance')
                .where('course_id', '==', courseId)
                .get();
            const attendanceRecords = attendanceSnapshot.docs.map((doc) => doc.data());
            const totalAttendanceRecords = attendanceRecords.length;
            const presentRecords = attendanceRecords.filter((a) => a.status === attendance_types_1.AttendanceStatus.PRESENT ||
                a.status === attendance_types_1.AttendanceStatus.LATE ||
                a.status === attendance_types_1.AttendanceStatus.EXCUSED).length;
            const averageAttendanceRate = totalAttendanceRecords > 0
                ? (presentRecords / totalAttendanceRecords) * 100
                : 0;
            // Calculate grade distribution
            const gradeDistribution = {
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                F: 0,
            };
            gradedSubmissions.forEach((submission) => {
                const grade = submission.adjusted_grade || 0;
                const percentage = (grade / 100) * 100; // Assuming grade is out of 100
                if (percentage >= 90)
                    gradeDistribution.A++;
                else if (percentage >= 80)
                    gradeDistribution.B++;
                else if (percentage >= 70)
                    gradeDistribution.C++;
                else if (percentage >= 60)
                    gradeDistribution.D++;
                else
                    gradeDistribution.F++;
            });
            // Calculate average time per student
            let totalTimeMinutes = 0;
            for (const studentId of studentIds) {
                const moduleProgressSnapshot = await db
                    .collection('module_progress')
                    .where('student_id', '==', studentId)
                    .where('course_id', '==', courseId)
                    .get();
                moduleProgressSnapshot.docs.forEach((doc) => {
                    const progress = doc.data();
                    totalTimeMinutes += progress.time_spent_minutes || 0;
                });
            }
            const avgTimePerStudentHours = studentIds.length > 0
                ? totalTimeMinutes / studentIds.length / 60
                : 0;
            // Get module engagement stats
            const modulesSnapshot = await db
                .collection('modules')
                .where('course_id', '==', courseId)
                .get();
            const moduleEngagement = await Promise.all(modulesSnapshot.docs.map(async (moduleDoc) => {
                const progressSnapshot = await db
                    .collection('module_progress')
                    .where('module_id', '==', moduleDoc.id)
                    .get();
                const totalTime = progressSnapshot.docs.reduce((sum, doc) => sum + (doc.data().time_spent_minutes || 0), 0);
                return {
                    module_id: moduleDoc.id,
                    total_time: totalTime,
                };
            }));
            const mostActiveModule = moduleEngagement.reduce((max, m) => (m.total_time > max.total_time ? m : max), { module_id: '', total_time: 0 });
            const leastActiveModule = moduleEngagement.reduce((min, m) => (m.total_time < min.total_time && m.total_time > 0 ? m : min), { module_id: '', total_time: Infinity });
            // Get enrollment trend (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const enrollmentTrend = [];
            for (let i = 0; i < 30; i++) {
                const date = new Date(thirtyDaysAgo);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const count = enrollmentsSnapshot.docs.filter((doc) => {
                    const enrolledDate = doc.data().enrolled_at?.split('T')[0];
                    return enrolledDate === dateStr;
                }).length;
                enrollmentTrend.push({ date: dateStr, count });
            }
            const analytics = {
                course_id: courseId,
                total_enrolled: totalEnrolled,
                active_students: activeStudents,
                average_completion_rate: Math.round(averageCompletionRate * 100) / 100,
                average_assignment_score: Math.round(averageAssignmentScore * 100) / 100,
                average_attendance_rate: Math.round(averageAttendanceRate * 100) / 100,
                grade_distribution: gradeDistribution,
                avg_time_per_student_hours: Math.round(avgTimePerStudentHours * 100) / 100,
                most_active_module_id: mostActiveModule.module_id || undefined,
                least_active_module_id: leastActiveModule.module_id !== '' && leastActiveModule.total_time !== Infinity
                    ? leastActiveModule.module_id
                    : undefined,
                enrollment_trend: enrollmentTrend,
                updated_at: new Date().toISOString(),
            };
            res.json({ analytics });
        }
        catch (error) {
            console.error('Get course analytics error:', error);
            res.status(500).json({ error: 'Failed to fetch course analytics' });
        }
    }
    /**
     * Get performance metrics for a student
     */
    static async getStudentPerformanceMetrics(req, res) {
        try {
            const { courseId, studentId } = req.params;
            const user = req.user;
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            // Get assignments and submissions
            const assignmentsSnapshot = await db
                .collection('assignments')
                .where('course_id', '==', courseId)
                .orderBy('created_at', 'asc')
                .get();
            const performanceData = await Promise.all(assignmentsSnapshot.docs.map(async (assignmentDoc) => {
                const assignment = assignmentDoc.data();
                const submissionSnapshot = await db
                    .collection('assignment_submissions')
                    .where('assignment_id', '==', assignmentDoc.id)
                    .where('student_id', '==', studentId)
                    .limit(1)
                    .get();
                if (!submissionSnapshot.empty) {
                    const submission = submissionSnapshot.docs[0].data();
                    return {
                        assignment_id: assignmentDoc.id,
                        assignment_title: assignment.title,
                        due_date: assignment.due_date,
                        max_points: assignment.points,
                        grade: submission.grade,
                        adjusted_grade: submission.adjusted_grade,
                        percentage: submission.adjusted_grade
                            ? (submission.adjusted_grade / assignment.points) * 100
                            : 0,
                        submitted_at: submission.submitted_at,
                        is_late: submission.is_late,
                        status: submission.status,
                    };
                }
                return {
                    assignment_id: assignmentDoc.id,
                    assignment_title: assignment.title,
                    due_date: assignment.due_date,
                    max_points: assignment.points,
                    grade: null,
                    adjusted_grade: null,
                    percentage: 0,
                    submitted_at: null,
                    is_late: false,
                    status: 'not_submitted',
                };
            }));
            // Get attendance trend
            const attendanceSnapshot = await db
                .collection('attendance')
                .where('course_id', '==', courseId)
                .where('student_id', '==', studentId)
                .orderBy('marked_at', 'asc')
                .get();
            const attendanceTrend = attendanceSnapshot.docs.map((doc) => {
                const record = doc.data();
                return {
                    date: record.marked_at,
                    status: record.status,
                    module_id: record.module_id,
                };
            });
            res.json({
                metrics: {
                    assignment_performance: performanceData,
                    attendance_trend: attendanceTrend,
                },
            });
        }
        catch (error) {
            console.error('Get performance metrics error:', error);
            res.status(500).json({ error: 'Failed to fetch performance metrics' });
        }
    }
    /**
     * Get instructor dashboard summary
     */
    static async getInstructorDashboard(req, res) {
        try {
            const user = req.user;
            // Get all courses for instructor
            const coursesSnapshot = await db
                .collection('courses')
                .where('instructor_id', '==', user.userId)
                .get();
            const courseIds = coursesSnapshot.docs.map((doc) => doc.id);
            // Get total students across all courses
            let totalStudents = 0;
            let activeStudents = 0;
            for (const courseId of courseIds) {
                const enrollmentsSnapshot = await db
                    .collection('enrollments')
                    .where('course_id', '==', courseId)
                    .get();
                totalStudents += enrollmentsSnapshot.size;
                activeStudents += enrollmentsSnapshot.docs.filter((doc) => doc.data().status === 'active').length;
            }
            // Get pending grading count
            let pendingGrading = 0;
            for (const courseId of courseIds) {
                const submissionsSnapshot = await db
                    .collection('assignment_submissions')
                    .where('course_id', '==', courseId)
                    .where('status', '==', assignment_types_1.SubmissionStatus.SUBMITTED)
                    .get();
                pendingGrading += submissionsSnapshot.size;
            }
            // Get recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoStr = sevenDaysAgo.toISOString();
            let recentSubmissions = 0;
            for (const courseId of courseIds) {
                const recentSubmissionsSnapshot = await db
                    .collection('assignment_submissions')
                    .where('course_id', '==', courseId)
                    .where('submitted_at', '>=', sevenDaysAgoStr)
                    .get();
                recentSubmissions += recentSubmissionsSnapshot.size;
            }
            const summary = {
                total_courses: courseIds.length,
                total_students: totalStudents,
                active_students: activeStudents,
                pending_grading: pendingGrading,
                recent_submissions: recentSubmissions,
            };
            res.json({ dashboard: summary });
        }
        catch (error) {
            console.error('Get instructor dashboard error:', error);
            res.status(500).json({ error: 'Failed to fetch dashboard summary' });
        }
    }
}
exports.InstructorAnalyticsController = InstructorAnalyticsController;
//# sourceMappingURL=instructor.analytics.controller.js.map