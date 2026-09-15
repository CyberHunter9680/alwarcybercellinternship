"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusSchema = exports.createApplicationSchema = exports.PREDEFINED_SKILLS = exports.VALID_YEARS = exports.VALID_COURSES = void 0;
const zod_1 = require("zod");
exports.VALID_COURSES = ['BCA', 'B.Tech', 'MCA'];
exports.VALID_YEARS = ['2nd Year', '3rd Year', '4th Year'];
exports.PREDEFINED_SKILLS = [
    'Cyber Security',
    'Ethical Hacking',
    'Penetration Testing',
    'Web Application Security',
    'Network Security',
    'Digital Forensics',
    'Cyber Forensics',
    'OSINT',
    'Incident Response',
    'Malware Analysis',
    'SOC',
    'SIEM',
    'Vulnerability Assessment',
    'VAPT',
    'Linux',
    'Python',
    'Networking',
    'Cryptography',
    'Threat Intelligence',
    'Cloud Security',
    'Mobile Security',
    'API Security',
    'Security Operations',
    'Bug Bounty',
    'Burp Suite',
    'Wireshark',
    'Metasploit',
    'Threat Hunting',
    'Reverse Engineering',
    'DFIR',
];
// Indian Mobile Number Regex (10 digits starting with 6, 7, 8, or 9)
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
exports.createApplicationSchema = zod_1.z.object({
    fullName: zod_1.z
        .string({ required_error: 'Full name is required' })
        .trim()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name must not exceed 100 characters'),
    mobile: zod_1.z
        .string({ required_error: 'Mobile number is required' })
        .trim()
        .regex(INDIAN_MOBILE_REGEX, 'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)'),
    email: zod_1.z
        .string({ required_error: 'Email address is required' })
        .trim()
        .toLowerCase()
        .email('Please enter a valid email address')
        .max(150, 'Email address is too long'),
    course: zod_1.z
        .enum(exports.VALID_COURSES, {
        errorMap: () => ({ message: 'Eligible courses are strictly BCA, B.Tech, or MCA only' }),
    }),
    year: zod_1.z
        .enum(exports.VALID_YEARS, {
        errorMap: () => ({ message: 'Eligible years are strictly 2nd Year, 3rd Year, or 4th Year only' }),
    }),
    universityName: zod_1.z
        .string({ required_error: 'University / College Name is required' })
        .trim()
        .min(3, 'University / College name must be at least 3 characters')
        .max(250, 'University / College name must not exceed 250 characters'),
    skills: zod_1.z
        .array(zod_1.z.string().trim())
        .min(1, 'Please select at least one cyber security skill')
        .max(30, 'Too many skills selected'),
    customSkills: zod_1.z
        .array(zod_1.z
        .string()
        .trim()
        .min(2, 'Custom skill must be at least 2 characters')
        .max(60, 'Custom skill must not exceed 60 characters'))
        .optional()
        .default([]),
    motivation: zod_1.z
        .string({ required_error: 'Internship motivation statement is required' })
        .trim()
        .min(50, 'Motivation statement must be at least 50 characters')
        .max(1000, 'Motivation statement must not exceed 1000 characters'),
});
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'SELECTED', 'REJECTED'], {
        required_error: 'Status is required',
    }),
    remarks: zod_1.z.string().trim().max(500, 'Remarks cannot exceed 500 characters').optional(),
});
