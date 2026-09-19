import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { adminLoginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public auth endpoints
router.post('/login', adminLoginLimiter, AdminController.login);
router.post('/logout', AdminController.logout);

// Protected Admin Endpoints
router.use(requireAdminAuth);

router.get('/me', AdminController.getMe);
router.patch('/change-password', AdminController.changePassword);
router.get('/dashboard/stats', AdminController.getDashboardStats);
router.get('/applications', AdminController.getApplications);
router.get('/applications/:id', AdminController.getApplicationById);
router.patch('/applications/:id/status', AdminController.updateApplicationStatus);
router.delete('/applications/:id', AdminController.deleteApplication);
router.get('/export', AdminController.exportApplications);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/system/registration-status', AdminController.getRegistrationStatus);
router.post('/system/registration-status', AdminController.setRegistrationStatus);

export default router;
