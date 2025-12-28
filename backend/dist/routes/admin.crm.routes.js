"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_crm_controller_1 = require("../controllers/admin.crm.controller");
const auth_firebase_1 = require("../middleware/auth.firebase");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_firebase_1.authenticate);
// Lead Management
router.post('/leads', admin_crm_controller_1.AdminCRMController.createLead);
router.get('/leads', admin_crm_controller_1.AdminCRMController.getLeads);
router.put('/leads/:leadId/status', admin_crm_controller_1.AdminCRMController.updateLeadStatus);
router.post('/leads/:leadId/convert', admin_crm_controller_1.AdminCRMController.convertLeadToStudent);
// Communication Tracking
router.post('/communications', admin_crm_controller_1.AdminCRMController.logCommunication);
router.get('/communications', admin_crm_controller_1.AdminCRMController.getCommunications);
// Activity Timeline
router.get('/activities', admin_crm_controller_1.AdminCRMController.getActivities);
// Tasks & Follow-ups
router.post('/tasks', admin_crm_controller_1.AdminCRMController.createTask);
router.get('/tasks', admin_crm_controller_1.AdminCRMController.getTasks);
router.put('/tasks/:taskId/status', admin_crm_controller_1.AdminCRMController.updateTaskStatus);
// Invoicing & Payments
router.post('/invoices', admin_crm_controller_1.AdminCRMController.createInvoice);
router.get('/invoices', admin_crm_controller_1.AdminCRMController.getInvoices);
router.post('/payments', admin_crm_controller_1.AdminCRMController.recordPayment);
router.get('/payments', admin_crm_controller_1.AdminCRMController.getPayments);
// Analytics & Reports
router.get('/dashboard-stats', admin_crm_controller_1.AdminCRMController.getDashboardStats);
exports.default = router;
//# sourceMappingURL=admin.crm.routes.js.map