import { Response, NextFunction } from 'express';
import { adminLoginSchema, applicationQuerySchema, changePasswordSchema } from '../validators/adminValidator.js';
import { updateStatusSchema } from '../validators/applicationValidator.js';
import { AdminService } from '../services/adminService.js';
import { ApplicationService } from '../services/applicationService.js';
import { AuditService } from '../services/auditService.js';
import { ExportService } from '../services/exportService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ApplicationStatus } from '@prisma/client';
import { ENV } from '../config/env.js';

export class AdminController {
  /**
   * Admin Login handler
   */
  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = adminLoginSchema.parse(req.body);
      const { admin, token } = await AdminService.login(email, password);

      // Set secure HTTP-only cookie
      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });

      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

      // Log login event
      await AuditService.log({
        adminId: admin.id,
        action: 'LOGIN',
        details: `Admin ${admin.email} logged in successfully`,
        ipAddress: ip,
        userAgent: req.headers['user-agent'],
      });

      return sendSuccess(
        res,
        {
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
          token,
        },
        'Logged in successfully'
      );
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        return sendError(res, 'Invalid email address or password.', 401);
      }
      next(error);
    }
  }

  /**
   * Admin Logout handler
   */
  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.admin) {
        await AuditService.log({
          adminId: req.admin.id,
          action: 'LOGOUT',
          details: `Admin ${req.admin.email} logged out`,
          ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
        });
      }

      res.clearCookie('admin_token');
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns current authenticated admin profile
   */
  static async getMe(req: AuthenticatedRequest, res: Response) {
    return sendSuccess(res, { admin: req.admin });
  }

  /**
   * Changes authenticated admin password
   */
  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.admin?.id) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      await AdminService.changePassword(req.admin.id, currentPassword, newPassword);

      // Audit log password change
      await AuditService.log({
        adminId: req.admin.id,
        action: 'PASSWORD_CHANGE',
        details: `Admin ${req.admin.email} changed their password securely`,
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      return sendSuccess(res, null, 'Password updated successfully');
    } catch (error: any) {
      if (error.message === 'Current password is incorrect') {
        return sendError(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Dashboard KPI statistics and chart analytics
   */
  static async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await ApplicationService.getDashboardStats();
      return sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Server-side paginated & filtered application list
   */
  static async getApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const queryParams = applicationQuerySchema.parse(req.query);
      const result = await ApplicationService.queryApplications(queryParams);

      return sendSuccess(res, result.applications, 'Applications retrieved', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Single application details for admin dossier view
   */
  static async getApplicationById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const application = await ApplicationService.getByIdOrAppId(id);

      if (!application) {
        return sendError(res, 'Application not found', 404);
      }

      // Log view event
      await AuditService.log({
        adminId: req.admin?.id,
        applicationId: application.id,
        action: 'VIEW_APPLICATION',
        details: `Viewed dossier for ${application.applicationId} (${application.fullName})`,
      });

      return sendSuccess(res, application);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Status change handler
   */
  static async updateApplicationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status, remarks } = updateStatusSchema.parse(req.body);

      const existing = await ApplicationService.getByIdOrAppId(id);
      if (!existing) {
        return sendError(res, 'Application not found', 404);
      }

      const updated = await ApplicationService.updateStatus(
        existing.id,
        status as ApplicationStatus,
        remarks
      );

      // Log audit trail
      await AuditService.log({
        adminId: req.admin?.id,
        applicationId: existing.id,
        action: 'STATUS_CHANGE',
        details: `Changed status from ${existing.status} to ${status}. Remarks: ${remarks || 'None'}`,
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      return sendSuccess(res, updated, `Status updated to ${status.replace('_', ' ')} successfully`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export applications to CSV or XLSX
   */
  static async exportApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const format = (req.query.format as string)?.toLowerCase() || 'csv';
      const search = req.query.search as string;
      const course = req.query.course as string;
      const year = req.query.year as string;
      const status = req.query.status as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const applications = await ApplicationService.getApplicationsForExport({
        search,
        course,
        year,
        status,
        startDate,
        endDate,
      });

      // Audit export
      await AuditService.log({
        adminId: req.admin?.id,
        action: 'EXPORT_DATA',
        details: `Exported ${applications.length} applications in ${format.toUpperCase()} format`,
      });

      const timestamp = new Date().toISOString().split('T')[0];

      if (format === 'xlsx') {
        const buffer = ExportService.generateXLSX(applications);
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="Alwar_Police_Cyber_Applications_${timestamp}.xlsx"`
        );
        return res.end(buffer);
      } else {
        const buffer = ExportService.generateCSV(applications);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="Alwar_Police_Cyber_Applications_${timestamp}.csv"`
        );
        return res.end(buffer);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves audit logs
   */
  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const action = req.query.action as string;

      const result = await AuditService.getLogs(page, limit, action);
      return sendSuccess(res, result.logs, 'Audit logs retrieved', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }
}
