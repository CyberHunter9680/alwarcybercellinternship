import { prisma } from '../config/db.js';
import { generateApplicationId } from '../utils/idGenerator.js';
import { CreateApplicationInput } from '../validators/applicationValidator.js';
import { StoredFileInfo } from './storageService.js';
import { CourseType, AcademicYear, ApplicationStatus, Prisma } from '@prisma/client';

export class ApplicationService {
  /**
   * Maps client string representation of Course to Prisma Enum
   */
  static mapCourse(course: string): CourseType {
    if (course === 'B.Tech') return CourseType.B_TECH;
    if (course === 'MCA') return CourseType.MCA;
    return CourseType.BCA;
  }

  /**
   * Maps client string representation of Year to Prisma Enum
   */
  static mapYear(year: string): AcademicYear {
    if (year === '2nd Year') return AcademicYear.YEAR_2;
    if (year === '3rd Year') return AcademicYear.YEAR_3;
    if (year === '4th Year') return AcademicYear.YEAR_4;
    return AcademicYear.YEAR_2;
  }

  /**
   * Creates a new internship application with duplicate checks
   */
  static async createApplication(
    input: CreateApplicationInput,
    fileInfo: StoredFileInfo,
    ipAddress?: string
  ) {
    // 1. Check for duplicate registration by email or mobile
    const existing = await prisma.application.findFirst({
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
    const applicationId = await generateApplicationId();

    // 3. Create record in database
    const application = await prisma.application.create({
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
        status: ApplicationStatus.SUBMITTED,
        ipAddress: ipAddress || null,
      },
    });

    return application;
  }

  /**
   * Retrieves application by ID or Application ID
   */
  static async getByIdOrAppId(idOrAppId: string) {
    return prisma.application.findFirst({
      where: {
        OR: [{ id: idOrAppId }, { applicationId: idOrAppId }],
      },
    });
  }

  /**
   * Retrieves public verification details (safe non-sensitive fields only)
   */
  static async getVerificationDetails(applicationId: string) {
    const app = await prisma.application.findUnique({
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
  static async queryApplications(params: {
    page: number;
    limit: number;
    search?: string;
    course?: string;
    year?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      course,
      year,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.ApplicationWhereInput = {};

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
      where.course = course as CourseType;
    }

    // Year filter
    if (year && year !== 'ALL') {
      where.year = year as AcademicYear;
    }

    // Status filter
    if (status && status !== 'ALL') {
      where.status = status as ApplicationStatus;
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
    const orderBy: Prisma.ApplicationOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.application.count({ where }),
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
  static async getApplicationsForExport(params: {
    search?: string;
    course?: string;
    year?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { search, course, year, status, startDate, endDate } = params;
    const where: Prisma.ApplicationWhereInput = {};

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

    if (course && course !== 'ALL') where.course = course as CourseType;
    if (year && year !== 'ALL') where.year = year as AcademicYear;
    if (status && status !== 'ALL') where.status = status as ApplicationStatus;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    return prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Updates application status
   */
  static async updateStatus(id: string, status: ApplicationStatus, remarks?: string) {
    return prisma.application.update({
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
    const [
      total,
      submitted,
      underReview,
      shortlisted,
      selected,
      rejected,
      bcaCount,
      btechCount,
      mcaCount,
      year2Count,
      year3Count,
      year4Count,
      recentApplications,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: ApplicationStatus.SUBMITTED } }),
      prisma.application.count({ where: { status: ApplicationStatus.UNDER_REVIEW } }),
      prisma.application.count({ where: { status: ApplicationStatus.SHORTLISTED } }),
      prisma.application.count({ where: { status: ApplicationStatus.SELECTED } }),
      prisma.application.count({ where: { status: ApplicationStatus.REJECTED } }),
      prisma.application.count({ where: { course: CourseType.BCA } }),
      prisma.application.count({ where: { course: CourseType.B_TECH } }),
      prisma.application.count({ where: { course: CourseType.MCA } }),
      prisma.application.count({ where: { year: AcademicYear.YEAR_2 } }),
      prisma.application.count({ where: { year: AcademicYear.YEAR_3 } }),
      prisma.application.count({ where: { year: AcademicYear.YEAR_4 } }),
      prisma.application.findMany({
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
    const allApps = await prisma.application.findMany({
      select: { skills: true, customSkills: true },
    });

    const skillCounts: Record<string, number> = {};
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

    const recentTrend = await prisma.application.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });

    const dailyTrendsMap: Record<string, number> = {};
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
