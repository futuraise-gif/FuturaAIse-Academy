"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentController = void 0;
const content_model_1 = require("../models/content.model");
const types_1 = require("../types");
class ContentController {
    /**
     * Create a new content item (folder, link, text, etc.)
     */
    static async createContentItem(req, res) {
        try {
            const user = req.user;
            const data = req.body;
            // Only instructors and admins can create content
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                return res.status(403).json({ error: 'Only instructors can create content' });
            }
            const contentItem = await content_model_1.ContentModel.createContentItem(user.uid, data);
            res.status(201).json({
                message: 'Content item created successfully',
                content: contentItem,
            });
        }
        catch (error) {
            console.error('Create content item error:', error);
            res.status(500).json({
                error: 'Failed to create content item',
                details: error.message,
            });
        }
    }
    /**
     * Upload a file
     */
    static async uploadFile(req, res) {
        try {
            const user = req.user;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            // Only instructors and admins can upload files
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                return res.status(403).json({ error: 'Only instructors can upload files' });
            }
            const { course_id, parent_id, title, description, order, visible_to_students, available_from, available_until, } = req.body;
            if (!course_id) {
                return res.status(400).json({ error: 'Course ID is required' });
            }
            if (!title) {
                return res.status(400).json({ error: 'Title is required' });
            }
            const contentItem = await content_model_1.ContentModel.uploadFile(course_id, user.uid, file, {
                parent_id,
                title,
                description,
                order: order ? parseInt(order) : undefined,
                visible_to_students: visible_to_students === 'true',
                available_from,
                available_until,
            });
            res.status(201).json({
                message: 'File uploaded successfully',
                content: contentItem,
            });
        }
        catch (error) {
            console.error('Upload file error:', error);
            res.status(500).json({
                error: 'Failed to upload file',
                details: error.message,
            });
        }
    }
    /**
     * Get all content items for a course
     */
    static async getContentItems(req, res) {
        try {
            const user = req.user;
            const { courseId } = req.params;
            const { include_hidden } = req.query;
            // Students can only see visible content
            const includeHidden = (user.role === types_1.UserRole.INSTRUCTOR || user.role === types_1.UserRole.ADMIN) &&
                include_hidden === 'true';
            const contentItems = await content_model_1.ContentModel.getContentItems(courseId, includeHidden);
            res.status(200).json({
                content: contentItems,
                count: contentItems.length,
            });
        }
        catch (error) {
            console.error('Get content items error:', error);
            res.status(500).json({
                error: 'Failed to retrieve content items',
                details: error.message,
            });
        }
    }
    /**
     * Get a single content item
     */
    static async getContentItem(req, res) {
        try {
            const { courseId, contentId } = req.params;
            const contentItem = await content_model_1.ContentModel.getContentItemById(courseId, contentId);
            if (!contentItem) {
                return res.status(404).json({ error: 'Content item not found' });
            }
            res.status(200).json({ content: contentItem });
        }
        catch (error) {
            console.error('Get content item error:', error);
            res.status(500).json({
                error: 'Failed to retrieve content item',
                details: error.message,
            });
        }
    }
    /**
     * Update a content item
     */
    static async updateContentItem(req, res) {
        try {
            const user = req.user;
            const { courseId, contentId } = req.params;
            const updates = req.body;
            // Only instructors and admins can update content
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                return res.status(403).json({ error: 'Only instructors can update content' });
            }
            const contentItem = await content_model_1.ContentModel.updateContentItem(courseId, contentId, updates);
            if (!contentItem) {
                return res.status(404).json({ error: 'Content item not found' });
            }
            res.status(200).json({
                message: 'Content item updated successfully',
                content: contentItem,
            });
        }
        catch (error) {
            console.error('Update content item error:', error);
            res.status(500).json({
                error: 'Failed to update content item',
                details: error.message,
            });
        }
    }
    /**
     * Publish a content item
     */
    static async publishContentItem(req, res) {
        try {
            const user = req.user;
            const { courseId, contentId } = req.params;
            // Only instructors and admins can publish content
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                return res.status(403).json({ error: 'Only instructors can publish content' });
            }
            const contentItem = await content_model_1.ContentModel.publishContentItem(courseId, contentId);
            if (!contentItem) {
                return res.status(404).json({ error: 'Content item not found' });
            }
            res.status(200).json({
                message: 'Content item published successfully',
                content: contentItem,
            });
        }
        catch (error) {
            console.error('Publish content item error:', error);
            res.status(500).json({
                error: 'Failed to publish content item',
                details: error.message,
            });
        }
    }
    /**
     * Delete a content item
     */
    static async deleteContentItem(req, res) {
        try {
            const user = req.user;
            const { courseId, contentId } = req.params;
            // Only instructors and admins can delete content
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                return res.status(403).json({ error: 'Only instructors can delete content' });
            }
            const success = await content_model_1.ContentModel.deleteContentItem(courseId, contentId);
            if (!success) {
                return res.status(500).json({ error: 'Failed to delete content item' });
            }
            res.status(200).json({ message: 'Content item deleted successfully' });
        }
        catch (error) {
            console.error('Delete content item error:', error);
            res.status(500).json({
                error: 'Failed to delete content item',
                details: error.message,
            });
        }
    }
    /**
     * Track content access (when student views content)
     */
    static async trackAccess(req, res) {
        try {
            const user = req.user;
            const { courseId, contentId } = req.params;
            await content_model_1.ContentModel.trackAccess(courseId, contentId, user.uid, user.name || user.email.split('@')[0]);
            res.status(200).json({ message: 'Access tracked successfully' });
        }
        catch (error) {
            console.error('Track access error:', error);
            res.status(500).json({
                error: 'Failed to track access',
                details: error.message,
            });
        }
    }
    /**
     * Update content access (completion, progress)
     */
    static async updateContentAccess(req, res) {
        try {
            const user = req.user;
            const { courseId, contentId } = req.params;
            const updates = req.body;
            const access = await content_model_1.ContentModel.updateContentAccess(courseId, contentId, user.uid, updates);
            if (!access) {
                return res.status(404).json({ error: 'Content access record not found' });
            }
            res.status(200).json({
                message: 'Content access updated successfully',
                access,
            });
        }
        catch (error) {
            console.error('Update content access error:', error);
            res.status(500).json({
                error: 'Failed to update content access',
                details: error.message,
            });
        }
    }
    /**
     * Get content access for current user
     */
    static async getMyContentAccess(req, res) {
        try {
            const user = req.user;
            const { courseId, contentId } = req.params;
            const access = await content_model_1.ContentModel.getContentAccess(courseId, contentId, user.uid);
            res.status(200).json({ access });
        }
        catch (error) {
            console.error('Get content access error:', error);
            res.status(500).json({
                error: 'Failed to retrieve content access',
                details: error.message,
            });
        }
    }
    /**
     * Get all content access records (instructor only)
     */
    static async getAllContentAccess(req, res) {
        try {
            const user = req.user;
            const { courseId, contentId } = req.params;
            // Only instructors and admins can view all access records
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                return res.status(403).json({ error: 'Only instructors can view access records' });
            }
            const accessRecords = await content_model_1.ContentModel.getAllContentAccess(courseId, contentId);
            res.status(200).json({
                access_records: accessRecords,
                count: accessRecords.length,
            });
        }
        catch (error) {
            console.error('Get all content access error:', error);
            res.status(500).json({
                error: 'Failed to retrieve content access records',
                details: error.message,
            });
        }
    }
    /**
     * Get student's content progress
     */
    static async getStudentProgress(req, res) {
        try {
            const user = req.user;
            const { courseId } = req.params;
            const { studentId } = req.query;
            // Students can only see their own progress
            // Instructors can see any student's progress
            const targetUserId = user.role === types_1.UserRole.INSTRUCTOR || user.role === types_1.UserRole.ADMIN
                ? studentId || user.uid
                : user.uid;
            const progress = await content_model_1.ContentModel.getStudentProgress(courseId, targetUserId);
            res.status(200).json({ progress });
        }
        catch (error) {
            console.error('Get student progress error:', error);
            res.status(500).json({
                error: 'Failed to retrieve student progress',
                details: error.message,
            });
        }
    }
    /**
     * Get content statistics (instructor only)
     */
    static async getContentStatistics(req, res) {
        try {
            const user = req.user;
            const { courseId, contentId } = req.params;
            // Only instructors and admins can view statistics
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                return res.status(403).json({ error: 'Only instructors can view statistics' });
            }
            const statistics = await content_model_1.ContentModel.calculateContentStatistics(courseId, contentId);
            res.status(200).json({ statistics });
        }
        catch (error) {
            console.error('Get content statistics error:', error);
            res.status(500).json({
                error: 'Failed to retrieve content statistics',
                details: error.message,
            });
        }
    }
    /**
     * Reorder content items
     */
    static async reorderContent(req, res) {
        try {
            const user = req.user;
            const { courseId } = req.params;
            const { content_ids, new_orders } = req.body;
            // Only instructors and admins can reorder content
            if (user.role !== types_1.UserRole.INSTRUCTOR && user.role !== types_1.UserRole.ADMIN) {
                return res.status(403).json({ error: 'Only instructors can reorder content' });
            }
            if (content_ids.length !== new_orders.length) {
                return res.status(400).json({ error: 'Content IDs and orders arrays must have same length' });
            }
            const success = await content_model_1.ContentModel.reorderContent(courseId, content_ids, new_orders);
            if (!success) {
                return res.status(500).json({ error: 'Failed to reorder content' });
            }
            res.status(200).json({ message: 'Content reordered successfully' });
        }
        catch (error) {
            console.error('Reorder content error:', error);
            res.status(500).json({
                error: 'Failed to reorder content',
                details: error.message,
            });
        }
    }
}
exports.ContentController = ContentController;
//# sourceMappingURL=content.controller.js.map