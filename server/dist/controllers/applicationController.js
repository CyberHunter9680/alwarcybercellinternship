"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const applicationValidator_js_1 = require("../validators/applicationValidator.js");
const applicationService_js_1 = require("../services/applicationService.js");
const storageService_js_1 = require("../services/storageService.js");
const pdfService_js_1 = require("../services/pdfService.js");
const adminService_js_1 = require("../services/adminService.js");
const responseHelper_js_1 = require("../utils/responseHelper.js");
const env_js_1 = require("../config/env.js");
class ApplicationController {
    /**
     * Generates a signed, tamper-proof token allowing the student to access their own slip
     */
    static generateSlipToken(applicationId, id) {
        const payload = {
            applicationId,
            id,
            type: 'slip_access',
        };
        return jsonwebtoken_1.default.sign(payload, env_js_1.ENV.AUTH_SECRET, { expiresIn: '7d' });
    }
    /**
     * Helper to verify if the request is authorized either as an Admin or with a valid candidate Slip Token
     */
    static verifyAccess(req, targetApplicationIdOrId) {
        // 1. Check if caller is an authenticated Admin (via cookie or Bearer header)
        let adminToken = req.cookies?.admin_token;
        if (!adminToken && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                adminToken = parts[1];
            }
        }
        if (adminToken) {
            const adminPayload = adminService_js_1.AdminService.verifyToken(adminToken);
            if (adminPayload) {
                return true; // Admin has authorized access
            }
        }
        // 2. Check candidate slip token from query param or header
        const token = req.query.token || req.headers['x-slip-token'];
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, env_js_1.ENV.AUTH_SECRET);
                if (decoded &&
                    decoded.type === 'slip_access' &&
                    (decoded.applicationId === targetApplicationIdOrId || decoded.id === targetApplicationIdOrId)) {
                    return true; // Candidate is authorized for their specific application
                }
            }
            catch {
                // Token invalid or expired
            }
        }
        return false;
    }
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
            // Generate secure slip access token
            const slipToken = ApplicationController.generateSlipToken(application.applicationId, application.id);
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
                slipToken,
            }, 'Application submitted successfully! Please download your registration slip.', 201);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Generates and downloads the A4 Registration Slip PDF (Protected by Admin Auth or Candidate Slip Token)
     */
    static async downloadRegistrationSlip(req, res, next) {
        try {
            const idOrAppId = req.params.idOrAppId;
            if (!idOrAppId || idOrAppId.trim() === '') {
                return (0, responseHelper_js_1.sendError)(res, 'Application identifier is required', 400);
            }
            const trimmedId = idOrAppId.trim();
            // 1. Upfront Server-Side Authorization Check: Check Admin session or token matching requested identifier
            const hasInitialAccess = ApplicationController.verifyAccess(req, trimmedId);
            if (!hasInitialAccess) {
                return (0, responseHelper_js_1.sendError)(res, 'Access denied. Valid registration session token or administrator credentials required to download registration slip.', 403);
            }
            // 2. Fetch record from database
            const application = await applicationService_js_1.ApplicationService.getByIdOrAppId(trimmedId);
            if (!application) {
                return (0, responseHelper_js_1.sendError)(res, 'Application record not found.', 404);
            }
            // 3. Re-verify access against resolved database record identifiers
            const isAuthorized = ApplicationController.verifyAccess(req, application.applicationId) ||
                ApplicationController.verifyAccess(req, application.id);
            if (!isAuthorized) {
                return (0, responseHelper_js_1.sendError)(res, 'Access denied. Token does not match requested application record.', 403);
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
     * Retrieves full application details (Protected by Admin Auth or Candidate Slip Token)
     */
    static async getApplicationDetails(req, res, next) {
        try {
            const idOrAppId = req.params.idOrAppId;
            if (!idOrAppId || idOrAppId.trim() === '') {
                return (0, responseHelper_js_1.sendError)(res, 'Application identifier is required', 400);
            }
            const trimmedId = idOrAppId.trim();
            // 1. Upfront Server-Side Authorization Check
            const hasInitialAccess = ApplicationController.verifyAccess(req, trimmedId);
            if (!hasInitialAccess) {
                return (0, responseHelper_js_1.sendError)(res, 'Access denied. Candidate personal information is protected. Administrator credentials or valid registration session required.', 403);
            }
            // 2. Fetch record from database
            const application = await applicationService_js_1.ApplicationService.getByIdOrAppId(trimmedId);
            if (!application) {
                return (0, responseHelper_js_1.sendError)(res, 'Application record not found.', 404);
            }
            // 3. Re-verify access against resolved database record identifiers
            const isAuthorized = ApplicationController.verifyAccess(req, application.applicationId) ||
                ApplicationController.verifyAccess(req, application.id);
            if (!isAuthorized) {
                return (0, responseHelper_js_1.sendError)(res, 'Access denied. Token does not match requested application record.', 403);
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
     * Serves/streams resume file securely (Strictly Admin Protected)
     */
    static async getResume(req, res, next) {
        try {
            const rawParam = req.params.filename;
            if (!rawParam || rawParam.trim() === '') {
                return (0, responseHelper_js_1.sendError)(res, 'Resume identifier is required', 400);
            }
            // Path traversal defense
            const sanitizedParam = path_1.default.basename(rawParam.trim());
            // 1. Attempt to find application by ID, Application ID, or filename
            let application = await applicationService_js_1.ApplicationService.getByIdOrAppId(sanitizedParam);
            if (!application) {
                application = await applicationService_js_1.ApplicationService.getByResumeUrl(sanitizedParam);
            }
            let fileData = null;
            let displayFilename = sanitizedParam;
            if (application) {
                displayFilename = application.resumeFilename || `${application.applicationId}_Resume.pdf`;
                fileData = await storageService_js_1.StorageService.getResumeBuffer(application.resumeUrl, application.resumeFilename);
            }
            // 2. Fallback filesystem lookup if not resolved via application record
            if (!fileData) {
                fileData = await storageService_js_1.StorageService.getResumeBuffer(sanitizedParam);
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
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ApplicationController = ApplicationController;
