export type CourseType = 'BCA' | 'B.Tech' | 'MCA';
export type AcademicYear = '2nd Year' | '3rd Year' | '4th Year';

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'SELECTED'
  | 'REJECTED';

export interface Application {
  id: string;
  applicationId: string;
  fullName: string;
  mobile: string;
  email: string;
  course: CourseType;
  year: AcademicYear;
  universityName: string;
  skills: string[];
  customSkills: string[];
  motivation: string;
  resumeFilename: string;
  resumeUrl: string;
  status: ApplicationStatus;
  statusRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationData {
  applicationId: string;
  applicantName: string;
  course: string;
  year: string;
  status: string;
  registrationDate: string;
  verified: boolean;
  verificationMessage: string;
}

export interface RegistrationFormData {
  fullName: string;
  mobile: string;
  email: string;
  course: CourseType | '';
  year: AcademicYear | '';
  universityName: string;
  skills: string[];
  customSkills: string[];
  motivation: string;
  resumeFile: File | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  overview: {
    total: number;
    submitted: number;
    underReview: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  };
  courseDistribution: { name: string; count: number }[];
  yearDistribution: { name: string; count: number }[];
  statusDistribution: { name: string; count: number; color: string }[];
  topSkills: { name: string; count: number }[];
  registrationTrend: { date: string; count: number }[];
  recentApplications: {
    id: string;
    applicationId: string;
    fullName: string;
    course: string;
    year: string;
    status: ApplicationStatus;
    createdAt: string;
  }[];
}

export interface AuditLogItem {
  id: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  application?: {
    id: string;
    applicationId: string;
    fullName: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
