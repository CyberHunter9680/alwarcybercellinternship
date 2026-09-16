import * as XLSX from 'xlsx';
import { Application } from '@prisma/client';

export class ExportService {
  /**
   * Formats applications into clean tabular rows for export
   */
  private static formatApplications(applications: Application[]) {
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
  static generateCSV(applications: Application[]): Buffer {
    const data = this.formatApplications(applications);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    return Buffer.from(csvContent, 'utf-8');
  }

  /**
   * Generates XLSX buffer with formatted columns
   */
  static generateXLSX(applications: Application[]): Buffer {
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
    return xlsxBuffer as Buffer;
  }
}
