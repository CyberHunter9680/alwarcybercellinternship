"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.applicationQuerySchema = exports.adminLoginSchema = void 0;
const zod_1 = require("zod");
exports.adminLoginSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: 'Admin email is required' })
        .trim()
        .toLowerCase()
        .email('Please enter a valid email address'),
    password: zod_1.z
        .string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters'),
});
exports.applicationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().trim().optional(),
    course: zod_1.z.enum(['BCA', 'B_TECH', 'MCA', 'ALL']).optional().default('ALL'),
    year: zod_1.z.enum(['YEAR_2', 'YEAR_3', 'YEAR_4', 'ALL']).optional().default('ALL'),
    status: zod_1.z.enum(['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'ALL']).optional().default('ALL'),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'fullName', 'applicationId', 'status']).optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string({ required_error: 'Current password is required' }),
    newPassword: zod_1.z
        .string({ required_error: 'New password is required' })
        .min(8, 'New password must be at least 8 characters')
        .max(100, 'New password is too long'),
});
