/**
 * Attendance Tracking System
 * Manual + Auto attendance for live classes
 */
export declare enum AttendanceStatus {
    PRESENT = "present",
    ABSENT = "absent",
    LATE = "late",
    EXCUSED = "excused"
}
export declare enum AttendanceMethod {
    MANUAL = "manual",// Instructor marks manually
    AUTO = "auto",// Auto-detected from meeting join
    SELF = "self"
}
export interface AttendanceRecord {
    id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    course_id: string;
    module_id: string;
    live_session_id?: string;
    status: AttendanceStatus;
    method: AttendanceMethod;
    marked_at: string;
    join_time?: string;
    leave_time?: string;
    duration_minutes?: number;
    marked_by_instructor_id?: string;
    notes?: string;
    ip_address?: string;
    created_at: string;
    updated_at: string;
}
export interface MarkAttendanceDTO {
    student_id: string;
    course_id: string;
    module_id: string;
    live_session_id?: string;
    status: AttendanceStatus;
    method: AttendanceMethod;
    join_time?: string;
    leave_time?: string;
    notes?: string;
}
export interface BulkAttendanceDTO {
    course_id: string;
    module_id: string;
    live_session_id?: string;
    date: string;
    attendance: Array<{
        student_id: string;
        status: AttendanceStatus;
        notes?: string;
    }>;
}
export interface AttendanceStats {
    student_id: string;
    course_id: string;
    total_sessions: number;
    attended: number;
    absent: number;
    late: number;
    excused: number;
    attendance_percentage: number;
}
//# sourceMappingURL=attendance.types.d.ts.map