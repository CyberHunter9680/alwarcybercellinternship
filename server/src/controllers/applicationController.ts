import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import { createApplicationSchema } from '../validators/applicationValidator.js';
import { ApplicationService } from '../services/applicationService.js';
import { StorageService } from '../services/storageService.js';
import { PDFService } from '../services/pdfService.js';
import { AdminService } from '../services/adminService.js';
import { SystemService } from '../services/systemService.js';
import { AuditService } from '../services/auditService.js';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ENV } from '../config/env.js';

interface SlipTokenPayload {
  applicationId: string;
  id: string;
  type: string;
}

export class ApplicationController {
  /**
   * Generates a signed, tamper-proof token allowing the student to access their own slip
   */
  private static generateSlipToken(applicationId: string, id: string): string {
    const payload: SlipTokenPayload = {
      applicationId,
      id,
      type: 'slip_access',
    };
    return jwt.sign(payload, ENV.AUTH_SECRET, { expiresIn: '7d' });
  }

  /**
   * Helper to verify if the request is authorized either as an Admin or with a valid candidate Slip Token
   */
  private static verifyAccess(req: Request, targetApplicationIdOrId: string): boolean {
    // 1. Check if caller is an authenticated Admin (via cookie or Bearer header)
    let adminToken = req.cookies?.admin_token;
    if (!adminToken && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        adminToken = parts[1];
      }
    }

    if (adminToken) {
      const adminPayload = AdminService.verifyToken(adminToken);
      if (adminPayload) {
        return true; // Admin has authorized access
      }
    }

    // 2. Check candidate slip token from query param or header
    const token = (req.query.token as string) || (req.headers['x-slip-token'] as string);
    if (token) {
      try {
        const decoded = jwt.verify(token, ENV.AUTH_SECRET) as SlipTokenPayload;
        if (
          decoded &&
          decoded.type === 'slip_access' &&
          (decoded.applicationId === targetApplicationIdOrId || decoded.id === targetApplicationIdOrId)
        ) {
          return true; // Candidate is authorized for their specific application
        }
      } catch {
        // Token invalid or expired
      }
    }

    return false;
  }

  /**
   * Submits a student registration application
   */
  static async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
      // 0. Enforce Server-Side Registration Status
      const regStatus = await SystemService.isRegistrationOpen();
      if (!regStatus.isOpen) {
        return sendError(
          res,
          regStatus.message || SystemService.DEFAULT_CLOSED_MESSAGE,
          403
        );
      }

      if (!req.file) {
        return sendError(res, 'Resume file is required (PDF, DOC, or DOCX up to 5MB).', 400);
      }

      // Parse JSON arrays for skills and customSkills from multipart formData
      let parsedSkills: string[] = [];
      let parsedCustomSkills: string[] = [];

      try {
        if (typeof req.body.skills === 'string') {
          parsedSkills = JSON.parse(req.body.skills);
        } else if (Array.isArray(req.body.skills)) {
          parsedSkills = req.body.skills;
        }

        if (typeof req.body.customSkills === 'string') {
          parsedCustomSkills = JSON.parse(req.body.customSkills);
        } else if (Array.isArray(req.body.customSkills)) {
          parsedCustomSkills = req.body.customSkills;
        }
      } catch (e) {
        return sendError(res, 'Invalid skills format received.', 400);
      }

      const inputPayload = {
        fullName: req.body.fullName,
        mobile: req.body.mobile,
        email: req.body.email,
        course: req.body.course,
        year: req.body.year,
        universityName: req.body.universityName,
        skills: parsedSkills,
        customSkills: parsedCustomSkills,
        motivation: req.body.motivation,
      };

      // Strict validation
      const validatedData = createApplicationSchema.parse(inputPayload);

      // Save resume to persistent storage
      const storedFile = await StorageService.saveResume(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

      // Create application in database
      const application = await ApplicationService.createApplication(
        validatedData,
        storedFile,
        ip
      );

      // Generate secure slip access token
      const slipToken = ApplicationController.generateSlipToken(
        application.applicationId,
        application.id
      );

      return sendSuccess(
        res,
        {
          applicationId: application.applicationId,
          id: application.id,
          fullName: application.fullName,
          email: application.email,
          mobile: application.mobile,
          course: application.course.replace('_', '.'),
          year: application.year.replace('_', ' ').replace('YEAR', 'Year'),
          universityName: application.universityName,
          skills: application.skills,
          customSkills: application.customSkills,
          motivation: application.motivation,
          resumeFilename: application.resumeFilename,
          status: application.status,
          createdAt: application.createdAt,
          slipToken,
        },
        'Application submitted successfully! Please download your registration slip.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates and downloads the A4 Registration Slip PDF (Protected by Admin Auth or Candidate Slip Token)
   */
  static async downloadRegistrationSlip(req: Request, res: Response, next: NextFunction) {
    try {
      const idOrAppId = req.params.idOrAppId as string;
      if (!idOrAppId || idOrAppId.trim() === '') {
        return sendError(res, 'Application identifier is required', 400);
      }

      const trimmedId = idOrAppId.trim();

      // 1. Upfront Server-Side Authorization Check: Check Admin session or token matching requested identifier
      const hasInitialAccess = ApplicationController.verifyAccess(req, trimmedId);

      if (!hasInitialAccess) {
        return sendError(
          res,
          'Access denied. Valid registration session token or administrator credentials required to download registration slip.',
          403
        );
      }

      // 2. Fetch record from database
      const application = await ApplicationService.getByIdOrAppId(trimmedId);

      if (!application) {
        return sendError(res, 'Application record not found.', 404);
      }

      // 3. Re-verify access against resolved database record identifiers
      const isAuthorized =
        ApplicationController.verifyAccess(req, application.applicationId) ||
        ApplicationController.verifyAccess(req, application.id);

      if (!isAuthorized) {
        return sendError(
          res,
          'Access denied. Token does not match requested application record.',
          403
        );
      }

      const pdfBuffer = await PDFService.generateRegistrationSlip({
        applicationId: application.applicationId,
        fullName: application.fullName,
        mobile: application.mobile,
        email: application.email,
        course: application.course,
        year: application.year,
        universityName: application.universityName,
        skills: application.skills,
        customSkills: application.customSkills,
        motivation: application.motivation,
        resumeFilename: application.resumeFilename,
        status: application.status,
        createdAt: application.createdAt,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Alwar_Police_Cyber_Internship_${application.applicationId}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.end(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves full application details (Protected by Admin Auth or Candidate Slip Token)
   */
  static async getApplicationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const idOrAppId = req.params.idOrAppId as string;
      if (!idOrAppId || idOrAppId.trim() === '') {
        return sendError(res, 'Application identifier is required', 400);
      }

      const trimmedId = idOrAppId.trim();

      // 1. Upfront Server-Side Authorization Check
      const hasInitialAccess = ApplicationController.verifyAccess(req, trimmedId);

      if (!hasInitialAccess) {
        return sendError(
          res,
          'Access denied. Candidate personal information is protected. Administrator credentials or valid registration session required.',
          403
        );
      }

      // 2. Fetch record from database
      const application = await ApplicationService.getByIdOrAppId(trimmedId);

      if (!application) {
        return sendError(res, 'Application record not found.', 404);
      }

      // 3. Re-verify access against resolved database record identifiers
      const isAuthorized =
        ApplicationController.verifyAccess(req, application.applicationId) ||
        ApplicationController.verifyAccess(req, application.id);

      if (!isAuthorized) {
        return sendError(
          res,
          'Access denied. Token does not match requested application record.',
          403
        );
      }

      return sendSuccess(res, {
        applicationId: application.applicationId,
        id: application.id,
        fullName: application.fullName,
        email: application.email,
        mobile: application.mobile,
        course: application.course.replace('_', '.'),
        year: application.year.replace('_', ' ').replace('YEAR', 'Year'),
        universityName: application.universityName,
        skills: application.skills,
        customSkills: application.customSkills,
        motivation: application.motivation,
        resumeFilename: application.resumeFilename,
        status: application.status,
        createdAt: application.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Serves/streams resume file securely (Strictly Admin Protected)
   */
  static async getResume(req: Request, res: Response, next: NextFunction) {
    try {
      const rawParam = req.params.filename as string;
      if (!rawParam || rawParam.trim() === '') {
        return sendError(res, 'Resume identifier is required', 400);
      }

      // Path traversal defense
      const sanitizedParam = path.basename(rawParam.trim());

      // 1. Attempt to find application by ID, Application ID, or filename
      let application = await ApplicationService.getByIdOrAppId(sanitizedParam);
      if (!application) {
        application = await ApplicationService.getByResumeUrl(sanitizedParam);
      }

      let fileData: { buffer: Buffer; mimeType: string } | null = null;
      let displayFilename = sanitizedParam;

      if (application) {
        displayFilename = application.resumeFilename || `${application.applicationId}_Resume.pdf`;
        fileData = await StorageService.getResumeBuffer(
          application.resumeUrl,
          application.resumeFilename
        );
      }

      // 2. Fallback filesystem lookup if not resolved via application record
      if (!fileData) {
        fileData = await StorageService.getResumeBuffer(sanitizedParam);
      }

      // 3. If file cannot be found, return a generic safe 404 without leaking candidate PII
      if (!fileData) {
        return res.status(404).json({
          success: false,
          message: 'Resume document is unavailable for this registration record.',
        });
      }

      res.setHeader('Content-Type', fileData.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(displayFilename)}"`);
      res.setHeader('Content-Length', fileData.buffer.length);
      return res.end(fileData.buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public endpoint to check if student registrations are currently open
   */
  static async getPublicRegistrationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await SystemService.isRegistrationOpen();
      return sendSuccess(res, status);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Secure public endpoint to verify Application ID and return official WhatsApp group invite URL
   * Strictly avoids leaking student PII (name, email, mobile, marks, university, etc.)
   */
  static async verifyWhatsAppApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const ipAddress =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const rawAppId = req.body?.applicationId ?? req.query?.applicationId;

      if (!rawAppId || typeof rawAppId !== 'string' || rawAppId.trim() === '') {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Application ID could not be verified. Please check your Application ID and try again.',
        });
      }

      // Safe normalization & sanitization
      const cleanAppId = rawAppId.trim().toUpperCase();

      // Format sanity check: alphanumeric and standard hyphens/underscores only, between 3 and 50 chars
      if (cleanAppId.length < 3 || cleanAppId.length > 50 || !/^[A-Z0-9_-]+$/.test(cleanAppId)) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Application ID could not be verified. Please check your Application ID and try again.',
        });
      }

      // Query database for existing application without selecting PII
      const application = await prisma.application.findFirst({
        where: {
          OR: [
            { applicationId: cleanAppId },
            { id: cleanAppId },
          ],
        },
        select: {
          id: true,
          applicationId: true,
        },
      });

      if (!application) {
        // Record failed attempt in audit log without storing sensitive data
        await AuditService.log({
          action: 'WHATSAPP_APPLICATION_VERIFICATION',
          details: `Failed verification attempt for query: ${cleanAppId.slice(0, 15)}...`,
          ipAddress,
          userAgent,
        });

        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Application ID could not be verified. Please check your Application ID and try again.',
        });
      }

      // Record successful verification in audit log
      await AuditService.log({
        applicationId: application.id,
        action: 'WHATSAPP_APPLICATION_VERIFICATION',
        details: 'Application successfully verified for WhatsApp group access.',
        ipAddress,
        userAgent,
      });

      // Return strictly the verification status and official WhatsApp link (No PII)
      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Application verified successfully.',
        whatsappGroupUrl: ENV.WHATSAPP_GROUP_URL,
        data: {
          verified: true,
          message: 'Application verified successfully.',
          whatsappGroupUrl: ENV.WHATSAPP_GROUP_URL,
        },
      });
    } catch (error) {
      console.error('⚠️ WhatsApp Verification Error:', error);
      return res.status(500).json({
        success: false,
        verified: false,
        message: 'An unexpected server error occurred during verification. Please try again.',
      });
    }
  }
}


