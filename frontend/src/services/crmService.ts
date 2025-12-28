import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

// Lead Management Types
export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
  EMAIL_CAMPAIGN = 'email_campaign',
  PHONE_INQUIRY = 'phone_inquiry',
  WALK_IN = 'walk_in',
  EVENT = 'event',
  OTHER = 'other',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL_SENT = 'proposal_sent',
  NEGOTIATION = 'negotiation',
  CONVERTED = 'converted',
  LOST = 'lost',
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  interested_courses?: string[];
  notes?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  score?: number;
  expected_enrollment_date?: string;
  created_at: string;
  updated_at: string;
  last_contacted?: string;
  converted_to_student_id?: string;
}

// Communication Types
export enum CommunicationType {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  IN_PERSON = 'in_person',
  VIDEO_CALL = 'video_call',
  CHAT = 'chat',
  OTHER = 'other',
}

export enum CommunicationDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export interface Communication {
  id: string;
  student_id?: string;
  lead_id?: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  subject?: string;
  message: string;
  outcome?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  attachments?: string[];
}

// Task Types
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Task {
  id: string;
  student_id?: string;
  lead_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  assigned_to: string;
  assigned_to_name: string;
  created_by: string;
  created_by_name: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Invoice Types
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_percentage?: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  student_id: string;
  student_name: string;
  student_email: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  payment_terms?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Payment Types
export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  ONLINE_PAYMENT = 'online_payment',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface Payment {
  id: string;
  invoice_id?: string;
  student_id: string;
  student_name: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  reference_number?: string;
  payment_date: string;
  notes?: string;
  receipt_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Activity Types
export enum ActivityType {
  LEAD_CREATED = 'lead_created',
  LEAD_STATUS_CHANGED = 'lead_status_changed',
  LEAD_ASSIGNED = 'lead_assigned',
  COMMUNICATION_LOGGED = 'communication_logged',
  STUDENT_REGISTERED = 'student_registered',
  STAGE_CHANGED = 'stage_changed',
  COURSE_ENROLLED = 'course_enrolled',
  COURSE_COMPLETED = 'course_completed',
  PAYMENT_RECEIVED = 'payment_received',
  INVOICE_GENERATED = 'invoice_generated',
  DOCUMENT_UPLOADED = 'document_uploaded',
  NOTE_ADDED = 'note_added',
  TASK_CREATED = 'task_created',
  TASK_COMPLETED = 'task_completed',
}

export interface Activity {
  id: string;
  student_id?: string;
  lead_id?: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_leads: number;
  leads_by_status: Record<LeadStatus, number>;
  conversion_rate: number;
  total_revenue: number;
  pending_payments: number;
  overdue_invoices: number;
  tasks_pending: number;
  tasks_due_today: number;
  recent_activities: Activity[];
}

class CRMService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // Lead Management
  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    const response = await axios.post(
      `${API_URL}/admin/crm/leads`,
      leadData,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getLeads(filters?: {
    status?: LeadStatus;
    source?: LeadSource;
    assigned_to?: string;
  }): Promise<Lead[]> {
    const response = await axios.get(
      `${API_URL}/admin/crm/leads`,
      {
        ...this.getAuthHeaders(),
        params: filters,
      }
    );
    return response.data;
  }

  async updateLeadStatus(leadId: string, status: LeadStatus): Promise<Lead> {
    const response = await axios.put(
      `${API_URL}/admin/crm/leads/${leadId}/status`,
      { status },
      this.getAuthHeaders()
    );
    return response.data;
  }

  async convertLeadToStudent(
    leadId: string,
    data: {
      courses_to_enroll?: string[];
      enrollment_date?: string;
    }
  ): Promise<{ student_id: string; message: string }> {
    const response = await axios.post(
      `${API_URL}/admin/crm/leads/${leadId}/convert`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Communication Tracking
  async logCommunication(communicationData: Partial<Communication>): Promise<Communication> {
    const response = await axios.post(
      `${API_URL}/admin/crm/communications`,
      communicationData,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getCommunications(filters?: {
    student_id?: string;
    lead_id?: string;
    type?: CommunicationType;
  }): Promise<Communication[]> {
    const response = await axios.get(
      `${API_URL}/admin/crm/communications`,
      {
        ...this.getAuthHeaders(),
        params: filters,
      }
    );
    return response.data;
  }

  // Activity Timeline
  async getActivities(filters?: {
    student_id?: string;
    lead_id?: string;
    type?: ActivityType;
  }): Promise<Activity[]> {
    const response = await axios.get(
      `${API_URL}/admin/crm/activities`,
      {
        ...this.getAuthHeaders(),
        params: filters,
      }
    );
    return response.data;
  }

  // Tasks & Follow-ups
  async createTask(taskData: Partial<Task>): Promise<Task> {
    const response = await axios.post(
      `${API_URL}/admin/crm/tasks`,
      taskData,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getTasks(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigned_to?: string;
  }): Promise<Task[]> {
    const response = await axios.get(
      `${API_URL}/admin/crm/tasks`,
      {
        ...this.getAuthHeaders(),
        params: filters,
      }
    );
    return response.data;
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const response = await axios.put(
      `${API_URL}/admin/crm/tasks/${taskId}/status`,
      { status },
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Invoicing & Payments
  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const response = await axios.post(
      `${API_URL}/admin/crm/invoices`,
      invoiceData,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getInvoices(filters?: {
    student_id?: string;
    status?: InvoiceStatus;
  }): Promise<Invoice[]> {
    const response = await axios.get(
      `${API_URL}/admin/crm/invoices`,
      {
        ...this.getAuthHeaders(),
        params: filters,
      }
    );
    return response.data;
  }

  async recordPayment(paymentData: Partial<Payment>): Promise<Payment> {
    const response = await axios.post(
      `${API_URL}/admin/crm/payments`,
      paymentData,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getPayments(filters?: {
    student_id?: string;
    invoice_id?: string;
    payment_status?: PaymentStatus;
  }): Promise<Payment[]> {
    const response = await axios.get(
      `${API_URL}/admin/crm/payments`,
      {
        ...this.getAuthHeaders(),
        params: filters,
      }
    );
    return response.data;
  }

  // Analytics & Reports
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await axios.get(
      `${API_URL}/admin/crm/dashboard-stats`,
      this.getAuthHeaders()
    );
    return response.data;
  }
}

export const crmService = new CRMService();
