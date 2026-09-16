import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  ExternalLink,
  Shield,
  User,
  GraduationCap,
  Calendar,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import {
  getAdminApplications,
  updateApplicationStatusApi,
  exportApplicationsFile,
  downloadRegistrationSlipPDF,
} from '../../services/api.js';
import { Application, ApplicationStatus, PaginationMeta } from '../../types/index.js';
import { CyberBadge } from '../../components/CyberBadge.js';
import { ConfirmModal } from '../../components/ConfirmModal.js';
import { RegistrationSlipPDF } from '../../components/RegistrationSlipPDF.js';
import { useToast } from '../../context/ToastContext.js';

export const AdminApplications: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [course, setCourse] = useState(searchParams.get('course') || 'ALL');
  const [year, setYear] = useState(searchParams.get('year') || 'ALL');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);

  // Modal states
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [slipModalOpen, setSlipModalOpen] = useState(false);

  // Status Change State
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('SUBMITTED');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAdminApplications({
        page,
        limit,
        search: search.trim() || undefined,
        course: course !== 'ALL' ? course : undefined,
        year: year !== 'ALL' ? year : undefined,
        status: status !== 'ALL' ? status : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setApplications(result.applications);
      setMeta(result.meta);
    } catch (err: any) {
      toast.error('Failed to load applications: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, course, year, status, startDate, endDate, toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCourse('ALL');
    setYear('ALL');
    setStatus('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setIsExporting(true);
      const blob = await exportApplicationsFile(format, {
        search: search.trim() || undefined,
        course: course !== 'ALL' ? course : undefined,
        year: year !== 'ALL' ? year : undefined,
        status: status !== 'ALL' ? status : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Alwar_Police_Cyber_Applications_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exported matching applications to ${format.toUpperCase()}.`);
    } catch (err: any) {
      toast.error('Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const openStatusChange = (app: Application) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusRemarks(app.statusRemarks || '');
    setStatusModalOpen(true);
  };

  const submitStatusChange = async () => {
    if (!selectedApp) return;

    try {
      setIsUpdatingStatus(true);
      const updated = await updateApplicationStatusApi(selectedApp.id, {
        status: newStatus,
        remarks: statusRemarks.trim() || undefined,
      });

      // Update in local state
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, status: updated.status, statusRemarks: updated.statusRemarks } : a))
      );

      if (selectedApp.id === updated.id) {
        setSelectedApp({ ...selectedApp, status: updated.status, statusRemarks: updated.statusRemarks });
      }

      toast.success(`Application ${selectedApp.applicationId} status updated to ${newStatus}.`);
      setStatusModalOpen(false);
    } catch (err: any) {
      toast.error('Status update failed: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDownloadSlip = async (app: Application) => {
    try {
      const blob = await downloadRegistrationSlipPDF(app.applicationId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Alwar_Police_Cyber_Internship_${app.applicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Registration Slip downloaded.');
    } catch (err: any) {
      toast.error('Download failed: ' + err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-police-900 tracking-tight">
            Application Management
          </h1>
          <p className="text-xs text-slate-500">
            Search, filter, evaluate dossiers and process status updates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={isExporting}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Export XLSX (Excel)</span>
          </button>
          <button
            onClick={fetchApplications}
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name, Application ID, Email, Mobile or University..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-police-700 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-police-900 hover:bg-police-950 text-white font-bold text-xs rounded-xl transition-colors shadow-xs shrink-0"
          >
            Search Applications
          </button>
        </form>

        {/* Multi-Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Course Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Course</label>
            <select
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 font-medium focus:ring-1 focus:ring-police-700 focus:outline-hidden"
            >
              <option value="ALL">All Courses</option>
              <option value="BCA">BCA</option>
              <option value="B_TECH">B.Tech</option>
              <option value="MCA">MCA</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 font-medium focus:ring-1 focus:ring-police-700 focus:outline-hidden"
            >
              <option value="ALL">All Years</option>
              <option value="YEAR_2">2nd Year</option>
              <option value="YEAR_3">3rd Year</option>
              <option value="YEAR_4">4th Year</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 font-medium focus:ring-1 focus:ring-police-700 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 focus:ring-1 focus:ring-police-700 focus:outline-hidden"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">To Date</label>
            <div className="flex gap-1.5">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 focus:ring-1 focus:ring-police-700 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-900 text-xs bg-slate-200 hover:bg-slate-300 rounded-lg shrink-0 font-medium"
                title="Reset all filters"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs">
          <div className="font-semibold text-slate-700">
            Showing <strong className="text-police-900 font-mono">{applications.length}</strong> of{' '}
            <strong className="text-police-900 font-mono">{meta.total}</strong> total applications
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="p-1 rounded border border-slate-300 bg-white text-xs font-semibold"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-police-700 animate-spin" />
              <p className="text-xs text-slate-500">Fetching matching records...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">No applications matched your search criteria.</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">App ID</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Contact (Email / Mobile)</th>
                  <th className="py-3.5 px-4">Course & Year</th>
                  <th className="py-3.5 px-4">University</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-police-900 whitespace-nowrap">
                      {app.applicationId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {app.fullName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-[11px] text-slate-800">{app.email}</div>
                      <div className="font-mono text-[11px] text-slate-500">{app.mobile}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      <span className="font-bold">{app.course.replace('_', '.')}</span> •{' '}
                      {app.year.replace('_', ' ').replace('YEAR', 'Year')}
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-600" title={app.universityName}>
                      {app.universityName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <CyberBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Dossier */}
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setDossierModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-police-100 text-police-800 hover:text-police-900 transition-colors"
                          title="View Application Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Status Change */}
                        <button
                          onClick={() => openStatusChange(app)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-amber-800 transition-colors"
                          title="Change Application Status"
                        >
                          <Layers className="w-4 h-4" />
                        </button>

                        {/* Download Slip */}
                        <button
                          onClick={() => handleDownloadSlip(app)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-emerald-800 transition-colors"
                          title="Download Official Registration Slip PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Download Resume */}
                        <a
                          href={`/api/applications/resume/${app.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-100 text-cyan-800 transition-colors"
                          title="View Uploaded Resume"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Server-side Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-500">
            Page <strong className="text-slate-900 font-mono">{meta.page}</strong> of{' '}
            <strong className="text-slate-900 font-mono">{meta.totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={meta.page <= 1 || isLoading}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold disabled:opacity-40 flex items-center gap-1 hover:bg-slate-100"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
              disabled={meta.page >= meta.totalPages || isLoading}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold disabled:opacity-40 flex items-center gap-1 hover:bg-slate-100"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: APPLICATION DOSSIER VIEW */}
      {dossierModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-police-900 bg-police-100 px-2 py-0.5 rounded">
                    {selectedApp.applicationId}
                  </span>
                  <CyberBadge status={selectedApp.status} size="sm" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{selectedApp.fullName}</h2>
              </div>
              <button
                onClick={() => setDossierModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Content */}
            <div className="space-y-4 text-xs">
              {/* Personal & Academic Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Mobile Number:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedApp.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email Address:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedApp.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Course & Year:</span>
                  <span className="font-bold text-slate-900">
                    {selectedApp.course.replace('_', '.')} • {selectedApp.year.replace('_', ' ').replace('YEAR', 'Year')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">University / Institution:</span>
                  <span className="font-semibold text-slate-900">{selectedApp.universityName}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <span className="text-slate-700 font-bold uppercase tracking-wider block">
                  Cyber Security Skills ({selectedApp.skills.length + selectedApp.customSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {[...selectedApp.skills, ...selectedApp.customSkills].map((s, idx) => (
                    <span key={idx} className="bg-white px-2.5 py-1 rounded border border-slate-300 font-medium text-slate-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Motivation */}
              <div className="space-y-1.5">
                <span className="text-slate-700 font-bold uppercase tracking-wider block">
                  Statement of Motivation:
                </span>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 italic text-slate-700 leading-relaxed">
                  "{selectedApp.motivation}"
                </div>
              </div>

              {/* Resume File */}
              <div className="space-y-1.5">
                <span className="text-slate-700 font-bold uppercase tracking-wider block">
                  Resume Attachment:
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-police-700" />
                    <span className="font-semibold text-slate-900">{selectedApp.resumeFilename}</span>
                  </div>
                  <a
                    href={`/api/applications/resume/${selectedApp.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-police-800 hover:bg-police-900 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <span>View Resume</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Remarks if any */}
              {selectedApp.statusRemarks && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                  <span className="font-bold block">Internal Officer Remarks:</span>
                  <p>{selectedApp.statusRemarks}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setDossierModalOpen(false);
                  openStatusChange(selectedApp);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Layers className="w-4 h-4" />
                <span>Change Status</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadSlip(selectedApp)}
                  className="px-4 py-2 bg-police-800 hover:bg-police-900 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Slip PDF</span>
                </button>
                <button
                  onClick={() => setDossierModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: STATUS CHANGE WORKFLOW */}
      {statusModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Status Transition</span>
                <h3 className="text-base font-bold text-slate-900">{selectedApp.applicationId}</h3>
                <p className="text-xs text-slate-600">{selectedApp.fullName}</p>
              </div>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Select New Application Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-bold text-police-900 focus:ring-2 focus:ring-police-700 focus:outline-hidden"
                >
                  <option value="SUBMITTED">Submitted (Initial Triage)</option>
                  <option value="UNDER_REVIEW">Under Review (Technical Evaluation)</option>
                  <option value="SHORTLISTED">Shortlisted (Interview Eligible)</option>
                  <option value="SELECTED">Selected (Final Internship Intake)</option>
                  <option value="REJECTED">Rejected (Not Eligible / Disqualified)</option>
                </select>
              </div>

              {/* Remarks Textarea */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Internal Officer Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="e.g. Cleared technical interview round with 85% score in forensics."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-police-700 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
              <button
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={submitStatusChange}
                disabled={isUpdatingStatus}
                className="px-5 py-2 text-xs font-bold text-white bg-police-900 hover:bg-police-950 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Application Status</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
