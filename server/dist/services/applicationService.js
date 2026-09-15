"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationService = void 0;
const db_js_1 = require("../config/db.js");
const idGenerator_js_1 = require("../utils/idGenerator.js");
const client_1 = require("@prisma/client");
class ApplicationService {
    /**
     * Maps client string representation of Course to Prisma Enum
     */
    static mapCourse(course) {
        if (course === 'B.Tech')
            return client_1.CourseType.B_TECH;
        if (course === 'MCA')
            return client_1.CourseType.MCA;
        return client_1.CourseType.BCA;
    }
    /**
     * Maps client string representation of Year to Prisma Enum
     */
    static mapYear(year) {
        if (year === '2nd Year')
            return client_1.AcademicYear.YEAR_2;
        if (year === '3rd Year')
            return client_1.AcademicYear.YEAR_3;
        if (year === '4th Year')
            return client_1.AcademicYear.YEAR_4;
        return client_1.AcademicYear.YEAR_2;
    }
    /**
     * Creates a new internship application with duplicate checks
     */
    static async createApplication(input, fileInfo, ipAddress) {
        // 1. Check for duplicate registration by email or mobile
        const existing = await db_js_1.prisma.application.findFirst({
            where: {
                OR: [
                    { email: input.email.toLowerCase().trim() },
                    { mobile: input.mobile.trim() },
                ],
            },
        });
        if (existing) {
            const field = existing.email === input.email.toLowerCase().trim() ? 'email address' : 'mobile number';
            throw new Error(`An application has already been registered using this ${field}.`);
        }
        // 2. Generate unique Application ID
        const applicationId = await (0, idGenerator_js_1.generateApplicationId)();
        // 3. Create record in database
        const application = await db_js_1.prisma.application.create({
            data: {
                applicationId,
                fullName: input.fullName.trim(),
                mobile: input.mobile.trim(),
                email: input.email.toLowerCase().trim(),
                course: this.mapCourse(input.course),
                year: this.mapYear(input.year),
                universityName: input.universityName.trim(),
                skills: input.skills,
                customSkills: input.customSkills || [],
                motivation: input.motivation.trim(),
                resumeFilename: fileInfo.originalFilename,
                resumeUrl: fileInfo.savedFilename,
                resumeMimeType: fileInfo.mimeType,
                resumeSize: fileInfo.size,
                status: client_1.ApplicationStatus.SUBMITTED,
                ipAddress: ipAddress || null,
            },
        });
        return application;
    }
    /**
     * Retrieves application by ID or Application ID
     */
    static async getByIdOrAppId(idOrAppId) {
        return db_js_1.prisma.application.findFirst({
            where: {
                OR: [{ id: idOrAppId }, { applicationId: idOrAppId }],
            },
        });
    }
    /**
     * Retrieves public verification details (safe non-sensitive fields only)
     */
    static async getVerificationDetails(applicationId) {
        const app = await db_js_1.prisma.application.findUnique({
            where: { applicationId },
            select: {
                applicationId: true,
                fullName: true,
                course: true,
                year: true,
                status: true,
                createdAt: true,
            },
        });
        return app;
    }
    /**
     * Queries applications with search, multi-filters, and pagination
     */
    static async queryApplications(params) {
        const { page = 1, limit = 20, search, course, year, status, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc', } = params;
        const skip = (page - 1) * limit;
        const where = {};
        // Search filter across Name, App ID, Email, Mobile, University
        if (search && search.trim() !== '') {
            const q = search.trim();
            where.OR = [
                { fullName: { contains: q, mode: 'insensitive' } },
                { applicationId: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
                { mobile: { contains: q } },
                { universityName: { contains: q, mode: 'insensitive' } },
            ];
        }
        // Course filter
        if (course && course !== 'ALL') {
            where.course = course;
        }
        // Year filter
        if (year && year !== 'ALL') {
            where.year = year;
        }
        // Status filter
        if (status && status !== 'ALL') {
            where.status = status;
        }
        // Date Range filter
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                // Set to end of the day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }
        // Order by mapping
        const orderBy = {
            [sortBy]: sortOrder,
        };
        const [applications, total] = await Promise.all([
            db_js_1.prisma.application.findMany({
                where,
                skip,
                take: limit,
                orderBy,
            }),
            db_js_1.prisma.application.count({ where }),
        ]);
        return {
            applications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Fetches applications matching filters without pagination for export
     */
    static async getApplicationsForExport(params) {
        const { search, course, year, status, startDate, endDate } = params;
        const where = {};
        if (search && search.trim() !== '') {
            const q = search.trim();
            where.OR = [
                { fullName: { contains: q, mode: 'insensitive' } },
                { applicationId: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
                { mobile: { contains: q } },
                { universityName: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (course && course !== 'ALL')
            where.course = course;
        if (year && year !== 'ALL')
            where.year = year;
        if (status && status !== 'ALL')
            where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }
        return db_js_1.prisma.application.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Updates application status
     */
    static async updateStatus(id, status, remarks) {
        return db_js_1.prisma.application.update({
            where: { id },
            data: {
                status,
                statusRemarks: remarks || null,
            },
        });
    }
    /**
     * Calculates comprehensive dashboard statistics and chart analytics
     */
    static async getDashboardStats() {
        const [total, submitted, underReview, shortlisted, selected, rejected, bcaCount, btechCount, mcaCount, year2Count, year3Count, year4Count, recentApplications,] = await Promise.all([
            db_js_1.prisma.application.count(),
            db_js_1.prisma.application.count({ where: { status: client_1.ApplicationStatus.SUBMITTED } }),
            db_js_1.prisma.application.count({ where: { status: client_1.ApplicationStatus.UNDER_REVIEW } }),
            db_js_1.prisma.application.count({ where: { status: client_1.ApplicationStatus.SHORTLISTED } }),
            db_js_1.prisma.application.count({ where: { status: client_1.ApplicationStatus.SELECTED } }),
            db_js_1.prisma.application.count({ where: { status: client_1.ApplicationStatus.REJECTED } }),
            db_js_1.prisma.application.count({ where: { course: client_1.CourseType.BCA } }),
            db_js_1.prisma.application.count({ where: { course: client_1.CourseType.B_TECH } }),
            db_js_1.prisma.application.count({ where: { course: client_1.CourseType.MCA } }),
            db_js_1.prisma.application.count({ where: { year: client_1.AcademicYear.YEAR_2 } }),
            db_js_1.prisma.application.count({ where: { year: client_1.AcademicYear.YEAR_3 } }),
            db_js_1.prisma.application.count({ where: { year: client_1.AcademicYear.YEAR_4 } }),
            db_js_1.prisma.application.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    applicationId: true,
                    fullName: true,
                    course: true,
                    year: true,
                    status: true,
                    createdAt: true,
                },
            }),
        ]);
        // Calculate top cyber security skills
        const allApps = await db_js_1.prisma.application.findMany({
            select: { skills: true, customSkills: true },
        });
        const skillCounts = {};
        for (const app of allApps) {
            for (const skill of [...app.skills, ...app.customSkills]) {
                const s = skill.trim();
                skillCounts[s] = (skillCounts[s] || 0) + 1;
            }
        }
        const topSkills = Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));
        // Registration timeline (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const recentTrend = await db_js_1.prisma.application.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true },
        });
        const dailyTrendsMap = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const key = d.toISOString().split('T')[0];
            dailyTrendsMap[key] = 0;
        }
        for (const app of recentTrend) {
            const key = app.createdAt.toISOString().split('T')[0];
            if (dailyTrendsMap[key] !== undefined) {
                dailyTrendsMap[key]++;
            }
        }
        const registrationTrend = Object.entries(dailyTrendsMap).map(([date, count]) => ({
            date,
            count,
        }));
        return {
            overview: {
                total,
                submitted,
                underReview,
                shortlisted,
                selected,
                rejected,
            },
            courseDistribution: [
                { name: 'BCA', count: bcaCount },
                { name: 'B.Tech', count: btechCount },
                { name: 'MCA', count: mcaCount },
            ],
            yearDistribution: [
                { name: '2nd Year', count: year2Count },
                { name: '3rd Year', count: year3Count },
                { name: '4th Year', count: year4Count },
            ],
            statusDistribution: [
                { name: 'Submitted', count: submitted, color: '#3B82F6' },
                { name: 'Under Review', count: underReview, color: '#F59E0B' },
                { name: 'Shortlisted', count: shortlisted, color: '#8B5CF6' },
                { name: 'Selected', count: selected, color: '#10B981' },
                { name: 'Rejected', count: rejected, color: '#EF4444' },
            ],
            topSkills,
            registrationTrend,
            recentApplications,
        };
    }
}
exports.ApplicationService = ApplicationService;
