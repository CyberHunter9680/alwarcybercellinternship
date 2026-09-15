"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const qrcode_1 = __importDefault(require("qrcode"));
const env_js_1 = require("../config/env.js");
class PDFService {
    /**
     * Generates a high-quality A4 Registration Slip PDF stream/buffer
     */
    static async generateRegistrationSlip(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({
                    size: 'A4',
                    margin: 40,
                    info: {
                        Title: `Registration Slip - ${data.applicationId}`,
                        Author: 'Alwar Police Cyber Security Internship Programme',
                        Subject: 'Application Acknowledgement Slip',
                        Keywords: 'Alwar Police, Cyber Security, Internship 2026, Registration Slip',
                    },
                });
                const buffers = [];
                doc.on('data', (chunk) => buffers.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', (err) => reject(err));
                // Generate QR code as buffer
                const verifyUrl = `${env_js_1.ENV.PUBLIC_APP_URL}/verify/${data.applicationId}`;
                const qrCodeDataUrl = await qrcode_1.default.toDataURL(verifyUrl, {
                    errorCorrectionLevel: 'M',
                    margin: 1,
                    width: 110,
                    color: {
                        dark: '#0B192C',
                        light: '#FFFFFF',
                    },
                });
                const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
                // Layout constants
                const pageWidth = 595.28; // A4 width in pt
                const leftMargin = 40;
                const contentWidth = pageWidth - leftMargin * 2; // 515.28 pt
                // --- Outer Border ---
                doc
                    .rect(20, 20, pageWidth - 40, 802)
                    .lineWidth(1)
                    .strokeColor('#CBD5E1')
                    .stroke();
                doc
                    .rect(24, 24, pageWidth - 48, 794)
                    .lineWidth(0.5)
                    .strokeColor('#E2E8F0')
                    .stroke();
                // --- Header Banner ---
                doc
                    .rect(24, 24, pageWidth - 48, 80)
                    .fillColor('#0B192C')
                    .fill();
                // Header Text
                doc
                    .fillColor('#FFFFFF')
                    .fontSize(16)
                    .font('Helvetica-Bold')
                    .text('ALWAR POLICE', leftMargin, 34, { align: 'center', width: contentWidth });
                doc
                    .fontSize(12)
                    .font('Helvetica-Bold')
                    .fillColor('#00A8E8')
                    .text('INTERNSHIP PROGRAMME 2026', leftMargin, 55, { align: 'center', width: contentWidth });
                doc
                    .fontSize(9)
                    .font('Helvetica')
                    .fillColor('#E2E8F0')
                    .text('CYBER SECURITY INTERNSHIP PROGRAMME • OFFICIAL REGISTRATION ACKNOWLEDGEMENT', leftMargin, 74, {
                    align: 'center',
                    width: contentWidth,
                });
                let yPos = 120;
                // --- Application ID & QR Code Header Strip ---
                doc
                    .rect(leftMargin, yPos, contentWidth, 75)
                    .fillColor('#F8FAFC')
                    .strokeColor('#E2E8F0')
                    .lineWidth(1)
                    .fillAndStroke();
                // Left info block
                doc
                    .fontSize(9)
                    .font('Helvetica-Bold')
                    .fillColor('#64748B')
                    .text('APPLICATION ID', leftMargin + 15, yPos + 12);
                doc
                    .fontSize(15)
                    .font('Helvetica-Bold')
                    .fillColor('#0B192C')
                    .text(data.applicationId, leftMargin + 15, yPos + 26);
                const formattedDate = new Date(data.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
                doc
                    .fontSize(8.5)
                    .font('Helvetica')
                    .fillColor('#475569')
                    .text(`Submission Timestamp: ${formattedDate}`, leftMargin + 15, yPos + 50);
                // Status Badge inside strip
                const statusBadgeWidth = 90;
                const statusBadgeX = contentWidth - 160;
                doc
                    .roundedRect(statusBadgeX, yPos + 14, statusBadgeWidth, 22, 4)
                    .fillColor('#ECFDF5')
                    .strokeColor('#A7F3D0')
                    .lineWidth(1)
                    .fillAndStroke();
                doc
                    .fontSize(8.5)
                    .font('Helvetica-Bold')
                    .fillColor('#065F46')
                    .text(`STATUS: ${data.status.replace('_', ' ')}`, statusBadgeX, yPos + 20, {
                    width: statusBadgeWidth,
                    align: 'center',
                });
                // Embed QR Code
                doc.image(qrBuffer, leftMargin + contentWidth - 65, yPos + 6, { width: 62 });
                yPos += 90;
                // --- Helper function for Section Headers ---
                const drawSectionHeader = (title, y) => {
                    doc
                        .rect(leftMargin, y, contentWidth, 20)
                        .fillColor('#1E3E62')
                        .fill();
                    doc
                        .fontSize(9)
                        .font('Helvetica-Bold')
                        .fillColor('#FFFFFF')
                        .text(title.toUpperCase(), leftMargin + 10, y + 5);
                    return y + 24;
                };
                // --- 1. APPLICANT DETAILS ---
                yPos = drawSectionHeader('1. Applicant Details', yPos);
                const drawTwoColumnRow = (label1, val1, label2, val2, y, isEven) => {
                    const rowHeight = 22;
                    const colWidth = contentWidth / 2;
                    if (isEven) {
                        doc.rect(leftMargin, y, contentWidth, rowHeight).fillColor('#F8FAFC').fill();
                    }
                    doc.rect(leftMargin, y, contentWidth, rowHeight).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
                    // Col 1
                    doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748B').text(label1, leftMargin + 8, y + 6);
                    doc.fontSize(8.5).font('Helvetica').fillColor('#0F172A').text(val1, leftMargin + 110, y + 6, { width: 140, ellipsis: true });
                    // Col 2
                    doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748B').text(label2, leftMargin + colWidth + 8, y + 6);
                    doc.fontSize(8.5).font('Helvetica').fillColor('#0F172A').text(val2, leftMargin + colWidth + 110, y + 6, { width: 140, ellipsis: true });
                    return y + rowHeight;
                };
                yPos = drawTwoColumnRow('Full Name:', data.fullName, 'Mobile Number:', data.mobile, yPos, false);
                yPos = drawTwoColumnRow('Email Address:', data.email, 'Verification:', 'Authenticated', yPos, true);
                yPos += 8;
                // --- 2. ACADEMIC DETAILS ---
                yPos = drawSectionHeader('2. Academic Details', yPos);
                yPos = drawTwoColumnRow('Course / Degree:', data.course.replace('_', '.'), 'Academic Year:', data.year.replace('_', ' ').replace('YEAR', 'Year'), yPos, false);
                // University row (full width)
                doc.rect(leftMargin, yPos, contentWidth, 22).fillColor('#F8FAFC').fill();
                doc.rect(leftMargin, yPos, contentWidth, 22).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
                doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748B').text('University / College:', leftMargin + 8, yPos + 6);
                doc.fontSize(8.5).font('Helvetica').fillColor('#0F172A').text(data.universityName, leftMargin + 110, yPos + 6, { width: 390, ellipsis: true });
                yPos += 30;
                // --- 3. CYBER SECURITY SKILLS ---
                yPos = drawSectionHeader('3. Cyber Security Skills & Competencies', yPos);
                const allSkills = [...data.skills, ...data.customSkills];
                const skillsText = allSkills.length > 0 ? allSkills.join('  •  ') : 'None specified';
                doc.rect(leftMargin, yPos, contentWidth, 38).fillColor('#F8FAFC').strokeColor('#E2E8F0').lineWidth(0.5).fillAndStroke();
                doc.fontSize(8.5).font('Helvetica').fillColor('#0F172A').text(skillsText, leftMargin + 10, yPos + 7, {
                    width: contentWidth - 20,
                    lineGap: 3,
                });
                yPos += 46;
                // --- 4. INTERNSHIP MOTIVATION ---
                yPos = drawSectionHeader('4. Statement of Motivation', yPos);
                const trimmedMotivation = data.motivation.length > 350
                    ? `${data.motivation.slice(0, 350)}...`
                    : data.motivation;
                doc.rect(leftMargin, yPos, contentWidth, 62).fillColor('#F8FAFC').strokeColor('#E2E8F0').lineWidth(0.5).fillAndStroke();
                doc.fontSize(8).font('Helvetica-Oblique').fillColor('#334155').text(`"${trimmedMotivation}"`, leftMargin + 10, yPos + 7, {
                    width: contentWidth - 20,
                    lineGap: 2,
                });
                yPos += 70;
                // --- 5. RESUME & ENCLOSURE STATUS ---
                yPos = drawSectionHeader('5. Uploaded Documents & Enclosures', yPos);
                yPos = drawTwoColumnRow('Resume / CV Attached:', 'Yes (Verified)', 'Original Filename:', data.resumeFilename || 'resume.pdf', yPos, false);
                yPos += 14;
                // --- IMPORTANT DECLARATION & FOOTER ---
                const footerY = 700;
                doc
                    .rect(leftMargin, footerY, contentWidth, 75)
                    .fillColor('#F1F5F9')
                    .strokeColor('#CBD5E1')
                    .lineWidth(1)
                    .fillAndStroke();
                doc
                    .fontSize(8)
                    .font('Helvetica-Bold')
                    .fillColor('#0B192C')
                    .text('IMPORTANT INSTRUCTIONS & ACKNOWLEDGEMENT NOTE:', leftMargin + 10, footerY + 8);
                doc
                    .fontSize(7.5)
                    .font('Helvetica')
                    .fillColor('#475569')
                    .text('1. This registration slip is an official electronic acknowledgement of your application submission for the Alwar Police Internship Programme 2026.\n' +
                    '2. Application submission does NOT guarantee final selection. Applications will undergo rigorous technical evaluation & background verification.\n' +
                    '3. Shortlisted candidates will be notified via their registered email address and mobile number.\n' +
                    '4. Scan the QR code above or visit the official portal with your Application ID to verify the live status of your application.', leftMargin + 10, footerY + 22, { width: contentWidth - 20, lineGap: 1.5 });
                // Security Bottom Bar
                const genTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
                doc
                    .fontSize(7)
                    .font('Helvetica')
                    .fillColor('#94A3B8')
                    .text(`System Generated • App ID: ${data.applicationId} • Generated on: ${genTime} IST • Alwar Police Cyber Cell`, leftMargin, 785, {
                    align: 'center',
                    width: contentWidth,
                });
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.PDFService = PDFService;
