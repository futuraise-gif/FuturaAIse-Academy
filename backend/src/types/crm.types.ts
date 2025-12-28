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
  assigned_to?: string; // Admin user ID
  assigned_to_name?: string;
  score?: number; // Lead scoring 0-100
  expected_enrollment_date?: string;
  created_at: string;
  updated_at: string;
  last_contacted?: string;
  converted_to_student_id?: string;
}

// Student Lifecycle Types
export enum StudentLifecycleStage {
  INQUIRY = 'inquiry',
  APPLICATION_SUBMITTED = 'application_submitted',
  APPLICATION_REVIEW = 'application_review',
  ACCEPTED = 'accepted',
  ENROLLED = 'enrolled',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  GRADUATED = 'graduated',
  DROPPED = 'dropped',
  ALUMNI = 'alumni',
}

export interface StudentProfile {
  id: string;
  student_id: string;
  lifecycle_stage: StudentLifecycleStage;
  enrollment_date?: string;
  expected_graduation_date?: string;
  actual_graduation_date?: string;

  // Personal Info
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;

  // Address
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;

  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;

  // Guardian (for minors)
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_relationship?: string;

  // Academic
  enrolled_courses: string[];
  completed_courses: string[];
  current_gpa?: number;

  // Financial
  total_fees: number;
  fees_paid: number;
  fees_pending: number;
  payment_plan?: string;

  // Engagement
  last_login?: string;
  total_assignments_submitted?: number;
  attendance_percentage?: number;

  // CRM
  assigned_counselor?: string;
  assigned_counselor_name?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;

  created_at: string;
  updated_at: string;
}

// Communication Tracking
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

// Activity Timeline
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

// Tasks/Follow-ups
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

// Documents
export enum DocumentType {
  ID_PROOF = 'id_proof',
  ADDRESS_PROOF = 'address_proof',
  ACADEMIC_CERTIFICATE = 'academic_certificate',
  PHOTO = 'photo',
  TRANSCRIPT = 'transcript',
  RECOMMENDATION = 'recommendation',
  CONTRACT = 'contract',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  OTHER = 'other',
}

export interface Document {
  id: string;
  student_id?: string;
  lead_id?: string;
  type: DocumentType;
  name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  notes?: string;
}

// Invoice and Payment Types
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

// Payment Plan
export enum PaymentPlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  CANCELLED = 'cancelled',
}

export interface PaymentPlanInstallment {
  installment_number: number;
  amount: number;
  due_date: string;
  paid_date?: string;
  payment_id?: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface PaymentPlan {
  id: string;
  student_id: string;
  student_name: string;

  total_amount: number;
  installments: PaymentPlanInstallment[];

  start_date: string;
  end_date: string;

  status: PaymentPlanStatus;

  notes?: string;

  created_by: string;
  created_at: string;
  updated_at: string;
}
