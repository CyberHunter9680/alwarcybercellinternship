import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle,
  Award,
  XCircle,
  FileSpreadsheet,
  TrendingUp,
  GraduationCap,
  Shield,
  Layers,
  ArrowRight,
  Loader2,
  RefreshCw,
  Lock,
  Key,
  Eye,
  EyeOff,
  X,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
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
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  getAdminDashboardStats,
  changeAdminPasswordApi,
  getAdminRegistrationStatus,
  setAdminRegistrationStatus,
} from '../../services/api.js';
import { DashboardStats } from '../../types/index.js';
import { CyberBadge } from '../../components/CyberBadge.js';
import { useToast } from '../../context/ToastContext.js';

const STATUS_COLORS = {
  Submitted: '#3B82F6',
  'Under Review': '#F59E0B',
  Shortlisted: '#8B5CF6',
  Selected: '#10B981',
  Rejected: '#EF4444',
};

const COURSE_COLORS = ['#00A8E8', '#1E3E62', '#0B192C'];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassField, setShowPassField] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Registration Control State
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [showRegStatusModal, setShowRegStatusModal] = useState(false);
  const [isUpdatingRegStatus, setIsUpdatingRegStatus] = useState(false);
  const [regStatusReason, setRegStatusReason] = useState('');

  const toast = useToast();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    try {
      setIsChangingPass(true);
      await changeAdminPasswordApi({ currentPassword, newPassword });
      toast.success('Admin password updated successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleToggleRegistration = async () => {
    const targetStatus = !isRegistrationOpen;
    try {
      setIsUpdatingRegStatus(true);
      const res = await setAdminRegistrationStatus({
        isOpen: targetStatus,
        reason: regStatusReason.trim() || undefined,
      });
      setIsRegistrationOpen(res.isOpen);
      setShowRegStatusModal(false);
      setRegStatusReason('');
      if (res.isOpen) {
        toast.success('Registration has been RESUMED successfully. Public applicants can now register.');
      } else {
        toast.warning('Registration has been STOPPED. Student registration form and APIs are now disabled.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update registration status');
    } finally {
      setIsUpdatingRegStatus(false);
    }
  };

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [statsData, regStatus] = await Promise.all([
        getAdminDashboardStats(),
        getAdminRegistrationStatus().catch(() => ({ isOpen: true, message: '' })),
      ]);
      setStats(statsData);
      setIsRegistrationOpen(regStatus.isOpen);
    } catch (err: any) {
      toast.error('Failed to load dashboard statistics: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-police-700 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading Portal Analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-slate-600">No dashboard data available.</p>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-police-800 text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const { overview, courseDistribution, yearDistribution, statusDistribution, topSkills, registrationTrend, recentApplications } = stats;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-police-600 bg-police-100 px-2.5 py-0.5 rounded-full">
              Live Control Center
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Alwar Police Cyber Cell</span>
            <span className="text-xs text-slate-400">•</span>
            {isRegistrationOpen ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                REGISTRATION: ACTIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                REGISTRATION: STOPPED
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-police-900 tracking-tight">
            Internship Programme Dashboard 2026
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Prominent Stop / Resume Registration Button */}
          {isRegistrationOpen ? (
            <button
              onClick={() => setShowRegStatusModal(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              title="Stop new student registrations"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Stop Registration</span>
            </button>
          ) : (
            <button
              onClick={() => setShowRegStatusModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              title="Resume student registrations"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Resume Registration</span>
            </button>
          )}

          <button
            onClick={() => setShowPasswordModal(true)}
            className="p-2.5 bg-white hover:bg-slate-100 text-police-900 rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Change Admin Password"
          >
            <Key className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Change Password</span>
          </button>
          <button
            onClick={loadStats}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <Link
            to="/admin/applications"
            className="px-4 py-2.5 bg-police-900 hover:bg-police-950 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-cyber-blue" />
            <span>Manage All Applications</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total</span>
            <div className="w-7 h-7 rounded-lg bg-police-100 text-police-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-police-900 font-mono">{overview.total}</div>
          <span className="text-[11px] text-slate-400">Total applicants</span>
        </div>

        {/* Submitted */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase">Submitted</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900 font-mono">{overview.submitted}</div>
          <span className="text-[11px] text-slate-400">Awaiting triage</span>
        </div>

        {/* Under Review */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase">Under Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono">{overview.underReview}</div>
          <span className="text-[11px] text-slate-400">Evaluation active</span>
        </div>

        {/* Shortlisted */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 uppercase">Shortlisted</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900 font-mono">{overview.shortlisted}</div>
          <span className="text-[11px] text-slate-400">Interview stage</span>
        </div>

        {/* Selected */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase">Selected</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 font-mono">{overview.selected}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Final intake</span>
        </div>

        {/* Rejected */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase">Rejected</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-900 font-mono">{overview.rejected}</div>
          <span className="text-[11px] text-slate-400">Ineligible / Not met</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Registration Trend (7-Day Timeline) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-police-700" />
                Registration Velocity (Recent Timeline)
              </h3>
              <p className="text-xs text-slate-500">Daily incoming student applications</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationTrend}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A8E8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00A8E8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#00A8E8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#trendGradient)"
                  name="Applications"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-police-700" />
              Application Status Distribution
            </h3>
            <p className="text-xs text-slate-500">Breakdown across evaluation stages</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {overview.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#94A3B8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No applications recorded yet.</p>
            )}
          </div>
        </div>

        {/* Chart 3: Course & Year Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-police-700" />
              Academic Stream Breakdown
            </h3>
            <p className="text-xs text-slate-500">Distribution across BCA, B.Tech, and MCA</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1E3E62" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Top In-Demand Cyber Security Skills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-police-700" />
              Top Cyber Security Proficiencies
            </h3>
            <p className="text-xs text-slate-500">Most declared technical capabilities by applicants</p>
          </div>
          <div className="h-64 w-full">
            {topSkills.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkills} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00A8E8" radius={[0, 6, 6, 0]} name="Proficiency Count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No skill metrics recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications Quick Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Registrations</h3>
            <p className="text-xs text-slate-500">Latest 5 submissions received</p>
          </div>
          <Link
            to="/admin/applications"
            className="text-xs text-police-700 hover:text-police-950 font-bold flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">App ID</th>
                <th className="py-3 px-4 font-bold">Applicant Name</th>
                <th className="py-3 px-4 font-bold">Course & Year</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Submitted Date</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentApplications && recentApplications.length > 0 ? (
                recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-police-900">
                      {app.applicationId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{app.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {app.course.replace('_', '.')} • {app.year.replace('_', ' ').replace('YEAR', 'Year')}
                    </td>
                    <td className="py-3.5 px-4">
                      <CyberBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/applications?search=${app.applicationId}`}
                        className="text-police-700 hover:text-police-950 font-bold underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No applications submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Change Admin Password</h3>
                  <p className="text-xs text-slate-500">Update your officer access credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4" autoComplete="off">
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassField ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-police-700 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassField(!showPassField)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassField ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  New Password (min 8 characters)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassField ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-police-700 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <CheckCircle className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassField ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-police-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="flex-1 py-2.5 bg-police-900 hover:bg-police-950 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isChangingPass ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATION TOGGLE CONFIRMATION MODAL */}
      {showRegStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className={`p-6 ${isRegistrationOpen ? 'bg-rose-50 border-b border-rose-100' : 'bg-emerald-50 border-b border-emerald-100'} flex items-start gap-4`}>
              <div className={`p-3 rounded-2xl shrink-0 ${isRegistrationOpen ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {isRegistrationOpen ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
              </div>
              <div className="space-y-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isRegistrationOpen ? 'text-rose-700' : 'text-emerald-700'}`}>
                  Admin System Control
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {isRegistrationOpen ? 'Confirm: Stop Public Registration' : 'Confirm: Resume Public Registration'}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-600">
              {isRegistrationOpen ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                    <div className="font-bold flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Immediate Effects of Stopping Registration:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-amber-800/90 font-medium">
                      <li>Public registration form on the portal will be disabled immediately.</li>
                      <li>Direct API registration requests will be rejected server-side (HTTP 403).</li>
                      <li>Public visitors will see the official "Registration Closed" notice.</li>
                      <li>Existing applications and verification links remain completely untouched.</li>
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Administrative Reason / Log Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={regStatusReason}
                      onChange={(e) => setRegStatusReason(e.target.value)}
                      placeholder="e.g. Target batch capacity reached (1,200 applicants)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                    <div className="font-bold flex items-center gap-2 text-emerald-800">
                      <CheckCircle className="w-4 h-4" />
                      <span>Immediate Effects of Resuming Registration:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-emerald-800/90 font-medium">
                      <li>Public registration form will become active for eligible candidates.</li>
                      <li>API will accept valid candidate submissions.</li>
                      <li>Application sequence numbering continues normally.</li>
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Administrative Reason / Log Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={regStatusReason}
                      onChange={(e) => setRegStatusReason(e.target.value)}
                      placeholder="e.g. Reopened for final spot verification"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRegStatusModal(false);
                  setRegStatusReason('');
                }}
                disabled={isUpdatingRegStatus}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-white border border-slate-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleRegistration}
                disabled={isUpdatingRegStatus}
                className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 ${
                  isRegistrationOpen
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20'
                }`}
              >
                {isUpdatingRegStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Applying Changes...</span>
                  </>
                ) : isRegistrationOpen ? (
                  <>
                    <PauseCircle className="w-4 h-4" />
                    <span>Stop Registration Now</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    <span>Resume Registration Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
