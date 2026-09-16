import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Award,
  GraduationCap,
  Layers,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { getAdminDashboardStats, exportApplicationsFile } from '../../services/api.js';
import { DashboardStats } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

const STATUS_COLORS = {
  Submitted: '#3B82F6',
  'Under Review': '#F59E0B',
  Shortlisted: '#8B5CF6',
  Selected: '#10B981',
  Rejected: '#EF4444',
};

export const AdminReports: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (err: any) {
      toast.error('Failed to load report analytics: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setIsExporting(true);
      const blob = await exportApplicationsFile(format, {});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Alwar_Police_Cyber_Internship_Full_Report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Complete data report exported to ${format.toUpperCase()}.`);
    } catch (err: any) {
      toast.error('Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-police-700 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Generating analytical reports...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-police-900 tracking-tight">
            Comprehensive Analytical Reports
          </h1>
          <p className="text-xs text-slate-500">
            Export official reports and evaluate demographic, technical & skill distributions.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV Dataset</span>
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={isExporting}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Export Full Excel (XLSX)</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Total Registrations</span>
          <div className="text-3xl font-black text-police-900 font-mono">{stats.overview.total}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-emerald-600">Selected Interns</span>
          <div className="text-3xl font-black text-emerald-900 font-mono">{stats.overview.selected}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-purple-600">Shortlisted for Review</span>
          <div className="text-3xl font-black text-purple-900 font-mono">{stats.overview.shortlisted}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-amber-600">Pending Evaluation</span>
          <div className="text-3xl font-black text-amber-900 font-mono">
            {stats.overview.submitted + stats.overview.underReview}
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-police-700" />
            Registrations by Course
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.courseDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1E3E62" radius={[6, 6, 0, 0]} name="Applicants" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Year Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-police-700" />
            Registrations by Academic Year
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.yearDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#00A8E8" radius={[6, 6, 0, 0]} name="Applicants" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Skills Table & Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-police-700" />
          Cyber Security Skills Popularity Breakdown
        </h3>
        <p className="text-xs text-slate-500">
          Distribution of student competencies across major cybersecurity domains.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {stats.topSkills.map((s, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-2"
            >
              <span className="text-xs font-bold text-slate-800 leading-tight">{s.name}</span>
              <span className="text-sm font-mono font-black text-police-900 bg-white px-2 py-0.5 rounded border self-start">
                {s.count} students
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
