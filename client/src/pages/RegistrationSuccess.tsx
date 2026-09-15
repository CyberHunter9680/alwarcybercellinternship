import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Download,
  Printer,
  Home,
  Shield,
  FileText,
  Calendar,
  User,
  GraduationCap,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import { RegistrationSlipPDF } from '../components/RegistrationSlipPDF.js';
import { getApplicationDetails, downloadRegistrationSlipPDF } from '../services/api.js';
import { Application } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';

export const RegistrationSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const state = location.state as {
    applicationId?: string;
    applicantName?: string;
    course?: string;
    year?: string;
    submissionDate?: string;
    email?: string;
    mobile?: string;
  } | null;

  const [application, setApplication] = useState<Application | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00A8E8', '#0B192C', '#10B981', '#F59E0B'],
      });
    } catch {
      // ignore
    }

    // If application details passed or id present, load full object
    const appId = state?.applicationId;
    if (appId) {
      getApplicationDetails(appId)
        .then((data) => setApplication(data))
        .catch(() => {
          // fallback to location state
        });
    }
  }, [state]);

  const handleDownloadSlip = async () => {
    const appId = state?.applicationId || application?.applicationId;
    if (!appId) return;

    try {
      setIsDownloading(true);
      const blob = await downloadRegistrationSlipPDF(appId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Alwar_Police_Cyber_Internship_${appId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Registration Slip PDF downloaded.');
    } catch (err: any) {
      toast.error('Failed to download PDF: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintSlip = () => {
    setShowSlipModal(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const appId = state?.applicationId || application?.applicationId || 'APCSIP2026-000001';
  const applicantName = state?.applicantName || application?.fullName || 'Registered Applicant';
  const course = state?.course || application?.course || 'MCA';
  const year = state?.year || application?.year || '3rd Year';
  const formattedDate = new Date(state?.submissionDate || application?.createdAt || new Date()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Success Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center space-y-8 relative overflow-hidden">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-police-700 via-cyber-blue to-emerald-500"></div>

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto shadow-inner text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Confirmation Text */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Registration Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-police-900 tracking-tight">
            Registration Successful!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Congratulations! Your application has been successfully submitted for the{' '}
            <strong>Alwar Police Internship Programme 2026</strong>.
          </p>
        </div>

        {/* Application ID Highlight Box */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-inner">
          <span className="text-xs uppercase text-police-300 font-semibold tracking-wider block">
            Your Official Application ID
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-cyber-blue tracking-wider">
            {appId}
          </div>
          <p className="text-[11px] text-slate-400">
            Please quote this Application ID in all future correspondence with the Cyber Cell.
          </p>
        </div>

        {/* Summary Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-left text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <span className="text-slate-500 block">Applicant Name:</span>
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-police-600" />
              {applicantName}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 block">Course & Year:</span>
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-police-600" />
              {course} • {year}
            </span>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Submission Date: <strong>{formattedDate}</strong></span>
            </div>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Status: Submitted
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleDownloadSlip}
            disabled={isDownloading}
            className="w-full sm:w-auto px-6 py-3.5 bg-police-900 hover:bg-police-950 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-cyber-blue" />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Registration Slip'}</span>
          </button>
          <button
            onClick={handlePrintSlip}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm border border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Registration Slip</span>
          </button>
        </div>

        {/* Verification Link */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <Link
            to={`/verify/${appId}`}
            className="text-police-700 hover:text-police-900 font-semibold flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-cyber-blue" />
            <span>View Public Live Verification Page</span>
          </Link>
          <Link
            to="/"
            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>

      {/* Full Slip Modal if Print/Preview requested */}
      {showSlipModal && application && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs p-4 overflow-y-auto flex items-center justify-center">
          <div className="max-w-4xl w-full my-8">
            <RegistrationSlipPDF
              application={application}
              onClose={() => setShowSlipModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
