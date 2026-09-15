"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyController = void 0;
const applicationService_js_1 = require("../services/applicationService.js");
const responseHelper_js_1 = require("../utils/responseHelper.js");
class VerifyController {
    /**
     * Safe public verification endpoint for QR code scanner and public verification page
     */
    static async verifyApplication(req, res, next) {
        try {
            const applicationId = req.params.applicationId;
            if (!applicationId || applicationId.trim() === '') {
                return (0, responseHelper_js_1.sendError)(res, 'Application ID is required for verification.', 400);
            }
            const verified = await applicationService_js_1.ApplicationService.getVerificationDetails(applicationId.trim());
            if (!verified) {
                return (0, responseHelper_js_1.sendError)(res, `Application ID "${applicationId}" was not found in the official Alwar Police Internship database. Please verify the number.`, 404);
            }
            return (0, responseHelper_js_1.sendSuccess)(res, {
                applicationId: verified.applicationId,
                applicantName: verified.fullName,
                course: verified.course.replace('_', '.'),
                year: verified.year.replace('_', ' ').replace('YEAR', 'Year'),
                status: verified.status.replace('_', ' '),
                registrationDate: verified.createdAt,
                verified: true,
                verificationMessage: 'This record is officially verified and registered in the Alwar Police Cyber Security Internship 2026 portal database.',
            }, 'Application verified successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.VerifyController = VerifyController;
