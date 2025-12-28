import { Request } from 'express';
export declare enum UserRole {
    STUDENT = "student",
    INSTRUCTOR = "instructor",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended"
}
export interface User {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    status: UserStatus;
    student_id?: string;
    instructor_id?: string;
    profile_image_url?: string;
    bio?: string;
    phone?: string;
    date_of_birth?: Date;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    guardian_name?: string;
    guardian_phone?: string;
    guardian_email?: string;
    created_at: Date;
    updated_at: Date;
    last_login?: Date;
}
export interface SafeUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    status: UserStatus;
    student_id?: string;
    instructor_id?: string;
    profile_image_url?: string;
    bio?: string;
    phone?: string;
    date_of_birth?: string;
    created_at: string;
    updated_at: string;
    last_login?: string;
}
export interface JWTPayload {
    uid: string;
    userId: string;
    email: string;
    name?: string;
    role: UserRole;
}
export interface AuthRequest extends Request {
    user?: JWTPayload;
}
//# sourceMappingURL=index.d.ts.map