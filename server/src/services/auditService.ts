import { prisma } from '../config/db.js';

export interface CreateAuditLogParams {
  adminId?: string;
  applicationId?: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Logs an action to the database audit trail
   */
  static async log(params: CreateAuditLogParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          adminId: params.adminId || null,
          applicationId: params.applicationId || null,
          action: params.action,
          details: params.details || null,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });
    } catch (error) {
      console.error('⚠️ Failed to write audit log:', error);
    }
  }

  /**
   * Fetches paginated audit logs
   */
  static async getLogs(page = 1, limit = 50, action?: string) {
    const skip = (page - 1) * limit;
    const where = action && action !== 'ALL' ? { action } : {};

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          application: {
            select: {
              id: true,
              applicationId: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
