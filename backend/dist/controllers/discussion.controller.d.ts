import { Request, Response } from 'express';
export declare class DiscussionController {
    /**
     * Create a new discussion thread
     */
    static createThread(req: Request, res: Response): Promise<void>;
    /**
     * Get all threads for a course
     */
    static getThreads(req: Request, res: Response): Promise<void>;
    /**
     * Get a single thread by ID
     */
    static getThreadById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Update a thread
     */
    static updateThread(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Pin/Unpin a thread (Instructor/Admin only)
     */
    static pinThread(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Lock/Unlock a thread (Instructor/Admin only)
     */
    static lockThread(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Delete a thread
     */
    static deleteThread(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Create a reply to a thread
     */
    static createReply(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get all replies for a thread
     */
    static getReplies(req: Request, res: Response): Promise<void>;
    /**
     * Update a reply
     */
    static updateReply(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Endorse a reply (Instructor/Admin only)
     */
    static endorseReply(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Add a reaction to a reply
     */
    static addReaction(req: Request, res: Response): Promise<void>;
    /**
     * Remove a reaction from a reply
     */
    static removeReaction(req: Request, res: Response): Promise<void>;
    /**
     * Delete a reply
     */
    static deleteReply(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=discussion.controller.d.ts.map