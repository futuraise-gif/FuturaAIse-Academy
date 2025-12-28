import { Request, Response } from 'express';
export declare class ContentController {
    /**
     * Create a new content item (folder, link, text, etc.)
     */
    static createContentItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Upload a file
     */
    static uploadFile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get all content items for a course
     */
    static getContentItems(req: Request, res: Response): Promise<void>;
    /**
     * Get a single content item
     */
    static getContentItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Update a content item
     */
    static updateContentItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Publish a content item
     */
    static publishContentItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Delete a content item
     */
    static deleteContentItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Track content access (when student views content)
     */
    static trackAccess(req: Request, res: Response): Promise<void>;
    /**
     * Update content access (completion, progress)
     */
    static updateContentAccess(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get content access for current user
     */
    static getMyContentAccess(req: Request, res: Response): Promise<void>;
    /**
     * Get all content access records (instructor only)
     */
    static getAllContentAccess(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get student's content progress
     */
    static getStudentProgress(req: Request, res: Response): Promise<void>;
    /**
     * Get content statistics (instructor only)
     */
    static getContentStatistics(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Reorder content items
     */
    static reorderContent(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=content.controller.d.ts.map