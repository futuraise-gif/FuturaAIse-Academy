import api from '@/config/api';
import { User, UserRole, UserStatus } from '@/types';

export interface CreateUserDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  date_of_birth?: string;
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
  enroll_in_courses?: string[]; // Array of course IDs to enroll student in
}

export interface UpdateUserDTO {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  date_of_birth?: string;
}

export interface SystemStatistics {
  total_users: number;
  students: number;
  instructors: number;
  admins: number;
  super_admins: number;
  active_users: number;
  inactive_users: number;
  suspended_users: number;
  total_courses: number;
}

export interface BulkImportUser {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export const superadminService = {
  /**
   * Create a new user (student, instructor, admin)
   */
  async createUser(data: CreateUserDTO) {
    const response = await api.post('/superadmin/users', data);
    return response.data;
  },

  /**
   * Get all users with optional filters
   */
  async getAllUsers(filters?: {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
  }) {
    const response = await api.get('/superadmin/users', { params: filters });
    return response.data;
  },

  /**
   * Update user information
   */
  async updateUser(userId: string, data: UpdateUserDTO) {
    const response = await api.put(`/superadmin/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete a user
   */
  async deleteUser(userId: string) {
    const response = await api.delete(`/superadmin/users/${userId}`);
    return response.data;
  },

  /**
   * Reset user password
   */
  async resetPassword(userId: string, new_password: string) {
    const response = await api.post(`/superadmin/users/${userId}/reset-password`, {
      new_password,
    });
    return response.data;
  },

  /**
   * Get system statistics
   */
  async getStatistics(): Promise<SystemStatistics> {
    const response = await api.get('/superadmin/statistics');
    return response.data;
  },

  /**
   * Bulk import users
   */
  async bulkImportUsers(users: BulkImportUser[]) {
    const response = await api.post('/superadmin/users/bulk-import', { users });
    return response.data;
  },

  /**
   * Bulk update user status
   */
  async bulkUpdateStatus(user_ids: string[], status: UserStatus) {
    const response = await api.post('/superadmin/users/bulk-status', {
      user_ids,
      status,
    });
    return response.data;
  },

  /**
   * Export users to CSV
   */
  async exportUsersCSV(filters?: {
    role?: UserRole;
    status?: UserStatus;
  }) {
    const response = await api.get('/superadmin/users/export-csv', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
