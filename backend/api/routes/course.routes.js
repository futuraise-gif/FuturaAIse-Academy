"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("../controllers/course.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const course_validator_1 = require("../validators/course.validator");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// All course routes require authentication
router.use(auth_firebase_1.authenticate);
/**
 * @route   POST /api/v1/courses
 * @desc    Create a new course
 * @access  Instructor, Admin
 */
router.post('/', course_validator_1.createCourseValidator, validate_1.validate, course_controller_1.CourseController.createCourse);
/**
 * @route   GET /api/v1/courses
 * @desc    Get all courses (filtered by role)
 * @access  All authenticated users
 */
router.get('/', course_validator_1.getCoursesValidator, validate_1.validate, course_controller_1.CourseController.getAllCourses);
/**
 * @route   GET /api/v1/courses/my-courses
 * @desc    Get all courses the authenticated user is enrolled in
 * @access  All authenticated users
 */
router.get('/my-courses', course_controller_1.CourseController.getMyEnrolledCourses);
/**
 * @route   POST /api/v1/courses/enroll
 * @desc    Self-enroll in a course using course code
 * @access  All authenticated users
 */
router.post('/enroll', course_validator_1.enrollByCourseCodeValidator, validate_1.validate, course_controller_1.CourseController.selfEnroll);
/**
 * @route   GET /api/v1/courses/:courseId
 * @desc    Get a single course by ID
 * @access  All authenticated users (with access control)
 */
router.get('/:courseId', course_validator_1.courseIdValidator, validate_1.validate, course_controller_1.CourseController.getCourseById);
/**
 * @route   PUT /api/v1/courses/:courseId
 * @desc    Update a course
 * @access  Course Instructor, Admin
 */
router.put('/:courseId', course_validator_1.updateCourseValidator, validate_1.validate, course_controller_1.CourseController.updateCourse);
/**
 * @route   DELETE /api/v1/courses/:courseId
 * @desc    Delete (archive) a course
 * @access  Course Instructor, Admin
 */
router.delete('/:courseId', course_validator_1.courseIdValidator, validate_1.validate, course_controller_1.CourseController.deleteCourse);
/**
 * @route   POST /api/v1/courses/:courseId/publish
 * @desc    Publish a course
 * @access  Course Instructor, Admin
 */
router.post('/:courseId/publish', course_validator_1.courseIdValidator, validate_1.validate, course_controller_1.CourseController.publishCourse);
/**
 * @route   POST /api/v1/courses/:courseId/enroll
 * @desc    Enroll a student in a course
 * @access  Course Instructor, Admin
 */
router.post('/:courseId/enroll', course_validator_1.enrollStudentValidator, validate_1.validate, course_controller_1.CourseController.enrollStudent);
/**
 * @route   DELETE /api/v1/courses/:courseId/students/:userId
 * @desc    Drop a student from a course
 * @access  Student (self), Course Instructor, Admin
 */
router.delete('/:courseId/students/:userId', course_controller_1.CourseController.dropStudent);
/**
 * @route   GET /api/v1/courses/:courseId/enrollments
 * @desc    Get all enrollments for a course
 * @access  Course Instructor, Admin
 */
router.get('/:courseId/enrollments', course_validator_1.courseIdValidator, validate_1.validate, course_controller_1.CourseController.getCourseEnrollments);
exports.default = router;
//# sourceMappingURL=course.routes.js.map