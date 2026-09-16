import { Request, Response, NextFunction } from 'express';
import { createApplicationSchema } from '../validators/applicationValidator.js';
import { ApplicationService } from '../services/applicationService.js';
import { StorageService } from '../services/storageService.js';
import { PDFService } from '../services/pdfService.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export class ApplicationController {
  /**
   * Submits a student registration application
   */
  static async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
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
          status: application.status,
          createdAt: application.createdAt,
        },
        'Application submitted successfully! Please download your registration slip.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates and downloads the A4 Registration Slip PDF
   */
  static async downloadRegistrationSlip(req: Request, res: Response, next: NextFunction) {
    try {
      const idOrAppId = req.params.idOrAppId as string;
      const application = await ApplicationService.getByIdOrAppId(idOrAppId);

      if (!application) {
        return sendError(res, 'Application not found', 404);
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
   * Retrieves application details
   */
  static async getApplicationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const idOrAppId = req.params.idOrAppId as string;
      const application = await ApplicationService.getByIdOrAppId(idOrAppId);

      if (!application) {
        return sendError(res, 'Application not found', 404);
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
   * Serves/streams resume file securely
   */
  static async getResume(req: Request, res: Response, next: NextFunction) {
    try {
      const filename = req.params.filename as string;
      const fileData = await StorageService.getResumeBuffer(filename);

      if (!fileData) {
        return sendError(res, 'Resume file not found', 404);
      }

      res.setHeader('Content-Type', fileData.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.end(fileData.buffer);
    } catch (error) {
      next(error);
    }
  }
}
