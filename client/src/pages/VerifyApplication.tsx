import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  GraduationCap,
  Clock,
  Loader2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { verifyApplicationPublic } from '../services/api.js';
import { VerificationData } from '../types/index.js';
import { CyberBadge } from '../components/CyberBadge.js';

export const VerifyApplication: React.FC = () => {
  const { applicationId } = useParams<{ applicationId?: string }>();
  const navigate = useNavigate();

  const [inputAppId, setInputAppId] = useState(applicationId || '');
  const [data, setData] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchVerification = async (id: string) => {
    if (!id || id.trim() === '' || id === 'check') return;

    setIsLoading(true);
    setErrorMessage(null);
    setData(null);

    try {
      const result = await verifyApplicationPublic(id.trim());
      setData(result);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          `Application ID "${id}" could not be verified. Please check the spelling.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId && applicationId !== 'check') {
      setInputAppId(applicationId);
      fetchVerification(applicationId);
    }
  }, [applicationId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAppId.trim()) return;
    navigate(`/verify/${inputAppId.trim()}`);
    fetchVerification(inputAppId.trim());
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl space-y-8">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-police-100 text-police-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-police-700" />
          <span>Alwar Police Internship Programme 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-police-900 tracking-tight">
          Application Verification Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Verify genuine registration status and validity of student applications.
        </p>
      </div>

      {/* Verification Query Input */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputAppId}
              onChange={(e) => setInputAppId(e.target.value)}
              placeholder="Enter Application ID (e.g. APCSIP2026-000001)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-police-700 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputAppId.trim()}
            className="px-6 py-3 bg-police-800 hover:bg-police-900 text-white font-bold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify</span>}
          </button>
        </form>
        <p className="text-[11px] text-slate-500">
          Tip: You can scan the QR code printed on the official Registration Slip to reach this page instantly.
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <Loader2 className="w-8 h-8 text-police-700 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">
            Querying official Alwar Police Cyber Internship database...
          </p>
        </div>
      )}

      {/* Error state */}
      {errorMessage && !isLoading && (
        <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 space-y-3 text-center">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold">Verification Failed</h3>
            <p className="text-xs text-rose-700 leading-relaxed">{errorMessage}</p>
          </div>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 hover:text-rose-950 underline"
            >
              <span>Submit a new application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Verified Application Dossier Card */}
      {data && !isLoading && (
        <div className="bg-white rounded-2xl border border-emerald-300 shadow-lg p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Top Banner */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Official Verification Record
                </span>
                <h2 className="text-lg font-bold text-slate-900">Application Verified</h2>
              </div>
            </div>
            <CyberBadge status={data.status} size="md" />
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-500 font-medium block">Application ID:</span>
              <span className="font-mono font-bold text-sm text-police-900 block">
                {data.applicationId}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-500 font-medium block">Applicant Name:</span>
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-police-600" />
                {data.applicantName}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-500 font-medium block">Academic Course:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-police-600" />
                {data.course}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-500 font-medium block">Year of Study:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-police-600" />
                {data.year}
              </span>
            </div>

            <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Registration Date:{' '}
                  <strong>
                    {new Date(data.registrationDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                </span>
              </div>
              <span className="text-emerald-700 font-semibold">Active Record</span>
            </div>
          </div>

          {/* Privacy & Security Note */}
          <div className="p-4 rounded-xl bg-police-50 border border-police-200 text-xs text-police-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-police-900">
              <Lock className="w-3.5 h-3.5 text-police-700" />
              <span>Privacy-Protected Verification</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              This page verifies that the application ID exists in the internship registration system. Confidential personal information (such as contact numbers, email, motivation statements, and resumes) is strictly withheld for student privacy and security.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
