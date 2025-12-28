import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { UserRole } from '../types';
import { UserModel } from '../models/user.firebase';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decodedToken = await auth.verifyIdToken(token);

    // Fetch full user data from database to get role and other info
    const userData = await UserModel.findById(decodedToken.uid);

    if (!userData) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Attach both token data and user data
    req.user = {
      ...decodedToken,
      userId: decodedToken.uid,
      role: userData.role,
      email: userData.email,
      status: userData.status,
      first_name: userData.first_name,
      last_name: userData.last_name,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
