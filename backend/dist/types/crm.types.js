"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentPlanStatus = exports.PaymentStatus = exports.PaymentMethod = exports.InvoiceStatus = exports.DocumentType = exports.TaskPriority = exports.TaskStatus = exports.ActivityType = exports.CommunicationDirection = exports.CommunicationType = exports.StudentLifecycleStage = exports.LeadStatus = exports.LeadSource = void 0;
// Lead Management Types
var LeadSource;
(function (LeadSource) {
    LeadSource["WEBSITE"] = "website";
    LeadSource["REFERRAL"] = "referral";
    LeadSource["SOCIAL_MEDIA"] = "social_media";
    LeadSource["EMAIL_CAMPAIGN"] = "email_campaign";
    LeadSource["PHONE_INQUIRY"] = "phone_inquiry";
    LeadSource["WALK_IN"] = "walk_in";
    LeadSource["EVENT"] = "event";
    LeadSource["OTHER"] = "other";
})(LeadSource || (exports.LeadSource = LeadSource = {}));
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "new";
    LeadStatus["CONTACTED"] = "contacted";
    LeadStatus["QUALIFIED"] = "qualified";
    LeadStatus["PROPOSAL_SENT"] = "proposal_sent";
    LeadStatus["NEGOTIATION"] = "negotiation";
    LeadStatus["CONVERTED"] = "converted";
    LeadStatus["LOST"] = "lost";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
// Student Lifecycle Types
var StudentLifecycleStage;
(function (StudentLifecycleStage) {
    StudentLifecycleStage["INQUIRY"] = "inquiry";
    StudentLifecycleStage["APPLICATION_SUBMITTED"] = "application_submitted";
    StudentLifecycleStage["APPLICATION_REVIEW"] = "application_review";
    StudentLifecycleStage["ACCEPTED"] = "accepted";
    StudentLifecycleStage["ENROLLED"] = "enrolled";
    StudentLifecycleStage["ACTIVE"] = "active";
    StudentLifecycleStage["ON_HOLD"] = "on_hold";
    StudentLifecycleStage["GRADUATED"] = "graduated";
    StudentLifecycleStage["DROPPED"] = "dropped";
    StudentLifecycleStage["ALUMNI"] = "alumni";
})(StudentLifecycleStage || (exports.StudentLifecycleStage = StudentLifecycleStage = {}));
// Communication Tracking
var CommunicationType;
(function (CommunicationType) {
    CommunicationType["EMAIL"] = "email";
    CommunicationType["PHONE"] = "phone";
    CommunicationType["SMS"] = "sms";
    CommunicationType["IN_PERSON"] = "in_person";
    CommunicationType["VIDEO_CALL"] = "video_call";
    CommunicationType["CHAT"] = "chat";
    CommunicationType["OTHER"] = "other";
})(CommunicationType || (exports.CommunicationType = CommunicationType = {}));
var CommunicationDirection;
(function (CommunicationDirection) {
    CommunicationDirection["INBOUND"] = "inbound";
    CommunicationDirection["OUTBOUND"] = "outbound";
})(CommunicationDirection || (exports.CommunicationDirection = CommunicationDirection = {}));
// Activity Timeline
var ActivityType;
(function (ActivityType) {
    ActivityType["LEAD_CREATED"] = "lead_created";
    ActivityType["LEAD_STATUS_CHANGED"] = "lead_status_changed";
    ActivityType["LEAD_ASSIGNED"] = "lead_assigned";
    ActivityType["COMMUNICATION_LOGGED"] = "communication_logged";
    ActivityType["STUDENT_REGISTERED"] = "student_registered";
    ActivityType["STAGE_CHANGED"] = "stage_changed";
    ActivityType["COURSE_ENROLLED"] = "course_enrolled";
    ActivityType["COURSE_COMPLETED"] = "course_completed";
    ActivityType["PAYMENT_RECEIVED"] = "payment_received";
    ActivityType["INVOICE_GENERATED"] = "invoice_generated";
    ActivityType["DOCUMENT_UPLOADED"] = "document_uploaded";
    ActivityType["NOTE_ADDED"] = "note_added";
    ActivityType["TASK_CREATED"] = "task_created";
    ActivityType["TASK_COMPLETED"] = "task_completed";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
// Tasks/Follow-ups
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
// Documents
var DocumentType;
(function (DocumentType) {
    DocumentType["ID_PROOF"] = "id_proof";
    DocumentType["ADDRESS_PROOF"] = "address_proof";
    DocumentType["ACADEMIC_CERTIFICATE"] = "academic_certificate";
    DocumentType["PHOTO"] = "photo";
    DocumentType["TRANSCRIPT"] = "transcript";
    DocumentType["RECOMMENDATION"] = "recommendation";
    DocumentType["CONTRACT"] = "contract";
    DocumentType["INVOICE"] = "invoice";
    DocumentType["RECEIPT"] = "receipt";
    DocumentType["OTHER"] = "other";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
// Invoice and Payment Types
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["SENT"] = "sent";
    InvoiceStatus["PARTIALLY_PAID"] = "partially_paid";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["OVERDUE"] = "overdue";
    InvoiceStatus["CANCELLED"] = "cancelled";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["DEBIT_CARD"] = "debit_card";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    PaymentMethod["CHECK"] = "check";
    PaymentMethod["ONLINE_PAYMENT"] = "online_payment";
    PaymentMethod["OTHER"] = "other";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
// Payment Plan
var PaymentPlanStatus;
(function (PaymentPlanStatus) {
    PaymentPlanStatus["ACTIVE"] = "active";
    PaymentPlanStatus["COMPLETED"] = "completed";
    PaymentPlanStatus["DEFAULTED"] = "defaulted";
    PaymentPlanStatus["CANCELLED"] = "cancelled";
})(PaymentPlanStatus || (exports.PaymentPlanStatus = PaymentPlanStatus = {}));
//# sourceMappingURL=crm.types.js.map