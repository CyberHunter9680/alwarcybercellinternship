"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const XLSX = __importStar(require("xlsx"));
class ExportService {
    /**
     * Formats applications into clean tabular rows for export
     */
    static formatApplications(applications) {
        return applications.map((app) => ({
            'Application ID': app.applicationId,
            'Full Name': app.fullName,
            'Mobile Number': app.mobile,
            'Email Address': app.email,
            'Course': app.course.replace('_', '.'),
            'Academic Year': app.year.replace('_', ' ').replace('YEAR', 'Year'),
            'University / College': app.universityName,
            'Predefined Skills': app.skills.join(', '),
            'Custom Skills': app.customSkills.join(', '),
            'Statement of Motivation': app.motivation,
            'Resume Filename': app.resumeFilename,
            'Current Status': app.status.replace('_', ' '),
            'Status Remarks': app.statusRemarks || '',
            'Registration Date': new Date(app.createdAt).toISOString(),
        }));
    }
    /**
     * Generates CSV buffer
     */
    static generateCSV(applications) {
        const data = this.formatApplications(applications);
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);
        return Buffer.from(csvContent, 'utf-8');
    }
    /**
     * Generates XLSX buffer with formatted columns
     */
    static generateXLSX(applications) {
        const data = this.formatApplications(applications);
        const worksheet = XLSX.utils.json_to_sheet(data);
        // Auto-fit column widths
        const columnWidths = [
            { wch: 18 }, // Application ID
            { wch: 22 }, // Full Name
            { wch: 14 }, // Mobile
            { wch: 26 }, // Email
            { wch: 10 }, // Course
            { wch: 12 }, // Year
            { wch: 32 }, // University
            { wch: 35 }, // Skills
            { wch: 25 }, // Custom Skills
            { wch: 50 }, // Motivation
            { wch: 22 }, // Resume Filename
            { wch: 15 }, // Status
            { wch: 25 }, // Remarks
            { wch: 22 }, // Registration Date
        ];
        worksheet['!cols'] = columnWidths;
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');
        const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return xlsxBuffer;
    }
}
exports.ExportService = ExportService;
