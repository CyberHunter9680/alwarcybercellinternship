import { z } from 'zod';

export const VALID_COURSES = ['BCA', 'B.Tech', 'MCA'] as const;
export const VALID_YEARS = ['2nd Year', '3rd Year', '4th Year'] as const;

export const PREDEFINED_SKILLS = [
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
] as const;

// Indian Mobile Number Regex (10 digits starting with 6, 7, 8, or 9)
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export const createApplicationSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),

  mobile: z
    .string({ required_error: 'Mobile number is required' })
    .trim()
    .regex(INDIAN_MOBILE_REGEX, 'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)'),

  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .max(150, 'Email address is too long'),

  course: z
    .enum(VALID_COURSES, {
      errorMap: () => ({ message: 'Eligible courses are strictly BCA, B.Tech, or MCA only' }),
    }),

  year: z
    .enum(VALID_YEARS, {
      errorMap: () => ({ message: 'Eligible years are strictly 2nd Year, 3rd Year, or 4th Year only' }),
    }),

  universityName: z
    .string({ required_error: 'University / College Name is required' })
    .trim()
    .min(3, 'University / College name must be at least 3 characters')
    .max(250, 'University / College name must not exceed 250 characters'),

  skills: z
    .array(z.string().trim())
    .min(1, 'Please select at least one cyber security skill')
    .max(30, 'Too many skills selected'),

  customSkills: z
    .array(
      z
        .string()
        .trim()
        .min(2, 'Custom skill must be at least 2 characters')
        .max(60, 'Custom skill must not exceed 60 characters')
    )
    .optional()
    .default([]),

  motivation: z
    .string({ required_error: 'Internship motivation statement is required' })
    .trim()
    .min(50, 'Motivation statement must be at least 50 characters')
    .max(1000, 'Motivation statement must not exceed 1000 characters'),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'SELECTED', 'REJECTED'], {
    required_error: 'Status is required',
  }),
  remarks: z.string().trim().max(500, 'Remarks cannot exceed 500 characters').optional(),
});

export const verifyWhatsAppSchema = z.object({
  applicationId: z
    .string({ required_error: 'Application ID is required' })
    .trim()
    .min(1, 'Application ID is required')
    .max(50, 'Application ID is too long'),
});

