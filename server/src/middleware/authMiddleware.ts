import { Request, Response, NextFunction } from 'express';
import { AdminService, AdminTokenPayload } from '../services/adminService.js';
import { sendError } from '../utils/responseHelper.js';

export interface AuthenticatedRequest extends Request {
  admin?: AdminTokenPayload;
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // 1. Check HTTP-only cookie first, then Bearer Authorization header
    let token = req.cookies?.admin_token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please sign in to the Admin Portal.', 401);
    }

    const payload = AdminService.verifyToken(token);
    if (!payload) {
      return sendError(res, 'Session has expired or is invalid. Please sign in again.', 401);
    }

    req.admin = payload;
    next();
  } catch (error) {
    return sendError(res, 'Authentication verification failed', 401);
  }
}
