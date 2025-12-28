"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_firebase_1 = require("../models/user.firebase");
const types_1 = require("../types");
class UserController {
    static async getAllUsers(req, res) {
        try {
            const { role, status, limit } = req.query;
            const users = await user_firebase_1.UserModel.findAll({
                role: role,
                status: status,
                limit: limit ? parseInt(limit) : undefined
            });
            res.json({ users, count: users.length });
        }
        catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await user_firebase_1.UserModel.findById(id);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json({ user });
        }
        catch (error) {
            console.error('Get user by ID error:', error);
            res.status(500).json({ error: 'Failed to fetch user' });
        }
    }
    static async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!Object.values(types_1.UserStatus).includes(status)) {
                res.status(400).json({ error: 'Invalid status value' });
                return;
            }
            const user = await user_firebase_1.UserModel.updateStatus(id, status);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json({
                message: 'User status updated successfully',
                user
            });
        }
        catch (error) {
            console.error('Update user status error:', error);
            res.status(500).json({ error: 'Failed to update user status' });
        }
    }
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            if (req.user?.uid === id) {
                res.status(400).json({ error: 'Cannot delete your own account' });
                return;
            }
            const deleted = await user_firebase_1.UserModel.delete(id);
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
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map