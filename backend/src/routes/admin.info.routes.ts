import { Router } from 'express';
import { AdminInfoController } from '../controllers/admin.info.controller';
import { authenticate } from '../middleware/auth.firebase';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Student Information Routes
router.get('/students', AdminInfoController.getAllStudents);
router.get('/students/:studentId', AdminInfoController.getStudentById);

// Instructor Information Routes
router.get('/instructors', AdminInfoController.getAllInstructors);
router.get('/instructors/:instructorId', AdminInfoController.getInstructorById);

export default router;
