import { Router } from 'express';
import { AdminCRMController } from '../controllers/admin.crm.controller';
import { authenticate } from '../middleware/auth.firebase';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Lead Management
router.post('/leads', AdminCRMController.createLead);
router.get('/leads', AdminCRMController.getLeads);
router.put('/leads/:leadId/status', AdminCRMController.updateLeadStatus);
router.post('/leads/:leadId/convert', AdminCRMController.convertLeadToStudent);

// Communication Tracking
router.post('/communications', AdminCRMController.logCommunication);
router.get('/communications', AdminCRMController.getCommunications);

// Activity Timeline
router.get('/activities', AdminCRMController.getActivities);

// Tasks & Follow-ups
router.post('/tasks', AdminCRMController.createTask);
router.get('/tasks', AdminCRMController.getTasks);
router.put('/tasks/:taskId/status', AdminCRMController.updateTaskStatus);

// Invoicing & Payments
router.post('/invoices', AdminCRMController.createInvoice);
router.get('/invoices', AdminCRMController.getInvoices);
router.post('/payments', AdminCRMController.recordPayment);
router.get('/payments', AdminCRMController.getPayments);

// Analytics & Reports
router.get('/dashboard-stats', AdminCRMController.getDashboardStats);

export default router;
