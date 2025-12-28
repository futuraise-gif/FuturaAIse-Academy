import { Response } from 'express';
import { UserModel } from '../models/user.firebase';
import { AuthRequest } from '../middleware/auth.firebase';
import { UserRole, UserStatus } from '../types';

export class UserController {
  static async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { role, status, limit } = req.query;

      const users = await UserModel.findAll({
        role: role as UserRole,
        status: status as UserStatus,
        limit: limit ? parseInt(limit as string) : undefined
      });

      res.json({ users, count: users.length });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  static async updateUserStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(UserStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid status value' });
        return;
      }

      const user = await UserModel.updateStatus(id, status);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        message: 'User status updated successfully',
        user
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (req.user?.uid === id) {
        res.status(400).json({ error: 'Cannot delete your own account' });
        return;
      }

      const deleted = await UserModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}
