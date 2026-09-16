import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z
    .string({ required_error: 'Admin email is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
});

export const applicationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  course: z.enum(['BCA', 'B_TECH', 'MCA', 'ALL']).optional().default('ALL'),
  year: z.enum(['YEAR_2', 'YEAR_3', 'YEAR_4', 'ALL']).optional().default('ALL'),
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'ALL']).optional().default('ALL'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['createdAt', 'fullName', 'applicationId', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ApplicationQueryParams = z.infer<typeof applicationQuerySchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required' }),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'New password is too long'),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
