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
exports.SuperAdminController = void 0;
const user_firebase_1 = require("../models/user.firebase");
const types_1 = require("../types");
const admin = __importStar(require("firebase-admin"));
class SuperAdminController {
    /**
     * Generate unique student ID (STU{YEAR}{NUMBER})
     */
    static async generateStudentId() {
        const year = new Date().getFullYear();
        const db = admin.firestore();
        // Get count of students for sequential numbering
        const usersSnapshot = await db.collection('users')
            .where('role', '==', types_1.UserRole.STUDENT)
            .get();
        const count = usersSnapshot.size + 1;
        const paddedCount = count.toString().padStart(4, '0');
        return `STU${year}${paddedCount}`;
    }
    /**
     * Generate unique instructor ID (INS{YEAR}{NUMBER})
     */
    static async generateInstructorId() {
        const year = new Date().getFullYear();
        const db = admin.firestore();
        // Get count of instructors for sequential numbering
        const usersSnapshot = await db.collection('users')
            .where('role', '==', types_1.UserRole.INSTRUCTOR)
            .get();
        const count = usersSnapshot.size + 1;
        const paddedCount = count.toString().padStart(4, '0');
        return `INS${year}${paddedCount}`;
    }
    /**
     * Create user (Student, Instructor, or Admin) - Super Admin only
     */
    static async createUser(req, res) {
        try {
            const user = req.user;
            const db = admin.firestore();
            // Only super admin can create users
            if (user.role !== types_1.UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: 'Only Super Admin can create users' });
                return;
            }
            const { email, password, first_name, last_name, role, phone, date_of_birth, address, city, state, country, postal_code, emergency_contact_name, emergency_contact_phone, guardian_name, guardian_phone, guardian_email, enroll_in_courses } = req.body;
            // Validate required fields
            if (!email || !password || !first_name || !last_name || !role) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            // Validate role
            if (!Object.values(types_1.UserRole).includes(role)) {
                res.status(400).json({ error: 'Invalid role' });
                return;
            }
            // Check if email already exists
            const existingUser = await user_firebase_1.UserModel.findByEmail(email);
            if (existingUser) {
                res.status(400).json({ error: 'Email already registered' });
                return;
            }
            // Create Firebase Auth user
            let firebaseUser;
            try {
                firebaseUser = await admin.auth().createUser({
                    email,
                    password,
                    displayName: `${first_name} ${last_name}`,
                });
            }
            catch (error) {
                console.error('Firebase Auth error:', error);
                res.status(400).json({ error: error.message });
                return;
            }
            // Generate ID based on role
            let student_id;
            let instructor_id;
            if (role === types_1.UserRole.STUDENT) {
                student_id = await SuperAdminController.generateStudentId();
            }
            else if (role === types_1.UserRole.INSTRUCTOR) {
                instructor_id = await SuperAdminController.generateInstructorId();
            }
            // Create user in Firestore with all fields
            const userData = {
                email,
                first_name,
                last_name,
                role,
                status: types_1.UserStatus.ACTIVE,
                student_id,
                instructor_id,
            };
            // Add optional fields only if they have values
            if (phone)
                userData.phone = phone;
            if (date_of_birth)
                userData.date_of_birth = date_of_birth;
            if (address)
                userData.address = address;
            if (city)
                userData.city = city;
            if (state)
                userData.state = state;
            if (country)
                userData.country = country;
            if (postal_code)
                userData.postal_code = postal_code;
            if (emergency_contact_name)
                userData.emergency_contact_name = emergency_contact_name;
            if (emergency_contact_phone)
                userData.emergency_contact_phone = emergency_contact_phone;
            if (guardian_name)
                userData.guardian_name = guardian_name;
            if (guardian_phone)
                userData.guardian_phone = guardian_phone;
            if (guardian_email)
                userData.guardian_email = guardian_email;
            const newUser = await user_firebase_1.UserModel.create(firebaseUser.uid, userData);
            // Enroll student in courses if specified
            if (role === types_1.UserRole.STUDENT && enroll_in_courses && enroll_in_courses.length > 0) {
                console.log(`Enrolling student ${firebaseUser.uid} in ${enroll_in_courses.length} courses:`, enroll_in_courses);
                for (const courseId of enroll_in_courses) {
                    try {
                        await db.collection('courses').doc(courseId).collection('enrollments').doc(firebaseUser.uid).set({
                            user_id: firebaseUser.uid,
                            course_id: courseId,
                            status: 'active',
                            enrolled_at: new Date().toISOString(),
                        });
                        console.log(`✓ Successfully enrolled in course ${courseId}`);
                    }
                    catch (error) {
                        console.error(`✗ Failed to enroll in course ${courseId}:`, error);
                    }
                }
            }
            else {
                console.log(`No course enrollment: role=${role}, courses=${enroll_in_courses?.length || 0}`);
            }
            res.status(201).json({
                message: 'User created successfully',
                user: newUser,
                enrolled_courses: enroll_in_courses || [],
                login_credentials: {
                    email,
                    student_id: student_id || null,
                    instructor_id: instructor_id || null,
                    password: '(Use the password provided)',
                },
            });
        }
        catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }
    /**
     * Get all users with filters - Super Admin only
     */
    static async getAllUsers(req, res) {
        try {
            const user = req.user;
            if (user.role !== types_1.UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: 'Only Super Admin can view all users' });
                return;
            }
            const { role, status, search } = req.query;
            const db = admin.firestore();
            let query = db.collection('users');
            // Apply filters
            if (role) {
                query = query.where('role', '==', role);
            }
            if (status) {
                query = query.where('status', '==', status);
            }
            // Removed orderBy to avoid composite index requirement
            const snapshot = await query.get();
            let users = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    created_at: typeof data.created_at === 'string' ? data.created_at : data.created_at?.toDate?.().toISOString(),
                    updated_at: typeof data.updated_at === 'string' ? data.updated_at : data.updated_at?.toDate?.().toISOString(),
                    last_login: typeof data.last_login === 'string' ? data.last_login : data.last_login?.toDate?.().toISOString(),
                };
            });
            // Sort by created_at in application layer (most recent first)
            users.sort((a, b) => {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            });
            // Apply search filter if provided
            if (search) {
                const searchLower = search.toLowerCase();
                users = users.filter((u) => u.first_name?.toLowerCase().includes(searchLower) ||
                    u.last_name?.toLowerCase().includes(searchLower) ||
                    u.email?.toLowerCase().includes(searchLower) ||
                    u.student_id?.toLowerCase().includes(searchLower) ||
                    u.instructor_id?.toLowerCase().includes(searchLower));
            }
            res.json({
                users,
                count: users.length,
            });
        }
        catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
    /**
     * Update user - Super Admin only
     */
    static async updateUser(req, res) {
        try {
            const user = req.user;
            const { userId } = req.params;
            if (user.role !== types_1.UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: 'Only Super Admin can update users' });
                return;
            }
            const updates = req.body;
            // Prevent updating sensitive fields directly
            delete updates.password_hash;
            delete updates.id;
            delete updates.created_at;
            // If role is being changed, generate appropriate ID
            if (updates.role) {
                const targetUser = await user_firebase_1.UserModel.findById(userId);
                if (!targetUser) {
                    res.status(404).json({ error: 'User not found' });
                    return;
                }
                // Generate new ID if role changed
                if (updates.role !== targetUser.role) {
                    if (updates.role === types_1.UserRole.STUDENT && !targetUser.student_id) {
                        updates.student_id = await this.generateStudentId();
                        updates.instructor_id = null;
                    }
                    else if (updates.role === types_1.UserRole.INSTRUCTOR && !targetUser.instructor_id) {
                        updates.instructor_id = await this.generateInstructorId();
                        updates.student_id = null;
                    }
                    else if (updates.role === types_1.UserRole.ADMIN || updates.role === types_1.UserRole.SUPER_ADMIN) {
                        updates.student_id = null;
                        updates.instructor_id = null;
                    }
                }
            }
            const updatedUser = await user_firebase_1.UserModel.update(userId, updates);
            if (!updatedUser) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json({
                message: 'User updated successfully',
                user: updatedUser,
            });
        }
        catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    }
    /**
     * Delete user - Super Admin only
     */
    static async deleteUser(req, res) {
        try {
            const user = req.user;
            const { userId } = req.params;
            if (user.role !== types_1.UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: 'Only Super Admin can delete users' });
                return;
            }
            // Prevent deleting yourself
            if (user.userId === userId) {
                res.status(400).json({ error: 'Cannot delete your own account' });
                return;
            }
            // Delete from Firebase Auth
            try {
                await admin.auth().deleteUser(userId);
            }
            catch (error) {
                console.error('Firebase Auth delete error:', error);
                // Continue even if Firebase Auth deletion fails
            }
            // Delete from Firestore
            const deleted = await user_firebase_1.UserModel.delete(userId);
            if (!deleted) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }
    /**
     * Reset user password - Super Admin only
     */
    static async resetPassword(req, res) {
        try {
            const user = req.user;
            const { userId } = req.params;
            const { new_password } = req.body;
            if (user.role !== types_1.UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: 'Only Super Admin can reset passwords' });
                return;
            }
            if (!new_password || new_password.length < 8) {
                res.status(400).json({ error: 'Password must be at least 8 characters' });
                return;
            }
            // Update password in Firebase Auth
            try {
                await admin.auth().updateUser(userId, {
                    password: new_password,
                });
            }
            catch (error) {
                console.error('Firebase Auth password reset error:', error);
                res.status(400).json({ error: error.message });
                return;
            }
            res.json({
                message: 'Password reset successfully',
                new_password,
            });
        }
        catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ error: 'Failed to reset password' });
        }
    }
    /**
     * Get system statistics - Super Admin only
     */
    static async getStatistics(req, res) {
        try {
            const user = req.user;
            if (user.role !== types_1.UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: 'Only Super Admin can view statistics' });
                return;
            }
            const db = admin.firestore();
            // Count users by role
            const usersSnapshot = await db.collection('users').get();
            const users = usersSnapshot.docs.map((doc) => doc.data());
            // Count courses
            const coursesSnapshot = await db.collection('courses').get();
            const statistics = {
                total_users: users.length,
                students: users.filter((u) => u.role === types_1.UserRole.STUDENT).length,
                instructors: users.filter((u) => u.role === types_1.UserRole.INSTRUCTOR).length,
                admins: users.filter((u) => u.role === types_1.UserRole.ADMIN).length,
                super_admins: users.filter((u) => u.role === types_1.UserRole.SUPER_ADMIN).length,
                active_users: users.filter((u) => u.status === types_1.UserStatus.ACTIVE).length,
                inactive_users: users.filter((u) => u.status === types_1.UserStatus.INACTIVE).length,
                suspended_users: users.filter((u) => u.status === types_1.UserStatus.SUSPENDED).length,
                total_courses: coursesSnapshot.size,
            };
            res.json(statistics);
        }
        catch (error) {
            console.error('Get statistics error:', error);
            res.status(500).json({ error: 'Failed to fetch statistics' });
        }
    }
    /**
     * Bulk update user status - Super Admin only
     */
    static async bulkUpdateStatus(req, res) {
        try {
            const user = req.user;
            if (user.role !== types_1.UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: 'Only Super Admin can bulk update users' });
                return;
            }
            const { user_ids, status } = req.body;
            if (!Array.isArray(user_ids) || user_ids.length === 0) {
                res.status(400).json({ error: 'user_ids must be a non-empty array' });
                return;
            }
            if (!Object.values(types_1.UserStatus).includes(status)) {
                res.status(400).json({ error: 'Invalid status value' });
                return;
            }
            const results = {
                success: [],
                failed: [],
            };
            for (const userId of user_ids) {
                try {
                    // Prevent updating yourself
                    if (userId === user.userId) {
                        results.failed.push({
                            userId,
                            error: 'Cannot update your own status',
                        });
                        continue;
                    }
                    const updatedUser = await user_firebase_1.UserModel.updateStatus(userId, status);
                    if (updatedUser) {
                        results.success.push(userId);
                    }
                    else {
                        results.failed.push({
                            userId,
                            error: 'User not found',
                        });
                    }
                }
                catch (error) {
                    results.failed.push({
                        userId,
                        error: error.message,
                    });
                }
            }
            res.json({
                message: 'Bulk update completed',
                total: user_ids.length,
                success_count: results.success.length,
                failed_count: results.failed.length,
                results,
            });
        }
        catch (error) {
            console.error('Bulk update status error:', error);
            res.status(500).json({ error: 'Failed to bulk update users' });
        }
    }
    /**
     * Export users to CSV - Super Admin only
     */
    static async exportUsersCSV(req, res) {
        try {
            const user = req.user;
            if (user.role !== types_1.UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: 'Only Super Admin can export users' });
                return;
            }
            const { role, status } = req.query;
            const db = admin.firestore();
            let query = db.collection('users');
            if (role) {
                query = query.where('role', '==', role);
            }
            if (status) {
                query = query.where('status', '==', status);
            }
            const snapshot = await query.orderBy('created_at', 'desc').get();
            const users = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Generate CSV
            const csvHeaders = [
                'ID',
                'Email',
                'First Name',
                'Last Name',
                'Role',
                'Status',
                'Student ID',
                'Instructor ID',
                'Phone',
                'Created At',
                'Last Login',
            ];
            const csvRows = users.map((u) => [
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                u.role,
                u.status,
                u.student_id || '',
                u.instructor_id || '',
                u.phone || '',
                u.created_at || '',
                u.last_login || '',
            ]);
            const csvContent = [
                csvHeaders.join(','),
                ...csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
            ].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="users-export-${Date.now()}.csv"`);
            res.send(csvContent);
        }
        catch (error) {
            console.error('Export users error:', error);
            res.status(500).json({ error: 'Failed to export users' });
        }
    }
    /**
     * Bulk import users from CSV - Super Admin only
     */
    static async bulkImportUsers(req, res) {
        try {
            const user = req.user;
            if (user.role !== types_1.UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: 'Only Super Admin can import users' });
                return;
            }
            const { users } = req.body;
            if (!Array.isArray(users) || users.length === 0) {
                res.status(400).json({ error: 'Invalid users array' });
                return;
            }
            const results = {
                success: [],
                failed: [],
            };
            for (const userData of users) {
                try {
                    const { email, password, first_name, last_name, role } = userData;
                    // Validate required fields
                    if (!email || !password || !first_name || !last_name || !role) {
                        results.failed.push({
                            email,
                            error: 'Missing required fields',
                        });
                        continue;
                    }
                    // Check if email already exists
                    const existingUser = await user_firebase_1.UserModel.findByEmail(email);
                    if (existingUser) {
                        results.failed.push({
                            email,
                            error: 'Email already registered',
                        });
                        continue;
                    }
                    // Create Firebase Auth user
                    const firebaseUser = await admin.auth().createUser({
                        email,
                        password,
                        displayName: `${first_name} ${last_name}`,
                    });
                    // Generate ID based on role
                    let student_id;
                    let instructor_id;
                    if (role === types_1.UserRole.STUDENT) {
                        student_id = await this.generateStudentId();
                    }
                    else if (role === types_1.UserRole.INSTRUCTOR) {
                        instructor_id = await this.generateInstructorId();
                    }
                    // Create user in Firestore
                    const newUser = await user_firebase_1.UserModel.create(firebaseUser.uid, {
                        email,
                        first_name,
                        last_name,
                        role,
                        status: types_1.UserStatus.ACTIVE,
                        student_id,
                        instructor_id,
                    });
                    results.success.push({
                        email,
                        student_id,
                        instructor_id,
                        user: newUser,
                    });
                }
                catch (error) {
                    results.failed.push({
                        email: userData.email,
                        error: error.message,
                    });
                }
            }
            res.json({
                message: 'Bulk import completed',
                total: users.length,
                success_count: results.success.length,
                failed_count: results.failed.length,
                results,
            });
        }
        catch (error) {
            console.error('Bulk import error:', error);
            res.status(500).json({ error: 'Failed to import users' });
        }
    }
}
exports.SuperAdminController = SuperAdminController;
//# sourceMappingURL=superadmin.controller.js.map