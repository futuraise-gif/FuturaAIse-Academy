import api from '@/config/api';

export interface StudentRegistrationDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
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
  enroll_in_courses?: string[];
}

export interface BillingRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const adminStudentService = {
  /**
   * Register a new student
   */
  async registerStudent(data: StudentRegistrationDTO) {
    const response = await api.post('/admin/students/register', data);
    return response.data;
  },

  /**
   * Get all students
   */
  async getAllStudents(filters?: { status?: string; search?: string }) {
    const response = await api.get('/admin/students', { params: filters });
    return response.data;
  },

  /**
   * Enroll student in courses
   */
  async enrollStudentInCourses(studentId: string, course_ids: string[]) {
    const response = await api.post(`/admin/students/${studentId}/enroll`, {
      course_ids,
    });
    return response.data;
  },

  /**
   * Get student enrollments
   */
  async getStudentEnrollments(studentId: string) {
    const response = await api.get(`/admin/students/${studentId}/enrollments`);
    return response.data;
  },

  /**
   * Create billing record
   */
  async createBillingRecord(data: {
    student_id: string;
    amount: number;
    currency: string;
    description: string;
    due_date: string;
    notes?: string;
  }) {
    const response = await api.post('/admin/billing', data);
    return response.data;
  },

  /**
   * Get all billing records
   */
  async getAllBillingRecords(filters?: {
    student_id?: string;
    status?: string;
  }) {
    const response = await api.get('/admin/billing', { params: filters });
    return response.data;
  },

  /**
   * Update billing status
   */
  async updateBillingStatus(
    billingId: string,
    data: {
      status: 'pending' | 'paid' | 'overdue' | 'cancelled';
      payment_method?: string;
      transaction_id?: string;
      notes?: string;
    }
  ) {
    const response = await api.put(`/admin/billing/${billingId}/status`, data);
    return response.data;
  },

  /**
   * Delete billing record
   */
  async deleteBillingRecord(billingId: string) {
    const response = await api.delete(`/admin/billing/${billingId}`);
    return response.data;
  },
};
