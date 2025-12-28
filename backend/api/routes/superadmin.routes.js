"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superadmin_controller_1 = require("../controllers/superadmin.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
/**
 * @route   POST /api/superadmin/users
 * @desc    Create a new user (student, instructor, or admin)
 * @access  Super Admin only
 */
router.post('/users', superadmin_controller_1.SuperAdminController.createUser);
/**
 * @route   GET /api/superadmin/users
 * @desc    Get all users with filters
 * @access  Super Admin only
 */
router.get('/users', superadmin_controller_1.SuperAdminController.getAllUsers);
/**
 * @route   PUT /api/superadmin/users/:userId
 * @desc    Update user information
 * @access  Super Admin only
 */
router.put('/users/:userId', superadmin_controller_1.SuperAdminController.updateUser);
/**
 * @route   DELETE /api/superadmin/users/:userId
 * @desc    Delete a user
 * @access  Super Admin only
 */
router.delete('/users/:userId', superadmin_controller_1.SuperAdminController.deleteUser);
/**
 * @route   POST /api/superadmin/users/:userId/reset-password
 * @desc    Reset user password
 * @access  Super Admin only
 */
router.post('/users/:userId/reset-password', superadmin_controller_1.SuperAdminController.resetPassword);
/**
 * @route   GET /api/superadmin/statistics
 * @desc    Get system statistics
 * @access  Super Admin only
 */
router.get('/statistics', superadmin_controller_1.SuperAdminController.getStatistics);
/**
 * @route   POST /api/superadmin/users/bulk-status
 * @desc    Bulk update user status
 * @access  Super Admin only
 */
router.post('/users/bulk-status', superadmin_controller_1.SuperAdminController.bulkUpdateStatus);
/**
 * @route   GET /api/superadmin/users/export-csv
 * @desc    Export users to CSV
 * @access  Super Admin only
 */
router.get('/users/export-csv', superadmin_controller_1.SuperAdminController.exportUsersCSV);
/**
 * @route   POST /api/superadmin/users/bulk-import
 * @desc    Bulk import users from CSV
 * @access  Super Admin only
 */
router.post('/users/bulk-import', superadmin_controller_1.SuperAdminController.bulkImportUsers);
exports.default = router;
//# sourceMappingURL=superadmin.routes.js.map