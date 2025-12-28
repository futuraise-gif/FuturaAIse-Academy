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
exports.ProgramController = void 0;
const admin = __importStar(require("firebase-admin"));
const types_1 = require("../types");
const program_types_1 = require("../types/program.types");
const db = admin.firestore();
class ProgramController {
    /**
     * Create a new program - Instructor only
     */
    static async createProgram(req, res) {
        try {
            const user = req.user;
            // Only instructors can create programs
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Only instructors can create programs' });
                return;
            }
            const data = req.body;
            // Validation
            if (!data.title || !data.description || !data.level || !data.duration_weeks) {
                res.status(400).json({ error: 'Title, description, level, and duration are required' });
                return;
            }
            // Get instructor name
            const userDoc = await db.collection('users').doc(user.userId).get();
            const userData = userDoc.data();
            const now = new Date().toISOString();
            const program = {
                title: data.title,
                description: data.description,
                instructor_id: user.userId,
                instructor_name: `${userData?.first_name} ${userData?.last_name}`,
                level: data.level,
                status: program_types_1.ProgramStatus.DRAFT,
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
        }
        catch (error) {
            console.error('Create program error:', error);
            res.status(500).json({ error: 'Failed to create program' });
        }
    }
    /**
     * Get all programs for an instructor
     */
    static async getInstructorPrograms(req, res) {
        try {
            const user = req.user;
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
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
                .sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            res.json({ programs });
        }
        catch (error) {
            console.error('Get programs error:', error);
            res.status(500).json({ error: 'Failed to fetch programs' });
        }
    }
    /**
     * Get program details
     */
    static async getProgramById(req, res) {
        try {
            const { programId } = req.params;
            const user = req.user;
            const programDoc = await db.collection('programs').doc(programId).get();
            if (!programDoc.exists) {
                res.status(404).json({ error: 'Program not found' });
                return;
            }
            const program = { id: programDoc.id, ...programDoc.data() };
            // Verify ownership or allow all instructors to view published programs
            if (program.instructor_id !== user.userId &&
                program.status !== program_types_1.ProgramStatus.PUBLISHED &&
                user.role !== types_1.UserRole.ADMIN) {
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
        }
        catch (error) {
            console.error('Get program error:', error);
            res.status(500).json({ error: 'Failed to fetch program' });
        }
    }
    /**
     * Update program
     */
    static async updateProgram(req, res) {
        try {
            const { programId } = req.params;
            const user = req.user;
            const updates = req.body;
            const programDoc = await db.collection('programs').doc(programId).get();
            if (!programDoc.exists) {
                res.status(404).json({ error: 'Program not found' });
                return;
            }
            const program = programDoc.data();
            // Verify ownership
            if (program.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
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
        }
        catch (error) {
            console.error('Update program error:', error);
            res.status(500).json({ error: 'Failed to update program' });
        }
    }
    /**
     * Delete program
     */
    static async deleteProgram(req, res) {
        try {
            const { programId } = req.params;
            const user = req.user;
            const programDoc = await db.collection('programs').doc(programId).get();
            if (!programDoc.exists) {
                res.status(404).json({ error: 'Program not found' });
                return;
            }
            const program = programDoc.data();
            // Verify ownership
            if (program.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
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
        }
        catch (error) {
            console.error('Delete program error:', error);
            res.status(500).json({ error: 'Failed to delete program' });
        }
    }
    /**
     * Publish program
     */
    static async publishProgram(req, res) {
        try {
            const { programId } = req.params;
            const user = req.user;
            const programDoc = await db.collection('programs').doc(programId).get();
            if (!programDoc.exists) {
                res.status(404).json({ error: 'Program not found' });
                return;
            }
            const program = programDoc.data();
            // Verify ownership
            if (program.instructor_id !== user.userId && user.role !== types_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Not authorized to publish this program' });
                return;
            }
            await db.collection('programs').doc(programId).update({
                status: program_types_1.ProgramStatus.PUBLISHED,
                published_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            res.json({ message: 'Program published successfully' });
        }
        catch (error) {
            console.error('Publish program error:', error);
            res.status(500).json({ error: 'Failed to publish program' });
        }
    }
    /**
     * Get all published programs (for students)
     */
    static async getPublishedPrograms(req, res) {
        try {
            const snapshot = await db
                .collection('programs')
                .where('status', '==', program_types_1.ProgramStatus.PUBLISHED)
                .get();
            const programs = snapshot.docs
                .map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
                .sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            res.json({ programs });
        }
        catch (error) {
            console.error('Get published programs error:', error);
            res.status(500).json({ error: 'Failed to fetch programs' });
        }
    }
}
exports.ProgramController = ProgramController;
//# sourceMappingURL=program.controller.js.map