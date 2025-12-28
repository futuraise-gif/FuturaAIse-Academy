import { Router } from 'express';
import { SuperAdminController } from '../controllers/superadmin.controller';
import { authenticate } from '../middleware/auth.firebase';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/superadmin/users
 * @desc    Create a new user (student, instructor, or admin)
 * @access  Super Admin only
 */
router.post('/users', SuperAdminController.createUser);

/**
 * @route   GET /api/superadmin/users
 * @desc    Get all users with filters
 * @access  Super Admin only
 */
router.get('/users', SuperAdminController.getAllUsers);

/**
 * @route   PUT /api/superadmin/users/:userId
 * @desc    Update user information
 * @access  Super Admin only
 */
router.put('/users/:userId', SuperAdminController.updateUser);

/**
 * @route   DELETE /api/superadmin/users/:userId
 * @desc    Delete a user
 * @access  Super Admin only
 */
router.delete('/users/:userId', SuperAdminController.deleteUser);

/**
 * @route   POST /api/superadmin/users/:userId/reset-password
 * @desc    Reset user password
 * @access  Super Admin only
 */
router.post('/users/:userId/reset-password', SuperAdminController.resetPassword);

/**
 * @route   GET /api/superadmin/statistics
 * @desc    Get system statistics
 * @access  Super Admin only
 */
router.get('/statistics', SuperAdminController.getStatistics);

/**
 * @route   POST /api/superadmin/users/bulk-status
 * @desc    Bulk update user status
 * @access  Super Admin only
 */
router.post('/users/bulk-status', SuperAdminController.bulkUpdateStatus);

/**
 * @route   GET /api/superadmin/users/export-csv
 * @desc    Export users to CSV
 * @access  Super Admin only
 */
router.get('/users/export-csv', SuperAdminController.exportUsersCSV);

/**
 * @route   POST /api/superadmin/users/bulk-import
 * @desc    Bulk import users from CSV
 * @access  Super Admin only
 */
router.post('/users/bulk-import', SuperAdminController.bulkImportUsers);

export default router;
