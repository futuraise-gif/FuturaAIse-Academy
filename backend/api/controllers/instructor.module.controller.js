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
exports.InstructorModuleController = void 0;
const admin = __importStar(require("firebase-admin"));
const types_1 = require("../types");
const module_types_1 = require("../types/module.types");
const db = admin.firestore();
class InstructorModuleController {
    /**
     * Create module in a course
     */
    static async createModule(req, res) {
        try {
            const user = req.user;
            const data = req.body;
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
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
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
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
            const module = {
                course_id: data.course_id,
                program_id: data.program_id,
                title: data.title,
                description: data.description,
                type: data.type,
                status: module_types_1.ModuleStatus.DRAFT,
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
        }
        catch (error) {
            console.error('Create module error:', error);
            res.status(500).json({ error: 'Failed to create module' });
        }
    }
    /**
     * Get all modules for a course
     */
    static async getCourseModules(req, res) {
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
                .sort((a, b) => {
                return (a.order || 0) - (b.order || 0);
            });
            res.json({ modules });
        }
        catch (error) {
            console.error('Get modules error:', error);
            res.status(500).json({ error: 'Failed to fetch modules' });
        }
    }
    /**
     * Update module
     */
    static async updateModule(req, res) {
        try {
            const { moduleId } = req.params;
            const user = req.user;
            const updates = req.body;
            const moduleDoc = await db.collection('modules').doc(moduleId).get();
            if (!moduleDoc.exists) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            const module = moduleDoc.data();
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(module.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString(),
            };
            await db.collection('modules').doc(moduleId).update(updateData);
            res.json({ message: 'Module updated successfully' });
        }
        catch (error) {
            console.error('Update module error:', error);
            res.status(500).json({ error: 'Failed to update module' });
        }
    }
    /**
     * Delete module
     */
    static async deleteModule(req, res) {
        try {
            const { moduleId } = req.params;
            const user = req.user;
            const moduleDoc = await db.collection('modules').doc(moduleId).get();
            if (!moduleDoc.exists) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            const module = moduleDoc.data();
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(module.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }
            await db.collection('modules').doc(moduleId).delete();
            res.json({ message: 'Module deleted successfully' });
        }
        catch (error) {
            console.error('Delete module error:', error);
            res.status(500).json({ error: 'Failed to delete module' });
        }
    }
    /**
     * Add material to module (video, PDF, notebook, etc.)
     */
    static async addMaterial(req, res) {
        try {
            const { moduleId } = req.params;
            const user = req.user;
            const materialData = req.body;
            const moduleDoc = await db.collection('modules').doc(moduleId).get();
            if (!moduleDoc.exists) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            const module = moduleDoc.data();
            // Verify ownership
            const courseDoc = await db.collection('courses').doc(module.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
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
        }
        catch (error) {
            console.error('Add material error:', error);
            res.status(500).json({ error: 'Failed to add material' });
        }
    }
    /**
     * Remove material from module
     */
    static async removeMaterial(req, res) {
        try {
            const { moduleId, materialId } = req.params;
            const user = req.user;
            const moduleDoc = await db.collection('modules').doc(moduleId).get();
            if (!moduleDoc.exists) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            const module = moduleDoc.data();
            // Verify ownership
            const courseDoc = await db.collection('courses').doc(module.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
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
        }
        catch (error) {
            console.error('Remove material error:', error);
            res.status(500).json({ error: 'Failed to remove material' });
        }
    }
    /**
     * Schedule live class for module
     */
    static async scheduleLiveClass(req, res) {
        try {
            const { moduleId } = req.params;
            const user = req.user;
            const sessionData = req.body;
            const moduleDoc = await db.collection('modules').doc(moduleId).get();
            if (!moduleDoc.exists) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            const module = moduleDoc.data();
            // Verify ownership
            const courseDoc = await db.collection('courses').doc(module.course_id).get();
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
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
                status: 'scheduled',
                created_at: new Date().toISOString(),
            };
            await db.collection('modules').doc(moduleId).update({
                live_sessions: admin.firestore.FieldValue.arrayUnion(liveSession),
                updated_at: new Date().toISOString(),
            });
            res.json({ message: 'Live class scheduled successfully', session: liveSession });
        }
        catch (error) {
            console.error('Schedule live class error:', error);
            res.status(500).json({ error: 'Failed to schedule live class' });
        }
    }
    /**
     * Reorder modules
     */
    static async reorderModules(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;
            const { module_orders } = req.body; // [{module_id: string, order: number}]
            // Verify course ownership
            const courseDoc = await db.collection('courses').doc(courseId).get();
            if (!courseDoc.exists) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const course = courseDoc.data();
            if (course?.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
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
        }
        catch (error) {
            console.error('Reorder modules error:', error);
            res.status(500).json({ error: 'Failed to reorder modules' });
        }
    }
}
exports.InstructorModuleController = InstructorModuleController;
//# sourceMappingURL=instructor.module.controller.js.map