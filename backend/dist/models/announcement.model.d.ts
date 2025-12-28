import { Announcement, CreateAnnouncementDTO, UpdateAnnouncementDTO, AnnouncementFilters } from '../types/announcement.types';
export declare class AnnouncementModel {
    private static collection;
    static create(userId: string, userName: string, userRole: string, data: CreateAnnouncementDTO): Promise<Announcement>;
    static findById(id: string): Promise<Announcement | null>;
    static findAll(filters?: AnnouncementFilters): Promise<{
        announcements: Announcement[];
        total: number;
    }>;
    static findVisibleAnnouncements(userId: string, filters?: AnnouncementFilters): Promise<{
        announcements: Announcement[];
        total: number;
    }>;
    static update(id: string, updates: UpdateAnnouncementDTO): Promise<Announcement>;
    static delete(id: string): Promise<void>;
    static pin(id: string, pinned: boolean): Promise<Announcement>;
    static publish(id: string): Promise<Announcement>;
    static archive(id: string): Promise<Announcement>;
    static getRecipients(announcement: Announcement): Promise<string[]>;
}
//# sourceMappingURL=announcement.model.d.ts.map