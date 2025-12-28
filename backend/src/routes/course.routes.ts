import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticate } from '../middleware/auth.firebase';
import {
  createCourseValidator,
  updateCourseValidator,
  enrollStudentValidator,
  courseIdValidator,
  getCoursesValidator,
  enrollByCourseCodeValidator,
} from '../validators/course.validator';
import { validate } from '../middleware/validate';

const router = Router();

// All course routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/courses
 * @desc    Create a new course
 * @access  Instructor, Admin
 */
router.post(
  '/',
  createCourseValidator,
  validate,
  CourseController.createCourse
);

/**
 * @route   GET /api/v1/courses
 * @desc    Get all courses (filtered by role)
 * @access  All authenticated users
 */
router.get(
  '/',
  getCoursesValidator,
  validate,
  CourseController.getAllCourses
);

/**
 * @route   GET /api/v1/courses/my-courses
 * @desc    Get all courses the authenticated user is enrolled in
 * @access  All authenticated users
 */
router.get(
  '/my-courses',
  CourseController.getMyEnrolledCourses
);

/**
 * @route   POST /api/v1/courses/enroll
 * @desc    Self-enroll in a course using course code
 * @access  All authenticated users
 */
router.post(
  '/enroll',
  enrollByCourseCodeValidator,
  validate,
  CourseController.selfEnroll
);

/**
 * @route   GET /api/v1/courses/:courseId
 * @desc    Get a single course by ID
 * @access  All authenticated users (with access control)
 */
router.get(
  '/:courseId',
  courseIdValidator,
  validate,
  CourseController.getCourseById
);

/**
 * @route   PUT /api/v1/courses/:courseId
 * @desc    Update a course
 * @access  Course Instructor, Admin
 */
router.put(
  '/:courseId',
  updateCourseValidator,
  validate,
  CourseController.updateCourse
);

/**
 * @route   DELETE /api/v1/courses/:courseId
 * @desc    Delete (archive) a course
 * @access  Course Instructor, Admin
 */
router.delete(
  '/:courseId',
  courseIdValidator,
  validate,
  CourseController.deleteCourse
);

/**
 * @route   POST /api/v1/courses/:courseId/publish
 * @desc    Publish a course
 * @access  Course Instructor, Admin
 */
router.post(
  '/:courseId/publish',
  courseIdValidator,
  validate,
  CourseController.publishCourse
);

/**
 * @route   POST /api/v1/courses/:courseId/enroll
 * @desc    Enroll a student in a course
 * @access  Course Instructor, Admin
 */
router.post(
  '/:courseId/enroll',
  enrollStudentValidator,
  validate,
  CourseController.enrollStudent
);

/**
 * @route   DELETE /api/v1/courses/:courseId/students/:userId
 * @desc    Drop a student from a course
 * @access  Student (self), Course Instructor, Admin
 */
router.delete(
  '/:courseId/students/:userId',
  CourseController.dropStudent
);

/**
 * @route   GET /api/v1/courses/:courseId/enrollments
 * @desc    Get all enrollments for a course
 * @access  Course Instructor, Admin
 */
router.get(
  '/:courseId/enrollments',
  courseIdValidator,
  validate,
  CourseController.getCourseEnrollments
);

export default router;
