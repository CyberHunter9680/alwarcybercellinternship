"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const adminValidator_js_1 = require("../validators/adminValidator.js");
const applicationValidator_js_1 = require("../validators/applicationValidator.js");
const adminService_js_1 = require("../services/adminService.js");
const applicationService_js_1 = require("../services/applicationService.js");
const auditService_js_1 = require("../services/auditService.js");
const exportService_js_1 = require("../services/exportService.js");
const responseHelper_js_1 = require("../utils/responseHelper.js");
const env_js_1 = require("../config/env.js");
class AdminController {
    /**
     * Admin Login handler
     */
    static async login(req, res, next) {
        try {
            const { email, password } = adminValidator_js_1.adminLoginSchema.parse(req.body);
            const { admin, token } = await adminService_js_1.AdminService.login(email, password);
            // Set secure HTTP-only cookie
            res.cookie('admin_token', token, {
                httpOnly: true,
                secure: env_js_1.ENV.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 8 * 60 * 60 * 1000, // 8 hours
            });
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
            // Log login event
            await auditService_js_1.AuditService.log({
                adminId: admin.id,
                action: 'LOGIN',
                details: `Admin ${admin.email} logged in successfully`,
                ipAddress: ip,
                userAgent: req.headers['user-agent'],
            });
            return (0, responseHelper_js_1.sendSuccess)(res, {
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                },
                token,
            }, 'Logged in successfully');
        }
        catch (error) {
            if (error.message === 'Invalid email or password') {
                return (0, responseHelper_js_1.sendError)(res, 'Invalid email address or password.', 401);
            }
            next(error);
        }
    }
    /**
     * Admin Logout handler
     */
    static async logout(req, res, next) {
        try {
            if (req.admin) {
                await auditService_js_1.AuditService.log({
                    adminId: req.admin.id,
                    action: 'LOGOUT',
                    details: `Admin ${req.admin.email} logged out`,
                    ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                    userAgent: req.headers['user-agent'],
                });
            }
            res.clearCookie('admin_token');
            return (0, responseHelper_js_1.sendSuccess)(res, null, 'Logged out successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Returns current authenticated admin profile
     */
    static async getMe(req, res) {
        return (0, responseHelper_js_1.sendSuccess)(res, { admin: req.admin });
    }
    /**
     * Dashboard KPI statistics and chart analytics
     */
    static async getDashboardStats(req, res, next) {
        try {
            const stats = await applicationService_js_1.ApplicationService.getDashboardStats();
            return (0, responseHelper_js_1.sendSuccess)(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Server-side paginated & filtered application list
     */
    static async getApplications(req, res, next) {
        try {
            const queryParams = adminValidator_js_1.applicationQuerySchema.parse(req.query);
            const result = await applicationService_js_1.ApplicationService.queryApplications(queryParams);
            return (0, responseHelper_js_1.sendSuccess)(res, result.applications, 'Applications retrieved', 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Single application details for admin dossier view
     */
    static async getApplicationById(req, res, next) {
        try {
            const id = req.params.id;
            const application = await applicationService_js_1.ApplicationService.getByIdOrAppId(id);
            if (!application) {
                return (0, responseHelper_js_1.sendError)(res, 'Application not found', 404);
            }
            // Log view event
            await auditService_js_1.AuditService.log({
                adminId: req.admin?.id,
                applicationId: application.id,
                action: 'VIEW_APPLICATION',
                details: `Viewed dossier for ${application.applicationId} (${application.fullName})`,
            });
            return (0, responseHelper_js_1.sendSuccess)(res, application);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Status change handler
     */
    static async updateApplicationStatus(req, res, next) {
        try {
            const id = req.params.id;
            const { status, remarks } = applicationValidator_js_1.updateStatusSchema.parse(req.body);
            const existing = await applicationService_js_1.ApplicationService.getByIdOrAppId(id);
            if (!existing) {
                return (0, responseHelper_js_1.sendError)(res, 'Application not found', 404);
            }
            const updated = await applicationService_js_1.ApplicationService.updateStatus(existing.id, status, remarks);
            // Log audit trail
            await auditService_js_1.AuditService.log({
                adminId: req.admin?.id,
                applicationId: existing.id,
                action: 'STATUS_CHANGE',
                details: `Changed status from ${existing.status} to ${status}. Remarks: ${remarks || 'None'}`,
                ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
            });
            return (0, responseHelper_js_1.sendSuccess)(res, updated, `Status updated to ${status.replace('_', ' ')} successfully`);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Export applications to CSV or XLSX
     */
    static async exportApplications(req, res, next) {
        try {
            const format = req.query.format?.toLowerCase() || 'csv';
            const search = req.query.search;
            const course = req.query.course;
            const year = req.query.year;
            const status = req.query.status;
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const applications = await applicationService_js_1.ApplicationService.getApplicationsForExport({
                search,
                course,
                year,
                status,
                startDate,
                endDate,
            });
            // Audit export
            await auditService_js_1.AuditService.log({
                adminId: req.admin?.id,
                action: 'EXPORT_DATA',
                details: `Exported ${applications.length} applications in ${format.toUpperCase()} format`,
            });
            const timestamp = new Date().toISOString().split('T')[0];
            if (format === 'xlsx') {
                const buffer = exportService_js_1.ExportService.generateXLSX(applications);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="Alwar_Police_Cyber_Applications_${timestamp}.xlsx"`);
                return res.end(buffer);
            }
            else {
                const buffer = exportService_js_1.ExportService.generateCSV(applications);
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="Alwar_Police_Cyber_Applications_${timestamp}.csv"`);
                return res.end(buffer);
            }
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Retrieves audit logs
     */
    static async getAuditLogs(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 50;
            const action = req.query.action;
            const result = await auditService_js_1.AuditService.getLogs(page, limit, action);
            return (0, responseHelper_js_1.sendSuccess)(res, result.logs, 'Audit logs retrieved', 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
