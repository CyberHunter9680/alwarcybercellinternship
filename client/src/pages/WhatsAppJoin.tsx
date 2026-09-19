import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ExternalLink,
  Lock,
  FileText,
  Home,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { verifyWhatsAppApplication } from '../services/api.js';

export const WhatsAppJoin: React.FC = () => {
  const [applicationId, setApplicationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedId = applicationId.trim();
    if (!trimmedId) {
      setErrorMessage('Please enter your Application ID.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await verifyWhatsAppApplication(trimmedId);
      if (response && response.verified && response.whatsappGroupUrl) {
        setWhatsappUrl(response.whatsappGroupUrl);
        setIsSuccess(true);
      } else {
        setErrorMessage(
          response?.message ||
            'Application ID could not be verified. Please check your Application ID and try again.'
        );
      }
    } catch (err: any) {
      setErrorMessage(
        'Application ID could not be verified. Please check your Application ID and try again. Make sure you enter the Application ID exactly as shown on your registration slip.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setWhatsappUrl('');
    setErrorMessage(null);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <MessageCircle className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-police-100 text-police-900 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-police-700" />
          <span>Alwar Police Internship Programme 2026</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-police-900 tracking-tight">
          Join Official WhatsApp Group
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
          Join the official WhatsApp group for document verification and further programme updates.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-slate-900">
        {/* Top Accent Strip */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyber-blue" />

        <div className="p-6 sm:p-10 space-y-6">
          {!isSuccess ? (
            <div className="space-y-6">
              {/* Notice Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Shield className="w-4 h-4 text-police-700" />
                  <span>Official Verification Required</span>
                </div>
                <p className="leading-relaxed">
                  To maintain strict group integrity and prevent unauthorized access, you must verify your unique Application ID before receiving the official group invitation link.
                </p>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-2 text-left animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>Application ID could not be verified.</span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed pl-7">
                    Please check your Application ID and try again. Make sure you enter the Application ID exactly as shown on your registration slip.
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2 text-left">
                  <label
                    htmlFor="page-whatsapp-app-id"
                    className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
                  >
                    Enter your Application ID
                  </label>
                  <input
                    id="page-whatsapp-app-id"
                    type="text"
                    value={applicationId}
                    onChange={(e) => {
                      setApplicationId(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="APCSIP2026-001234"
                    disabled={isLoading}
                    autoComplete="off"
                    spellCheck="false"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-mono text-base uppercase tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:normal-case focus:outline-hidden transition-all disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                    <FileText className="w-4 h-4 text-police-600 shrink-0" />
                    <span>Your Application ID can be found on your registration slip.</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !applicationId.trim()}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying Application…</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Application</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* SUCCESS SCREEN */
            <div className="text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Verified Candidate
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-police-900 tracking-tight">
                  Application Verified Successfully
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your application has been verified. You can now join the official WhatsApp group for document verification and further programme updates.
                </p>
              </div>

              {/* Official WhatsApp Button */}
              <div className="space-y-4 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-base sm:text-lg shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-3 group"
                >
                  <MessageCircle className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
                  <span>Join Official WhatsApp Group</span>
                  <ExternalLink className="w-5 h-5 opacity-80" />
                </a>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-left">
                  <p className="text-xs text-amber-900 font-medium leading-relaxed">
                    📌 <strong>Important:</strong> Please join the group using the same details submitted during registration.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-police-700 hover:text-police-900 font-semibold"
                >
                  ← Verify Another Application
                </button>
                <Link to="/" className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" /> Return Home
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Zero-PII Secure Verification</span>
          </div>
          <Link to="/verify/check" className="text-police-700 hover:underline font-medium">
            Live Application Status ↗
          </Link>
        </div>
      </div>
    </div>
  );
};
