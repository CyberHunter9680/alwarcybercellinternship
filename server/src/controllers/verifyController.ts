import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from '../services/applicationService.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export class VerifyController {
  /**
   * Safe public verification endpoint for QR code scanner and public verification page
   */
  static async verifyApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const applicationId = req.params.applicationId as string;

      if (!applicationId || applicationId.trim() === '') {
        return sendError(res, 'Application ID is required for verification.', 400);
      }

      const verified = await ApplicationService.getVerificationDetails(applicationId.trim());

      if (!verified) {
        return sendError(
          res,
          `Application ID "${applicationId}" was not found in the official Alwar Police Internship database. Please verify the number.`,
          404
        );
      }

      return sendSuccess(
        res,
        {
          applicationId: verified.applicationId,
          applicantName: verified.fullName,
          course: verified.course.replace('_', '.'),
          year: verified.year.replace('_', ' ').replace('YEAR', 'Year'),
          status: verified.status.replace('_', ' '),
          registrationDate: verified.createdAt,
          verified: true,
          verificationMessage:
            'This record is officially verified and registered in the Alwar Police Cyber Security Internship 2026 portal database.',
        },
        'Application verified successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}
