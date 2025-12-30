import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.firebase';
import * as admin from 'firebase-admin';
import { UserRole } from '../types';
import {
  Module,
  CreateModuleDTO,
  UpdateModuleDTO,
  AddMaterialDTO,
  ScheduleLiveClassDTO,
  ModuleStatus,
} from '../types/module.types';

const db = admin.firestore();

export class InstructorModuleController {
  /**
   * Create module in a course
   */
  static async createModule(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const data: CreateModuleDTO = req.body;

      if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only instructors can create modules' });
        return;
      }

      // Verify course ownership
      const courseDoc = await db.collection('courses').doc(data.course_id).get();
      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data();
      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      // Get next order number
      const modulesSnapshot = await db
        .collection('modules')
        .where('course_id', '==', data.course_id)
        .get();

      const order = data.order !== undefined ? data.order : modulesSnapshot.size + 1;

      const now = new Date().toISOString();
      const module: Omit<Module, 'id'> = {
        course_id: data.course_id,
        program_id: data.program_id,
        title: data.title,
        description: data.description,
        type: data.type,
        status: ModuleStatus.DRAFT,
        order,
        materials: [],
        live_sessions: [],
        duration_minutes: data.duration_minutes || 0,
        is_mandatory: data.is_mandatory !== false,
        prerequisites_module_ids: [],
        created_at: now,
        updated_at: now,
      };

      const moduleRef = await db.collection('modules').add(module);

      res.status(201).json({
        message: 'Module created successfully',
        module: { id: moduleRef.id, ...module },
      });
    } catch (error: any) {
      console.error('Create module error:', error);
      res.status(500).json({ error: 'Failed to create module' });
    }
  }

  /**
   * Get all modules for a course
   */
  static async getCourseModules(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;

      const snapshot = await db
        .collection('modules')
        .where('course_id', '==', courseId)
        .get();

      const modules = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a: any, b: any) => {
          return (a.order || 0) - (b.order || 0);
        });

      res.json({ modules });
    } catch (error: any) {
      console.error('Get modules error:', error);
      res.status(500).json({ error: 'Failed to fetch modules' });
    }
  }

  /**
   * Get module by ID
   */
  static async getModuleById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;

      const moduleDoc = await db.collection('modules').doc(moduleId).get();
      if (!moduleDoc.exists) {
        res.status(404).json({ error: 'Module not found' });
        return;
      }

      const module = {
        id: moduleDoc.id,
        ...moduleDoc.data(),
      };

      res.json({ module });
    } catch (error: any) {
      console.error('Get module error:', error);
      res.status(500).json({ error: 'Failed to fetch module' });
    }
  }

  /**
   * Update module
   */
  static async updateModule(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const user = req.user!;
      const updates: UpdateModuleDTO = req.body;

      const moduleDoc = await db.collection('modules').doc(moduleId).get();
      if (!moduleDoc.exists) {
        res.status(404).json({ error: 'Module not found' });
        return;
      }

      const module = moduleDoc.data() as Module;

      // Verify course ownership
      const courseDoc = await db.collection('courses').doc(module.course_id).get();
      const course = courseDoc.data();

      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await db.collection('modules').doc(moduleId).update(updateData);

      res.json({ message: 'Module updated successfully' });
    } catch (error: any) {
      console.error('Update module error:', error);
      res.status(500).json({ error: 'Failed to update module' });
    }
  }

  /**
   * Delete module
   */
  static async deleteModule(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const user = req.user!;

      const moduleDoc = await db.collection('modules').doc(moduleId).get();
      if (!moduleDoc.exists) {
        res.status(404).json({ error: 'Module not found' });
        return;
      }

      const module = moduleDoc.data() as Module;

      // Verify course ownership
      const courseDoc = await db.collection('courses').doc(module.course_id).get();
      const course = courseDoc.data();

      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      await db.collection('modules').doc(moduleId).delete();

      res.json({ message: 'Module deleted successfully' });
    } catch (error: any) {
      console.error('Delete module error:', error);
      res.status(500).json({ error: 'Failed to delete module' });
    }
  }

  /**
   * Add material to module (video, PDF, notebook, etc.)
   */
  static async addMaterial(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const user = req.user!;
      const materialData: AddMaterialDTO = req.body;

      const moduleDoc = await db.collection('modules').doc(moduleId).get();
      if (!moduleDoc.exists) {
        res.status(404).json({ error: 'Module not found' });
        return;
      }

      const module = moduleDoc.data() as Module;

      // Verify ownership
      const courseDoc = await db.collection('courses').doc(module.course_id).get();
      const course = courseDoc.data();

      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      const material = {
        id: db.collection('_').doc().id, // Generate unique ID
        title: materialData.title,
        type: materialData.type,
        url: materialData.url,
        file_size: materialData.file_size,
        duration_minutes: materialData.duration_minutes,
        download_url: materialData.download_url,
        created_at: new Date().toISOString(),
      };

      await db.collection('modules').doc(moduleId).update({
        materials: admin.firestore.FieldValue.arrayUnion(material),
        updated_at: new Date().toISOString(),
      });

      res.json({ message: 'Material added successfully', material });
    } catch (error: any) {
      console.error('Add material error:', error);
      res.status(500).json({ error: 'Failed to add material' });
    }
  }

  /**
   * Remove material from module
   */
  static async removeMaterial(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { moduleId, materialId } = req.params;
      const user = req.user!;

      const moduleDoc = await db.collection('modules').doc(moduleId).get();
      if (!moduleDoc.exists) {
        res.status(404).json({ error: 'Module not found' });
        return;
      }

      const module = moduleDoc.data() as Module;

      // Verify ownership
      const courseDoc = await db.collection('courses').doc(module.course_id).get();
      const course = courseDoc.data();

      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      const material = module.materials.find((m) => m.id === materialId);
      if (!material) {
        res.status(404).json({ error: 'Material not found' });
        return;
      }

      await db.collection('modules').doc(moduleId).update({
        materials: admin.firestore.FieldValue.arrayRemove(material),
        updated_at: new Date().toISOString(),
      });

      res.json({ message: 'Material removed successfully' });
    } catch (error: any) {
      console.error('Remove material error:', error);
      res.status(500).json({ error: 'Failed to remove material' });
    }
  }

  /**
   * Schedule live class for module
   */
  static async scheduleLiveClass(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const user = req.user!;
      const sessionData: ScheduleLiveClassDTO = req.body;

      const moduleDoc = await db.collection('modules').doc(moduleId).get();
      if (!moduleDoc.exists) {
        res.status(404).json({ error: 'Module not found' });
        return;
      }

      const module = moduleDoc.data() as Module;

      // Verify ownership
      const courseDoc = await db.collection('courses').doc(module.course_id).get();
      const course = courseDoc.data();

      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      const liveSession = {
        id: db.collection('_').doc().id,
        title: sessionData.title,
        scheduled_at: sessionData.scheduled_at,
        duration_minutes: sessionData.duration_minutes,
        meeting_link: sessionData.meeting_link,
        meeting_id: sessionData.meeting_id,
        passcode: sessionData.passcode,
        status: 'scheduled' as const,
        created_at: new Date().toISOString(),
      };

      await db.collection('modules').doc(moduleId).update({
        live_sessions: admin.firestore.FieldValue.arrayUnion(liveSession),
        updated_at: new Date().toISOString(),
      });

      res.json({ message: 'Live class scheduled successfully', session: liveSession });
    } catch (error: any) {
      console.error('Schedule live class error:', error);
      res.status(500).json({ error: 'Failed to schedule live class' });
    }
  }

  /**
   * Reorder modules
   */
  static async reorderModules(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const user = req.user!;
      const { module_orders } = req.body; // [{module_id: string, order: number}]

      // Verify course ownership
      const courseDoc = await db.collection('courses').doc(courseId).get();
      if (!courseDoc.exists) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const course = courseDoc.data();
      if (course?.instructor_id !== user.userId && user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      // Update each module's order
      const batch = db.batch();
      for (const item of module_orders) {
        const moduleRef = db.collection('modules').doc(item.module_id);
        batch.update(moduleRef, {
          order: item.order,
          updated_at: new Date().toISOString(),
        });
      }

      await batch.commit();

      res.json({ message: 'Modules reordered successfully' });
    } catch (error: any) {
      console.error('Reorder modules error:', error);
      res.status(500).json({ error: 'Failed to reorder modules' });
    }
  }
}
