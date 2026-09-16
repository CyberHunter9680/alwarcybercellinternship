"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_js_1 = require("../controllers/adminController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const rateLimiter_js_1 = require("../middleware/rateLimiter.js");
const router = (0, express_1.Router)();
// Public auth endpoints
router.post('/login', rateLimiter_js_1.adminLoginLimiter, adminController_js_1.AdminController.login);
router.post('/logout', adminController_js_1.AdminController.logout);
// Protected Admin Endpoints
router.use(authMiddleware_js_1.requireAdminAuth);
router.get('/me', adminController_js_1.AdminController.getMe);
router.patch('/change-password', adminController_js_1.AdminController.changePassword);
router.get('/dashboard/stats', adminController_js_1.AdminController.getDashboardStats);
router.get('/applications', adminController_js_1.AdminController.getApplications);
router.get('/applications/:id', adminController_js_1.AdminController.getApplicationById);
router.patch('/applications/:id/status', adminController_js_1.AdminController.updateApplicationStatus);
router.get('/export', adminController_js_1.AdminController.exportApplications);
router.get('/audit-logs', adminController_js_1.AdminController.getAuditLogs);
exports.default = router;
