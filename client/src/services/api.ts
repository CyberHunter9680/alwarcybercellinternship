import axios from 'axios';
import {
  Application,
  VerificationData,
  DashboardStats,
  AuditLogItem,
  PaginationMeta,
} from '../types/index.js';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for clear error message extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    return Promise.reject(new Error(message));
  }
);

/* =========================================================
   PUBLIC STUDENT APPLICATION APIS
========================================================= */

export async function submitStudentApplication(formData: FormData): Promise<{
  applicationId: string;
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  course: string;
  year: string;
  status: string;
  createdAt: string;
  slipToken?: string;
  universityName?: string;
  skills?: string[];
  customSkills?: string[];
  motivation?: string;
  resumeFilename?: string;
}> {
  const response = await api.post('/applications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
}

export async function getApplicationDetails(
  idOrAppId: string,
  slipToken?: string
): Promise<Application> {
  const response = await api.get(`/applications/${idOrAppId}`, {
    params: slipToken ? { token: slipToken } : {},
    headers: slipToken ? { 'x-slip-token': slipToken } : {},
  });
  return response.data.data;
}

export async function downloadRegistrationSlipPDF(
  idOrAppId: string,
  slipToken?: string
): Promise<Blob> {
  const response = await axios.get(`/api/applications/${idOrAppId}/registration-slip`, {
    params: slipToken ? { token: slipToken } : {},
    headers: slipToken ? { 'x-slip-token': slipToken } : {},
    responseType: 'blob',
    withCredentials: true,
  });
  return response.data;
}


export async function verifyApplicationPublic(
  applicationId: string
): Promise<VerificationData> {
  const response = await api.get(`/verify/${applicationId}`);
  return response.data.data;
}

/* =========================================================
   ADMIN PORTAL APIS
========================================================= */

export async function adminLogin(credentials: { email: string; password: string }) {
  const response = await api.post('/admin/login', credentials);
  return response.data.data;
}

export async function adminLogout() {
  const response = await api.post('/admin/logout');
  return response.data;
}

export async function getAdminProfile() {
  const response = await api.get('/admin/me');
  return response.data.data;
}

export async function changeAdminPasswordApi(payload: { currentPassword: string; newPassword: string }) {
  const response = await api.patch('/admin/change-password', payload);
  return response.data;
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const response = await api.get('/admin/dashboard/stats');
  return response.data.data;
}

export interface QueryApplicationsParams {
  page?: number;
  limit?: number;
  search?: string;
  course?: string;
  year?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getAdminApplications(
  params: QueryApplicationsParams
): Promise<{ applications: Application[]; meta: PaginationMeta }> {
  const response = await api.get('/admin/applications', { params });
  return {
    applications: response.data.data,
    meta: response.data.meta,
  };
}

export async function getAdminApplicationById(id: string): Promise<Application> {
  const response = await api.get(`/admin/applications/${id}`);
  return response.data.data;
}

export async function updateApplicationStatusApi(
  id: string,
  payload: { status: string; remarks?: string }
): Promise<Application> {
  const response = await api.patch(`/admin/applications/${id}/status`, payload);
  return response.data.data;
}

export async function exportApplicationsFile(
  format: 'csv' | 'xlsx',
  filters: Partial<QueryApplicationsParams>
): Promise<Blob> {
  const response = await axios.get('/api/admin/export', {
    params: { ...filters, format },
    responseType: 'blob',
    withCredentials: true,
  });
  return response.data;
}

export async function getAdminAuditLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
}): Promise<{ logs: AuditLogItem[]; meta: PaginationMeta }> {
  const response = await api.get('/admin/audit-logs', { params });
  return {
    logs: response.data.data,
    meta: response.data.meta,
  };
}

export async function getPublicRegistrationStatus(): Promise<{ isOpen: boolean; message: string }> {
  const response = await api.get('/system/registration-status');
  return response.data.data;
}

export async function getAdminRegistrationStatus(): Promise<{ isOpen: boolean; message: string }> {
  const response = await api.get('/admin/system/registration-status');
  return response.data.data;
}

export async function setAdminRegistrationStatus(payload: {
  isOpen: boolean;
  message?: string;
  reason?: string;
}): Promise<{ isOpen: boolean; message: string }> {
  const response = await api.post('/admin/system/registration-status', payload);
  return response.data.data;
}

export async function deleteApplicationApi(
  id: string,
  reason?: string
): Promise<{ deletedApplicationId: string; fullName: string }> {
  const response = await api.delete(`/admin/applications/${id}`, {
    data: { reason },
    params: { reason },
  });
  return response.data.data;
}

export default api;
