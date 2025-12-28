import { ContentItem, ContentAccess, ContentProgress, CreateContentItemDTO, UpdateContentItemDTO, UpdateContentAccessDTO, ContentStatistics } from '../types/content.types';
export declare class ContentModel {
    /**
     * Create a new content item (folder, link, text, etc.)
     */
    static createContentItem(userId: string, data: CreateContentItemDTO): Promise<ContentItem>;
    /**
     * Get all content items for a course (hierarchical structure)
     */
    static getContentItems(courseId: string, includeHidden?: boolean): Promise<ContentItem[]>;
    /**
     * Get content item by ID
     */
    static getContentItemById(courseId: string, contentId: string): Promise<ContentItem | null>;
    /**
     * Update content item
     */
    static updateContentItem(courseId: string, contentId: string, updates: UpdateContentItemDTO): Promise<ContentItem | null>;
    /**
     * Publish content item
     */
    static publishContentItem(courseId: string, contentId: string): Promise<ContentItem | null>;
    /**
     * Delete content item
     */
    static deleteContentItem(courseId: string, contentId: string): Promise<boolean>;
    /**
     * Upload file and create content item
     */
    static uploadFile(courseId: string, userId: string, file: Express.Multer.File, metadata: {
        parent_id?: string;
        title: string;
        description?: string;
        order?: number;
        visible_to_students?: boolean;
        available_from?: string;
        available_until?: string;
    }): Promise<ContentItem>;
    /**
     * Determine file type from MIME type
     */
    private static determineFileType;
    /**
     * Track content access
     */
    static trackAccess(courseId: string, contentId: string, userId: string, userName: string): Promise<void>;
    /**
     * Update content access (completion, progress, etc.)
     */
    static updateContentAccess(courseId: string, contentId: string, userId: string, updates: UpdateContentAccessDTO): Promise<ContentAccess | null>;
    /**
     * Get content access for a student
     */
    static getContentAccess(courseId: string, contentId: string, userId: string): Promise<ContentAccess | null>;
    /**
     * Get all content access records for a content item
     */
    static getAllContentAccess(courseId: string, contentId: string): Promise<ContentAccess[]>;
    /**
     * Update student's overall content progress
     */
    static updateStudentProgress(courseId: string, userId: string): Promise<void>;
    /**
     * Get student's content progress
     */
    static getStudentProgress(courseId: string, userId: string): Promise<ContentProgress | null>;
    /**
     * Calculate statistics for a content item
     */
    static calculateContentStatistics(courseId: string, contentId: string): Promise<ContentStatistics>;
    /**
     * Reorder content items
     */
    static reorderContent(courseId: string, contentIds: string[], newOrders: number[]): Promise<boolean>;
}
//# sourceMappingURL=content.model.d.ts.map