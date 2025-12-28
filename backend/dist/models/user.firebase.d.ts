import { SafeUser, UserRole, UserStatus } from '../types';
export declare class UserModel {
    static create(uid: string, userData: {
        email: string;
        first_name: string;
        last_name: string;
        role?: UserRole;
        student_id?: string;
        instructor_id?: string;
        status?: UserStatus;
        phone?: string;
        date_of_birth?: string;
    }): Promise<SafeUser>;
    static findByEmail(email: string): Promise<any | null>;
    static findById(id: string): Promise<SafeUser | null>;
    static findByStudentId(student_id: string): Promise<SafeUser | null>;
    static findByInstructorId(instructor_id: string): Promise<SafeUser | null>;
    static findAll(filters?: {
        role?: UserRole;
        status?: UserStatus;
        limit?: number;
    }): Promise<SafeUser[]>;
    static update(id: string, updates: Partial<SafeUser>): Promise<SafeUser | null>;
    static updateStatus(id: string, status: UserStatus): Promise<SafeUser | null>;
    static updateLastLogin(id: string): Promise<void>;
    static delete(id: string): Promise<boolean>;
    static verifyPassword(email: string, password: string): Promise<boolean>;
}
//# sourceMappingURL=user.firebase.d.ts.map