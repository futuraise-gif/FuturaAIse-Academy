"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCRMController = void 0;
const user_firebase_1 = require("../models/user.firebase");
const types_1 = require("../types");
const admin = __importStar(require("firebase-admin"));
const crm_types_1 = require("../types/crm.types");
const db = admin.firestore();
class AdminCRMController {
    /**
     * Check if user has admin access
     */
    static hasAdminAccess(userRole) {
        return userRole === types_1.UserRole.ADMIN || userRole === types_1.UserRole.SUPER_ADMIN;
    }
    /**
     * Generate invoice number
     */
    static async generateInvoiceNumber() {
        const year = new Date().getFullYear();
        const invoicesSnapshot = await db
            .collection('invoices')
            .where('invoice_number', '>=', `INV${year}`)
            .where('invoice_number', '<', `INV${year + 1}`)
            .get();
        const count = invoicesSnapshot.size + 1;
        const paddedCount = count.toString().padStart(5, '0');
        return `INV${year}${paddedCount}`;
    }
    // ==================== LEAD MANAGEMENT ====================
    /**
     * Create a new lead
     */
    static async createLead(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { first_name, last_name, email, phone, source, interested_courses, notes, } = req.body;
            if (!first_name || !last_name || !email) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            const now = new Date().toISOString();
            const leadData = {
                first_name,
                last_name,
                email,
                source: source || crm_types_1.LeadSource.OTHER,
                status: crm_types_1.LeadStatus.NEW,
                score: 50, // Default lead score
                assigned_to: user.userId,
                assigned_to_name: `${user.first_name} ${user.last_name}`,
                created_at: now,
                updated_at: now,
            };
            if (phone)
                leadData.phone = phone;
            if (interested_courses)
                leadData.interested_courses = interested_courses;
            if (notes)
                leadData.notes = notes;
            const leadRef = await db.collection('leads').add(leadData);
            // Log activity
            await db.collection('activities').add({
                lead_id: leadRef.id,
                type: crm_types_1.ActivityType.LEAD_CREATED,
                title: 'Lead created',
                description: `${first_name} ${last_name} added as new lead`,
                created_by: user.userId,
                created_by_name: `${user.first_name} ${user.last_name}`,
                created_at: now,
            });
            res.status(201).json({
                message: 'Lead created successfully',
                lead: { id: leadRef.id, ...leadData },
            });
        }
        catch (error) {
            console.error('Create lead error:', error);
            res.status(500).json({ error: 'Failed to create lead' });
        }
    }
    /**
     * Get all leads with filters
     */
    static async getLeads(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { status, source, assigned_to } = req.query;
            let query = db.collection('leads');
            if (status) {
                query = query.where('status', '==', status);
            }
            if (source) {
                query = query.where('source', '==', source);
            }
            if (assigned_to) {
                query = query.where('assigned_to', '==', assigned_to);
            }
            const snapshot = await query.get();
            let leads = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Sort by created_at
            leads.sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            res.json({ leads, count: leads.length });
        }
        catch (error) {
            console.error('Get leads error:', error);
            res.status(500).json({ error: 'Failed to fetch leads' });
        }
    }
    /**
     * Update lead status
     */
    static async updateLeadStatus(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { leadId } = req.params;
            const { status, notes } = req.body;
            const leadDoc = await db.collection('leads').doc(leadId).get();
            if (!leadDoc.exists) {
                res.status(404).json({ error: 'Lead not found' });
                return;
            }
            const updateData = {
                status,
                updated_at: new Date().toISOString(),
            };
            if (status === crm_types_1.LeadStatus.CONTACTED) {
                updateData.last_contacted = new Date().toISOString();
            }
            await db.collection('leads').doc(leadId).update(updateData);
            // Log activity
            const now = new Date().toISOString();
            await db.collection('activities').add({
                lead_id: leadId,
                type: crm_types_1.ActivityType.LEAD_STATUS_CHANGED,
                title: 'Lead status changed',
                description: `Status changed to ${status}${notes ? ': ' + notes : ''}`,
                created_by: user.userId,
                created_by_name: `${user.first_name} ${user.last_name}`,
                created_at: now,
            });
            res.json({ message: 'Lead status updated successfully' });
        }
        catch (error) {
            console.error('Update lead status error:', error);
            res.status(500).json({ error: 'Failed to update lead status' });
        }
    }
    /**
     * Convert lead to student
     */
    static async convertLeadToStudent(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { leadId } = req.params;
            const { password, enroll_in_courses, additional_info } = req.body;
            const leadDoc = await db.collection('leads').doc(leadId).get();
            if (!leadDoc.exists) {
                res.status(404).json({ error: 'Lead not found' });
                return;
            }
            const lead = leadDoc.data();
            // Create Firebase Auth user
            const firebaseUser = await admin.auth().createUser({
                email: lead.email,
                password,
                displayName: `${lead.first_name} ${lead.last_name}`,
            });
            // Generate student ID
            const year = new Date().getFullYear();
            const usersSnapshot = await db
                .collection('users')
                .where('role', '==', types_1.UserRole.STUDENT)
                .get();
            const count = usersSnapshot.size + 1;
            const student_id = `STU${year}${count.toString().padStart(4, '0')}`;
            // Create user in Firestore
            const userData = {
                email: lead.email,
                first_name: lead.first_name,
                last_name: lead.last_name,
                role: types_1.UserRole.STUDENT,
                status: types_1.UserStatus.ACTIVE,
                student_id,
                phone: lead.phone,
                ...additional_info,
            };
            await user_firebase_1.UserModel.create(firebaseUser.uid, userData);
            // Enroll in courses
            if (enroll_in_courses && enroll_in_courses.length > 0) {
                for (const courseId of enroll_in_courses) {
                    const enrollmentId = `${firebaseUser.uid}_${courseId}`;
                    await db.collection('enrollments').doc(enrollmentId).set({
                        student_id: firebaseUser.uid,
                        course_id: courseId,
                        status: 'active',
                        enrolled_at: new Date().toISOString(),
                        progress: 0,
                    });
                }
            }
            // Update lead as converted
            await db.collection('leads').doc(leadId).update({
                status: crm_types_1.LeadStatus.CONVERTED,
                converted_to_student_id: firebaseUser.uid,
                updated_at: new Date().toISOString(),
            });
            // Log activity
            const now = new Date().toISOString();
            await db.collection('activities').add({
                lead_id: leadId,
                student_id: firebaseUser.uid,
                type: crm_types_1.ActivityType.STUDENT_REGISTERED,
                title: 'Lead converted to student',
                description: `${lead.first_name} ${lead.last_name} converted to student ${student_id}`,
                created_by: user.userId,
                created_by_name: `${user.first_name} ${user.last_name}`,
                created_at: now,
            });
            res.status(201).json({
                message: 'Lead converted to student successfully',
                student_id,
                user_id: firebaseUser.uid,
            });
        }
        catch (error) {
            console.error('Convert lead error:', error);
            res.status(500).json({ error: 'Failed to convert lead' });
        }
    }
    // ==================== COMMUNICATION TRACKING ====================
    /**
     * Log communication
     */
    static async logCommunication(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { student_id, lead_id, type, direction, subject, message, outcome, follow_up_required, follow_up_date, } = req.body;
            const now = new Date().toISOString();
            const commData = {
                type,
                direction,
                message,
                created_by: user.userId,
                created_by_name: `${user.first_name} ${user.last_name}`,
                created_at: now,
            };
            if (student_id)
                commData.student_id = student_id;
            if (lead_id)
                commData.lead_id = lead_id;
            if (subject)
                commData.subject = subject;
            if (outcome)
                commData.outcome = outcome;
            if (follow_up_required)
                commData.follow_up_required = follow_up_required;
            if (follow_up_date)
                commData.follow_up_date = follow_up_date;
            const commRef = await db.collection('communications').add(commData);
            // Update last_contacted for leads
            if (lead_id) {
                await db.collection('leads').doc(lead_id).update({
                    last_contacted: now,
                });
            }
            // Log activity
            await db.collection('activities').add({
                student_id,
                lead_id,
                type: crm_types_1.ActivityType.COMMUNICATION_LOGGED,
                title: `${type} communication logged`,
                description: subject || message.substring(0, 100),
                created_by: user.userId,
                created_by_name: `${user.first_name} ${user.last_name}`,
                created_at: now,
            });
            res.status(201).json({
                message: 'Communication logged successfully',
                communication: { id: commRef.id, ...commData },
            });
        }
        catch (error) {
            console.error('Log communication error:', error);
            res.status(500).json({ error: 'Failed to log communication' });
        }
    }
    /**
     * Get communications
     */
    static async getCommunications(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { student_id, lead_id } = req.query;
            let query = db.collection('communications');
            if (student_id) {
                query = query.where('student_id', '==', student_id);
            }
            if (lead_id) {
                query = query.where('lead_id', '==', lead_id);
            }
            const snapshot = await query.get();
            let communications = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            communications.sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            res.json({ communications, count: communications.length });
        }
        catch (error) {
            console.error('Get communications error:', error);
            res.status(500).json({ error: 'Failed to fetch communications' });
        }
    }
    // ==================== ACTIVITY TIMELINE ====================
    /**
     * Get activity timeline
     */
    static async getActivities(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { student_id, lead_id, limit } = req.query;
            let query = db.collection('activities');
            if (student_id) {
                query = query.where('student_id', '==', student_id);
            }
            if (lead_id) {
                query = query.where('lead_id', '==', lead_id);
            }
            const snapshot = await query.get();
            let activities = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            activities.sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            if (limit) {
                activities = activities.slice(0, parseInt(limit));
            }
            res.json({ activities, count: activities.length });
        }
        catch (error) {
            console.error('Get activities error:', error);
            res.status(500).json({ error: 'Failed to fetch activities' });
        }
    }
    // ==================== TASKS & FOLLOW-UPS ====================
    /**
     * Create task
     */
    static async createTask(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { student_id, lead_id, title, description, priority, due_date, assigned_to, assigned_to_name, } = req.body;
            const now = new Date().toISOString();
            const taskData = {
                title,
                status: crm_types_1.TaskStatus.PENDING,
                priority: priority || crm_types_1.TaskPriority.MEDIUM,
                assigned_to,
                assigned_to_name,
                created_by: user.userId,
                created_by_name: `${user.first_name} ${user.last_name}`,
                created_at: now,
                updated_at: now,
            };
            if (student_id)
                taskData.student_id = student_id;
            if (lead_id)
                taskData.lead_id = lead_id;
            if (description)
                taskData.description = description;
            if (due_date)
                taskData.due_date = due_date;
            const taskRef = await db.collection('tasks').add(taskData);
            // Log activity
            await db.collection('activities').add({
                student_id,
                lead_id,
                type: crm_types_1.ActivityType.TASK_CREATED,
                title: 'Task created',
                description: title,
                created_by: user.userId,
                created_by_name: `${user.first_name} ${user.last_name}`,
                created_at: now,
            });
            res.status(201).json({
                message: 'Task created successfully',
                task: { id: taskRef.id, ...taskData },
            });
        }
        catch (error) {
            console.error('Create task error:', error);
            res.status(500).json({ error: 'Failed to create task' });
        }
    }
    /**
     * Get tasks
     */
    static async getTasks(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { student_id, lead_id, assigned_to, status } = req.query;
            let query = db.collection('tasks');
            if (student_id) {
                query = query.where('student_id', '==', student_id);
            }
            if (lead_id) {
                query = query.where('lead_id', '==', lead_id);
            }
            if (assigned_to) {
                query = query.where('assigned_to', '==', assigned_to);
            }
            if (status) {
                query = query.where('status', '==', status);
            }
            const snapshot = await query.get();
            const tasks = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            res.json({ tasks, count: tasks.length });
        }
        catch (error) {
            console.error('Get tasks error:', error);
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    }
    /**
     * Update task status
     */
    static async updateTaskStatus(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { taskId } = req.params;
            const { status } = req.body;
            const updateData = {
                status,
                updated_at: new Date().toISOString(),
            };
            if (status === crm_types_1.TaskStatus.COMPLETED) {
                updateData.completed_at = new Date().toISOString();
            }
            await db.collection('tasks').doc(taskId).update(updateData);
            res.json({ message: 'Task status updated successfully' });
        }
        catch (error) {
            console.error('Update task status error:', error);
            res.status(500).json({ error: 'Failed to update task status' });
        }
    }
    // ==================== INVOICING & PAYMENTS ====================
    /**
     * Create invoice
     */
    static async createInvoice(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { student_id, line_items, tax_percentage, discount_amount, currency, due_date, payment_terms, notes, } = req.body;
            // Get student info
            const studentDoc = await db.collection('users').doc(student_id).get();
            if (!studentDoc.exists) {
                res.status(404).json({ error: 'Student not found' });
                return;
            }
            const student = studentDoc.data();
            const invoice_number = await AdminCRMController.generateInvoiceNumber();
            // Calculate totals
            let subtotal = 0;
            const processedLineItems = line_items.map((item) => {
                const total = item.quantity * item.unit_price;
                subtotal += total;
                return {
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    tax_percentage: item.tax_percentage || 0,
                    total,
                };
            });
            const tax_amount = (subtotal * (tax_percentage || 0)) / 100;
            const total_amount = subtotal + tax_amount - (discount_amount || 0);
            const now = new Date().toISOString();
            const invoiceData = {
                invoice_number,
                student_id,
                student_name: `${student?.first_name} ${student?.last_name}`,
                student_email: student?.email,
                line_items: processedLineItems,
                subtotal,
                tax_amount,
                discount_amount: discount_amount || 0,
                total_amount,
                currency: currency || 'USD',
                status: crm_types_1.InvoiceStatus.DRAFT,
                issue_date: now,
                due_date,
                created_by: user.userId,
                created_at: now,
                updated_at: now,
            };
            if (payment_terms)
                invoiceData.payment_terms = payment_terms;
            if (notes)
                invoiceData.notes = notes;
            const invoiceRef = await db.collection('invoices').add(invoiceData);
            // Log activity
            await db.collection('activities').add({
                student_id,
                type: crm_types_1.ActivityType.INVOICE_GENERATED,
                title: 'Invoice created',
                description: `Invoice ${invoice_number} for ${currency} ${total_amount.toFixed(2)}`,
                metadata: { invoice_id: invoiceRef.id },
                created_by: user.userId,
                created_by_name: `${user.first_name} ${user.last_name}`,
                created_at: now,
            });
            res.status(201).json({
                message: 'Invoice created successfully',
                invoice: { id: invoiceRef.id, ...invoiceData },
            });
        }
        catch (error) {
            console.error('Create invoice error:', error);
            res.status(500).json({ error: 'Failed to create invoice' });
        }
    }
    /**
     * Get invoices
     */
    static async getInvoices(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { student_id, status } = req.query;
            let query = db.collection('invoices');
            if (student_id) {
                query = query.where('student_id', '==', student_id);
            }
            if (status) {
                query = query.where('status', '==', status);
            }
            const snapshot = await query.get();
            let invoices = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            invoices.sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            res.json({ invoices, count: invoices.length });
        }
        catch (error) {
            console.error('Get invoices error:', error);
            res.status(500).json({ error: 'Failed to fetch invoices' });
        }
    }
    /**
     * Record payment
     */
    static async recordPayment(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { invoice_id, student_id, amount, currency, payment_method, transaction_id, reference_number, notes, } = req.body;
            // Get student info
            const studentDoc = await db.collection('users').doc(student_id).get();
            if (!studentDoc.exists) {
                res.status(404).json({ error: 'Student not found' });
                return;
            }
            const student = studentDoc.data();
            const now = new Date().toISOString();
            const paymentData = {
                student_id,
                student_name: `${student?.first_name} ${student?.last_name}`,
                amount,
                currency: currency || 'USD',
                payment_method,
                payment_status: crm_types_1.PaymentStatus.COMPLETED,
                payment_date: now,
                created_by: user.userId,
                created_at: now,
                updated_at: now,
            };
            if (invoice_id)
                paymentData.invoice_id = invoice_id;
            if (transaction_id)
                paymentData.transaction_id = transaction_id;
            if (reference_number)
                paymentData.reference_number = reference_number;
            if (notes)
                paymentData.notes = notes;
            const paymentRef = await db.collection('payments').add(paymentData);
            // Update invoice status if applicable
            if (invoice_id) {
                const invoiceDoc = await db.collection('invoices').doc(invoice_id).get();
                if (invoiceDoc.exists) {
                    const invoice = invoiceDoc.data();
                    const updatedStatus = amount >= invoice.total_amount
                        ? crm_types_1.InvoiceStatus.PAID
                        : crm_types_1.InvoiceStatus.PARTIALLY_PAID;
                    await db.collection('invoices').doc(invoice_id).update({
                        status: updatedStatus,
                        paid_date: updatedStatus === crm_types_1.InvoiceStatus.PAID ? now : null,
                        updated_at: now,
                    });
                }
            }
            // Log activity
            await db.collection('activities').add({
                student_id,
                type: crm_types_1.ActivityType.PAYMENT_RECEIVED,
                title: 'Payment received',
                description: `${currency} ${amount.toFixed(2)} via ${payment_method}`,
                metadata: { payment_id: paymentRef.id },
                created_by: user.userId,
                created_by_name: `${user.first_name} ${user.last_name}`,
                created_at: now,
            });
            res.status(201).json({
                message: 'Payment recorded successfully',
                payment: { id: paymentRef.id, ...paymentData },
            });
        }
        catch (error) {
            console.error('Record payment error:', error);
            res.status(500).json({ error: 'Failed to record payment' });
        }
    }
    /**
     * Get payments
     */
    static async getPayments(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            const { student_id, invoice_id } = req.query;
            let query = db.collection('payments');
            if (student_id) {
                query = query.where('student_id', '==', student_id);
            }
            if (invoice_id) {
                query = query.where('invoice_id', '==', invoice_id);
            }
            const snapshot = await query.get();
            let payments = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            payments.sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            res.json({ payments, count: payments.length });
        }
        catch (error) {
            console.error('Get payments error:', error);
            res.status(500).json({ error: 'Failed to fetch payments' });
        }
    }
    // ==================== ANALYTICS & REPORTS ====================
    /**
     * Get CRM dashboard statistics
     */
    static async getDashboardStats(req, res) {
        try {
            const user = req.user;
            if (!AdminCRMController.hasAdminAccess(user.role)) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            // Get leads stats
            const leadsSnapshot = await db.collection('leads').get();
            const leads = leadsSnapshot.docs.map((doc) => doc.data());
            // Get invoices stats
            const invoicesSnapshot = await db.collection('invoices').get();
            const invoices = invoicesSnapshot.docs.map((doc) => doc.data());
            // Get payments stats
            const paymentsSnapshot = await db.collection('payments').get();
            const payments = paymentsSnapshot.docs.map((doc) => doc.data());
            const stats = {
                leads: {
                    total: leads.length,
                    new: leads.filter((l) => l.status === crm_types_1.LeadStatus.NEW).length,
                    contacted: leads.filter((l) => l.status === crm_types_1.LeadStatus.CONTACTED).length,
                    qualified: leads.filter((l) => l.status === crm_types_1.LeadStatus.QUALIFIED).length,
                    converted: leads.filter((l) => l.status === crm_types_1.LeadStatus.CONVERTED).length,
                    lost: leads.filter((l) => l.status === crm_types_1.LeadStatus.LOST).length,
                    conversion_rate: leads.length > 0
                        ? ((leads.filter((l) => l.status === crm_types_1.LeadStatus.CONVERTED).length / leads.length) * 100).toFixed(2)
                        : 0,
                },
                invoices: {
                    total: invoices.length,
                    draft: invoices.filter((i) => i.status === crm_types_1.InvoiceStatus.DRAFT).length,
                    sent: invoices.filter((i) => i.status === crm_types_1.InvoiceStatus.SENT).length,
                    paid: invoices.filter((i) => i.status === crm_types_1.InvoiceStatus.PAID).length,
                    overdue: invoices.filter((i) => i.status === crm_types_1.InvoiceStatus.OVERDUE).length,
                    total_amount: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
                    paid_amount: invoices
                        .filter((i) => i.status === crm_types_1.InvoiceStatus.PAID)
                        .reduce((sum, i) => sum + (i.total_amount || 0), 0),
                },
                payments: {
                    total: payments.length,
                    total_amount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
                    this_month: payments.filter((p) => {
                        const paymentDate = new Date(p.payment_date);
                        const now = new Date();
                        return (paymentDate.getMonth() === now.getMonth() &&
                            paymentDate.getFullYear() === now.getFullYear());
                    }).length,
                },
            };
            res.json(stats);
        }
        catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({ error: 'Failed to fetch dashboard stats' });
        }
    }
}
exports.AdminCRMController = AdminCRMController;
//# sourceMappingURL=admin.crm.controller.js.map