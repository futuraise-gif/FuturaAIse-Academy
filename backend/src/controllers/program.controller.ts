import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
import * as admin from 'firebase-admin';
import { UserRole } from '../types';
import {
  Program,
  CreateProgramDTO,
  UpdateProgramDTO,
  ProgramStatus,
} from '../types/program.types';

const db = admin.firestore();

export class ProgramController {
  /**
   * Create a new program - Instructor only
   */
  static async createProgram(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      // Only instructors can create programs
      if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only instructors can create programs' });
        return;
      }

      const data: CreateProgramDTO = req.body;

      // Validation
      if (!data.title || !data.description || !data.level || !data.duration_weeks) {
        res.status(400).json({ error: 'Title, description, level, and duration are required' });
        return;
      }

      // Get instructor name
      const userDoc = await db.collection('users').doc(user.userId).get();
      const userData = userDoc.data();

      const now = new Date().toISOString();
      const program: Omit<Program, 'id'> = {
        title: data.title,
        description: data.description,
        instructor_id: user.userId,
        instructor_name: `${userData?.first_name} ${userData?.last_name}`,
        level: data.level,
        status: ProgramStatus.DRAFT,
        thumbnail_url: data.thumbnail_url || '',
        duration_weeks: data.duration_weeks,
        tags: data.tags || [],
        prerequisites: data.prerequisites || [],
        learning_outcomes: data.learning_outcomes || [],
        total_courses: 0,
        enrolled_students: 0,
        created_at: now,
        updated_at: now,
      };

      const programRef = await db.collection('programs').add(program);

      res.status(201).json({
        message: 'Program created successfully',
        program: {
          id: programRef.id,
          ...program,
        },
      });
    } catch (error: any) {
      console.error('Create program error:', error);
      res.status(500).json({ error: 'Failed to create program' });
    }
  }

  /**
   * Get all programs for an instructor
   */
  static async getInstructorPrograms(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Instructor access required' });
        return;
      }

      const snapshot = await db
        .collection('programs')
        .where('instructor_id', '==', user.userId)
        .get();

      const programs = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      res.json({ programs });
    } catch (error: any) {
      console.error('Get programs error:', error);
      res.status(500).json({ error: 'Failed to fetch programs' });
    }
  }

  /**
   * Get program details
   */
  static async getProgramById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { programId } = req.params;
      const user = req.user!;

      const programDoc = await db.collection('programs').doc(programId).get();

      if (!programDoc.exists) {
        res.status(404).json({ error: 'Program not found' });
        return;
      }

      const program = { id: programDoc.id, ...programDoc.data() } as Program;

      // Verify ownership or allow all instructors to view published programs
      if (
        program.instructor_id !== user.userId &&
        program.status !== ProgramStatus.PUBLISHED &&
        user.role !== UserRole.ADMIN
      ) {
        res.status(403).json({ error: 'Not authorized to view this program' });
        return;
      }

      // Get courses count
      const coursesSnapshot = await db
        .collection('programs')
        .doc(programId)
        .collection('courses')
        .get();

      program.total_courses = coursesSnapshot.size;

      res.json({ program });
    } catch (error: any) {
      console.error('Get program error:', error);
      res.status(500).json({ error: 'Failed to fetch program' });
    }
  }

  /**
   * Update program
   */
  static async updateProgram(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { programId } = req.params;
      const user = req.user!;
      const updates: UpdateProgramDTO = req.body;

      const programDoc = await db.collection('programs').doc(programId).get();

      if (!programDoc.exists) {
        res.status(404).json({ error: 'Program not found' });
        return;
      }

      const program = programDoc.data() as Program;

      // Verify ownership
      if (program.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized to update this program' });
        return;
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await db.collection('programs').doc(programId).update(updateData);

      res.json({
        message: 'Program updated successfully',
        program: {
          ...program,
          ...updateData,
        },
      });
    } catch (error: any) {
      console.error('Update program error:', error);
      res.status(500).json({ error: 'Failed to update program' });
    }
  }

  /**
   * Delete program
   */
  static async deleteProgram(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { programId } = req.params;
      const user = req.user!;

      const programDoc = await db.collection('programs').doc(programId).get();

      if (!programDoc.exists) {
        res.status(404).json({ error: 'Program not found' });
        return;
      }

      const program = programDoc.data() as Program;

      // Verify ownership
      if (program.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized to delete this program' });
        return;
      }

      // Check if program has courses
      const coursesSnapshot = await db
        .collection('programs')
        .doc(programId)
        .collection('courses')
        .get();

      if (!coursesSnapshot.empty) {
        res.status(400).json({
          error: 'Cannot delete program with existing courses. Delete courses first.',
        });
        return;
      }

      await db.collection('programs').doc(programId).delete();

      res.json({ message: 'Program deleted successfully' });
    } catch (error: any) {
      console.error('Delete program error:', error);
      res.status(500).json({ error: 'Failed to delete program' });
    }
  }

  /**
   * Publish program
   */
  static async publishProgram(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { programId } = req.params;
      const user = req.user!;

      const programDoc = await db.collection('programs').doc(programId).get();

      if (!programDoc.exists) {
        res.status(404).json({ error: 'Program not found' });
        return;
      }

      const program = programDoc.data() as Program;

      // Verify ownership
      if (program.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized to publish this program' });
        return;
      }

      await db.collection('programs').doc(programId).update({
        status: ProgramStatus.PUBLISHED,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      res.json({ message: 'Program published successfully' });
    } catch (error: any) {
      console.error('Publish program error:', error);
      res.status(500).json({ error: 'Failed to publish program' });
    }
  }

  /**
   * Get all published programs (for students)
   */
  static async getPublishedPrograms(req: AuthRequest, res: Response): Promise<void> {
    try {
      const snapshot = await db
        .collection('programs')
        .where('status', '==', ProgramStatus.PUBLISHED)
        .get();

      const programs = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      res.json({ programs });
    } catch (error: any) {
      console.error('Get published programs error:', error);
      res.status(500).json({ error: 'Failed to fetch programs' });
    }
  }
}
