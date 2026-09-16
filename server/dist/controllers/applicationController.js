"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const applicationValidator_js_1 = require("../validators/applicationValidator.js");
const applicationService_js_1 = require("../services/applicationService.js");
const storageService_js_1 = require("../services/storageService.js");
const pdfService_js_1 = require("../services/pdfService.js");
const responseHelper_js_1 = require("../utils/responseHelper.js");
class ApplicationController {
    /**
     * Submits a student registration application
     */
    static async submitApplication(req, res, next) {
        try {
            if (!req.file) {
                return (0, responseHelper_js_1.sendError)(res, 'Resume file is required (PDF, DOC, or DOCX up to 5MB).', 400);
            }
            // Parse JSON arrays for skills and customSkills from multipart formData
            let parsedSkills = [];
            let parsedCustomSkills = [];
            try {
                if (typeof req.body.skills === 'string') {
                    parsedSkills = JSON.parse(req.body.skills);
                }
                else if (Array.isArray(req.body.skills)) {
                    parsedSkills = req.body.skills;
                }
                if (typeof req.body.customSkills === 'string') {
                    parsedCustomSkills = JSON.parse(req.body.customSkills);
                }
                else if (Array.isArray(req.body.customSkills)) {
                    parsedCustomSkills = req.body.customSkills;
                }
            }
            catch (e) {
                return (0, responseHelper_js_1.sendError)(res, 'Invalid skills format received.', 400);
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
            const validatedData = applicationValidator_js_1.createApplicationSchema.parse(inputPayload);
            // Save resume to persistent storage
            const storedFile = await storageService_js_1.StorageService.saveResume(req.file.buffer, req.file.originalname, req.file.mimetype);
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
            // Create application in database
            const application = await applicationService_js_1.ApplicationService.createApplication(validatedData, storedFile, ip);
            return (0, responseHelper_js_1.sendSuccess)(res, {
                applicationId: application.applicationId,
                id: application.id,
                fullName: application.fullName,
                email: application.email,
                mobile: application.mobile,
                course: application.course.replace('_', '.'),
                year: application.year.replace('_', ' ').replace('YEAR', 'Year'),
                status: application.status,
                createdAt: application.createdAt,
            }, 'Application submitted successfully! Please download your registration slip.', 201);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Generates and downloads the A4 Registration Slip PDF
     */
    static async downloadRegistrationSlip(req, res, next) {
        try {
            const idOrAppId = req.params.idOrAppId;
            const application = await applicationService_js_1.ApplicationService.getByIdOrAppId(idOrAppId);
            if (!application) {
                return (0, responseHelper_js_1.sendError)(res, 'Application not found', 404);
            }
            const pdfBuffer = await pdfService_js_1.PDFService.generateRegistrationSlip({
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
            res.setHeader('Content-Disposition', `attachment; filename="Alwar_Police_Cyber_Internship_${application.applicationId}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            return res.end(pdfBuffer);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Retrieves application details
     */
    static async getApplicationDetails(req, res, next) {
        try {
            const idOrAppId = req.params.idOrAppId;
            const application = await applicationService_js_1.ApplicationService.getByIdOrAppId(idOrAppId);
            if (!application) {
                return (0, responseHelper_js_1.sendError)(res, 'Application not found', 404);
            }
            return (0, responseHelper_js_1.sendSuccess)(res, {
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
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Serves/streams resume file securely with database-backed & multi-path fallback
     */
    static async getResume(req, res, next) {
        try {
            const filenameOrId = req.params.filename;
            // 1. Attempt to find application by ID, Application ID, or filename
            let application = await applicationService_js_1.ApplicationService.getByIdOrAppId(filenameOrId);
            if (!application) {
                application = await applicationService_js_1.ApplicationService.getByResumeUrl(filenameOrId);
            }
            let fileData = null;
            let displayFilename = filenameOrId;
            if (application) {
                displayFilename = application.resumeFilename || `${application.applicationId}_Resume.pdf`;
                fileData = await storageService_js_1.StorageService.getResumeBuffer(application.resumeUrl, application.resumeFilename);
            }
            // 2. Direct filesystem lookup fallback if not resolved via application record
            if (!fileData) {
                fileData = await storageService_js_1.StorageService.getResumeBuffer(filenameOrId);
            }
            // 3. If file cannot be found
            if (!fileData) {
                if (application) {
                    return res.status(404).json({
                        success: false,
                        message: 'Resume document is unavailable for this registration. The candidate registration record is safe and intact in the database.',
                        data: {
                            applicationId: application.applicationId,
                            fullName: application.fullName,
                            resumeFilename: application.resumeFilename,
                            createdAt: application.createdAt,
                        },
                    });
                }
                return (0, responseHelper_js_1.sendError)(res, 'Resume file not found', 404);
            }
            res.setHeader('Content-Type', fileData.mimeType);
            res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(displayFilename)}"`);
            res.setHeader('Content-Length', fileData.buffer.length);
            return res.end(fileData.buffer);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ApplicationController = ApplicationController;
