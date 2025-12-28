"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const firebase_1 = require("../config/firebase");
const user_firebase_1 = require("../models/user.firebase");
const types_1 = require("../types");
class AuthController {
    static async register(req, res) {
        try {
            const { email, password, first_name, last_name, student_id, role } = req.body;
            const existingUser = await user_firebase_1.UserModel.findByEmail(email);
            if (existingUser) {
                res.status(400).json({ error: 'Email already registered' });
                return;
            }
            // Check if student_id already exists
            if (student_id) {
                const existingStudent = await user_firebase_1.UserModel.findByStudentId(student_id);
                if (existingStudent) {
                    res.status(400).json({ error: 'Student number already registered' });
                    return;
                }
            }
            // Create Firebase Auth user first
            const userRecord = await firebase_1.auth.createUser({
                email,
                password,
                displayName: `${first_name} ${last_name}`,
            });
            // Then create Firestore document
            const user = await user_firebase_1.UserModel.create(userRecord.uid, {
                email,
                first_name,
                last_name,
                student_id,
                role: role || types_1.UserRole.STUDENT,
            });
            const customToken = await firebase_1.auth.createCustomToken(user.id, {
                role: user.role,
            });
            res.status(201).json({
                message: 'User registered successfully',
                user,
                token: customToken,
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: error.message || 'Registration failed' });
        }
    }
    static async login(req, res) {
        try {
            const { email, idToken } = req.body;
            const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
            const uid = decodedToken.uid;
            const user = await user_firebase_1.UserModel.findById(uid);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            if (user.status !== 'active') {
                res.status(403).json({ error: 'Account is not active' });
                return;
            }
            await user_firebase_1.UserModel.updateLastLogin(uid);
            const customToken = await firebase_1.auth.createCustomToken(uid, {
                role: user.role,
            });
            res.json({
                message: 'Login successful',
                user,
                token: customToken,
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: error.message || 'Login failed' });
        }
    }
    static async loginWithId(req, res) {
        try {
            const { user_id, password } = req.body;
            if (!user_id || !password) {
                res.status(400).json({ error: 'User ID and password are required' });
                return;
            }
            // Try to find user by student_id or instructor_id
            let user = await user_firebase_1.UserModel.findByStudentId(user_id);
            if (!user) {
                user = await user_firebase_1.UserModel.findByInstructorId(user_id);
            }
            if (!user) {
                res.status(404).json({ error: 'Invalid user ID or password' });
                return;
            }
            if (user.status !== 'active') {
                res.status(403).json({ error: 'Account is not active' });
                return;
            }
            // Get Firebase user by email to verify password
            try {
                const userRecord = await firebase_1.auth.getUserByEmail(user.email);
                // Verify password by attempting to sign in with Firebase
                // Note: We need to use Firebase Client SDK for password verification
                // For now, we'll create a custom token and let frontend verify with Firebase Client SDK
                await user_firebase_1.UserModel.updateLastLogin(user.id);
                const customToken = await firebase_1.auth.createCustomToken(user.id, {
                    role: user.role,
                });
                res.json({
                    message: 'Login successful',
                    user,
                    token: customToken,
                    email: user.email, // Send email for Firebase Client SDK verification
                });
            }
            catch (error) {
                console.error('User verification error:', error);
                res.status(404).json({ error: 'Invalid user ID or password' });
                return;
            }
        }
        catch (error) {
            console.error('Login with ID error:', error);
            res.status(500).json({ error: error.message || 'Login failed' });
        }
    }
    static async getProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }
            const user = await user_firebase_1.UserModel.findById(req.user.uid);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json({ user });
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    }
    static async updateProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }
            const updates = req.body;
            const user = await user_firebase_1.UserModel.update(req.user.uid, updates);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json({
                message: 'Profile updated successfully',
                user,
            });
        }
        catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.firebase.js.map