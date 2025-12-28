export declare enum ContentType {
    FOLDER = "folder",
    FILE = "file",
    LINK = "link",
    TEXT = "text",
    ASSIGNMENT_LINK = "assignment_link",
    QUIZ_LINK = "quiz_link"
}
export declare enum FileType {
    PDF = "pdf",
    VIDEO = "video",
    AUDIO = "audio",
    IMAGE = "image",
    DOCUMENT = "document",
    PRESENTATION = "presentation",
    SPREADSHEET = "spreadsheet",
    ARCHIVE = "archive",
    CODE = "code",
    OTHER = "other"
}
export declare enum ContentStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    SCHEDULED = "scheduled",
    HIDDEN = "hidden"
}
export interface ContentItem {
    id: string;
    course_id: string;
    parent_id: string | null;
    type: ContentType;
    title: string;
    description?: string;
    file_type?: FileType;
    file_name?: string;
    file_size?: number;
    file_url?: string;
    storage_path?: string;
    mime_type?: string;
    external_url?: string;
    text_content?: string;
    linked_item_id?: string;
    order: number;
    indent_level: number;
    status: ContentStatus;
    available_from?: string;
    available_until?: string;
    visible_to_students: boolean;
    require_previous_completion?: boolean;
    prerequisite_content_ids?: string[];
    is_graded: boolean;
    points?: number;
    created_by: string;
    created_at: string;
    updated_at: string;
    published_at?: string;
}
export interface ContentAccess {
    id: string;
    content_id: string;
    course_id: string;
    student_id: string;
    student_name: string;
    first_accessed_at: string;
    last_accessed_at: string;
    access_count: number;
    is_completed: boolean;
    completed_at?: string;
    completion_percentage: number;
    total_time_spent: number;
    download_count?: number;
    last_download_at?: string;
    video_progress?: number;
    video_duration?: number;
    updated_at: string;
}
export interface ContentProgress {
    course_id: string;
    student_id: string;
    total_content_items: number;
    completed_items: number;
    in_progress_items: number;
    completion_percentage: number;
    last_accessed_content_id?: string;
    last_accessed_at?: string;
    updated_at: string;
}
export interface ContentFolder {
    id: string;
    course_id: string;
    parent_id: string | null;
    title: string;
    description?: string;
    order: number;
    indent_level: number;
    status: ContentStatus;
    available_from?: string;
    available_until?: string;
    visible_to_students: boolean;
    total_items: number;
    total_files: number;
    created_by: string;
    created_at: string;
    updated_at: string;
}
export interface CreateContentItemDTO {
    course_id: string;
    parent_id?: string;
    type: ContentType;
    title: string;
    description?: string;
    external_url?: string;
    text_content?: string;
    linked_item_id?: string;
    order?: number;
    indent_level?: number;
    status?: ContentStatus;
    available_from?: string;
    available_until?: string;
    visible_to_students?: boolean;
    require_previous_completion?: boolean;
    prerequisite_content_ids?: string[];
    is_graded?: boolean;
    points?: number;
}
export interface UpdateContentItemDTO {
    title?: string;
    description?: string;
    external_url?: string;
    text_content?: string;
    order?: number;
    indent_level?: number;
    status?: ContentStatus;
    available_from?: string;
    available_until?: string;
    visible_to_students?: boolean;
    require_previous_completion?: boolean;
    prerequisite_content_ids?: string[];
    is_graded?: boolean;
    points?: number;
    parent_id?: string;
}
export interface UploadFileDTO {
    course_id: string;
    parent_id?: string;
    title: string;
    description?: string;
    order?: number;
    visible_to_students?: boolean;
    available_from?: string;
    available_until?: string;
}
export interface UpdateContentAccessDTO {
    is_completed?: boolean;
    completion_percentage?: number;
    total_time_spent?: number;
    video_progress?: number;
}
export interface ContentStatistics {
    course_id: string;
    content_id: string;
    content_title: string;
    total_students: number;
    students_accessed: number;
    students_completed: number;
    average_access_count: number;
    average_time_spent: number;
    average_completion_percentage: number;
    most_recent_access?: string;
    calculated_at: string;
}
//# sourceMappingURL=content.types.d.ts.map