import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Shield, CheckCircle2, FileText, Calendar, Lock } from 'lucide-react';
import { Application } from '../types/index.js';
import { downloadRegistrationSlipPDF } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';

interface RegistrationSlipProps {
  application: Application;
  onClose?: () => void;
}

export const RegistrationSlipPDF: React.FC<RegistrationSlipProps> = ({
  application,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const toast = useToast();

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await downloadRegistrationSlipPDF(application.applicationId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Alwar_Police_Cyber_Internship_${application.applicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Registration Slip PDF downloaded successfully.');
    } catch (err: any) {
      toast.error('Failed to download PDF slip: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const verifyUrl = `${window.location.origin}/verify/${application.applicationId}`;
  const formattedDate = new Date(application.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const allSkills = [...(application.skills || []), ...(application.customSkills || [])];

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-police-700" />
          <span className="font-semibold text-slate-800 text-sm">Official Registration Acknowledgement Slip</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors flex items-center gap-2 border border-slate-300"
          >
            <Printer className="w-4 h-4" />
            <span>Print Slip</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-2 bg-police-800 hover:bg-police-900 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Official PDF'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 text-sm font-medium"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* A4 Document Container */}
      <div
        id="printable-slip"
        className="max-w-[794px] mx-auto bg-white p-8 md:p-12 border border-slate-300 shadow-2xl rounded-sm text-slate-900 text-sm font-sans relative"
      >
        {/* Document Border */}
        <div className="border-2 border-police-900/40 p-6 md:p-8 space-y-6 relative">
          {/* Header Banner with Official Logo */}
          <div className="bg-police-900 text-white p-6 rounded-t flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white p-1.5 border-2 border-police-500 flex items-center justify-center shrink-0 shadow">
                <img
                  src="/Rajasthan-Police.webp"
                  alt="Rajasthan Police"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-cyber-blue text-xs font-bold uppercase tracking-wider">
                  Alwar Police Department • Rajasthan
                </div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase text-white">
                  ALWAR POLICE
                </h1>
                <h2 className="text-sm font-bold text-slate-200 tracking-wide">
                  INTERNSHIP PROGRAMME 2026
                </h2>
                <p className="text-[11px] text-police-300">
                  CYBER SECURITY INTERNSHIP PROGRAMME • REGISTRATION ACKNOWLEDGEMENT
                </p>
              </div>
            </div>
          </div>

          {/* Application Header Strip with QR Code */}
          <div className="bg-slate-50 p-4 border border-slate-200 rounded flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                Application Identifier
              </span>
              <div className="text-xl md:text-2xl font-mono font-black text-police-900 tracking-wider">
                {application.applicationId}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Submitted: {formattedDate}</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Status: {application.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-1 bg-white p-2.5 rounded border border-slate-200 shadow-sm shrink-0">
              <QRCodeSVG
                value={verifyUrl}
                size={88}
                level="M"
                includeMargin={false}
              />
              <span className="text-[9px] font-mono text-slate-500 tracking-tighter">
                SCAN TO VERIFY
              </span>
            </div>
          </div>

          {/* Section 1: Applicant Details */}
          <div className="space-y-2">
            <div className="bg-police-800 text-white px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Applicant Personal Details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-200 rounded divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
              <div className="p-3 space-y-2">
                <div>
                  <span className="text-slate-500 font-medium block">Full Name:</span>
                  <span className="text-slate-900 font-semibold text-sm">{application.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Mobile Number:</span>
                  <span className="text-slate-900 font-mono">{application.mobile}</span>
                </div>
              </div>
              <div className="p-3 space-y-2 bg-slate-50/50">
                <div>
                  <span className="text-slate-500 font-medium block">Email Address:</span>
                  <span className="text-slate-900 font-mono">{application.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Identity Verification:</span>
                  <span className="text-emerald-700 font-semibold">Self-Certified & Authenticated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Academic Details */}
          <div className="space-y-2">
            <div className="bg-police-800 text-white px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>2. Academic Qualifications</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-200 rounded divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
              <div className="p-3 space-y-2">
                <div>
                  <span className="text-slate-500 font-medium block">Enrolled Course:</span>
                  <span className="text-slate-900 font-bold">{application.course.replace('_', '.')}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Current Year of Study:</span>
                  <span className="text-slate-900 font-semibold">
                    {application.year.replace('_', ' ').replace('YEAR', 'Year')}
                  </span>
                </div>
              </div>
              <div className="p-3 space-y-2 bg-slate-50/50">
                <div>
                  <span className="text-slate-500 font-medium block">University / Institution Name:</span>
                  <span className="text-slate-900 font-semibold">{application.universityName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Eligibility Status:</span>
                  <span className="text-emerald-700 font-semibold">Eligible (BCA / B.Tech / MCA Criteria Met)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Skills */}
          <div className="space-y-2">
            <div className="bg-police-800 text-white px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>3. Selected Cyber Security Skills & Specializations</span>
            </div>
            <div className="p-3.5 border border-slate-200 rounded bg-slate-50 text-xs">
              <div className="flex flex-wrap gap-1.5">
                {allSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="bg-white border border-slate-300 text-slate-800 px-2.5 py-1 rounded text-[11px] font-medium shadow-2xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Motivation */}
          <div className="space-y-2">
            <div className="bg-police-800 text-white px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>4. Internship Statement of Motivation</span>
            </div>
            <div className="p-3.5 border border-slate-200 rounded bg-slate-50 text-xs italic text-slate-700 leading-relaxed">
              "{application.motivation}"
            </div>
          </div>

          {/* Section 5: Documents */}
          <div className="space-y-2">
            <div className="bg-police-800 text-white px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>5. Uploaded Documentation</span>
            </div>
            <div className="p-3 border border-slate-200 rounded bg-slate-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-police-700" />
                <span className="font-medium text-slate-900">
                  Resume / CV Attached: <strong>{application.resumeFilename || 'resume.pdf'}</strong>
                </span>
              </div>
              <span className="text-emerald-700 font-semibold">Verified Upload</span>
            </div>
          </div>

          {/* Section 6: Instructions & Legal Disclaimers */}
          <div className="bg-slate-100 p-4 border border-slate-300 rounded text-[11px] text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-police-800" />
                <span>IMPORTANT ACKNOWLEDGEMENT NOTICE:</span>
              </div>
              <span className="text-[10px] text-police-800 font-semibold">
                Helpline: Abhishek Sharma (9680895044) • Sachin Yadav (8239930511)
              </span>
            </div>
            <ol className="list-decimal pl-4 space-y-1">
              <li>
                This registration slip serves as an official proof of application submission for the Alwar Police Internship Programme 2026.
              </li>
              <li>
                Submission does not constitute guaranteed selection. Applications will undergo a multi-tier technical evaluation.
              </li>
              <li>
                Please retain this acknowledgement safely for verification during future rounds and interview stages.
              </li>
              <li>
                You may scan the official QR code on this slip at any time to verify current status on the live portal.
              </li>
            </ol>
          </div>

          {/* Document Footer */}
          <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500 space-y-1">
            <p>
              Application ID: <strong className="font-mono text-slate-800">{application.applicationId}</strong> • Application Status: <strong>{application.status.replace('_', ' ')}</strong>
            </p>
            <p>
              Generated on {formattedDate} • Official Web Portal • Cyber Cell Alwar, Rajasthan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
