import { Router } from 'express';
import { AdminStudentController } from '../controllers/admin.student.controller';
import { authenticate } from '../middleware/auth.firebase';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Student Registration Routes
router.post('/students/register', AdminStudentController.registerStudent);
// NOTE: GET /students route removed - now handled by admin.info.routes for better data aggregation
router.post('/students/:studentId/enroll', AdminStudentController.enrollStudentInCourses);
router.get('/students/:studentId/enrollments', AdminStudentController.getStudentEnrollments);

// Billing Routes
router.post('/billing', AdminStudentController.createBillingRecord);
router.get('/billing', AdminStudentController.getAllBillingRecords);
router.put('/billing/:billingId/status', AdminStudentController.updateBillingStatus);
router.delete('/billing/:billingId', AdminStudentController.deleteBillingRecord);

export default router;
