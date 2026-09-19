import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  X,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ExternalLink,
  Lock,
  FileText,
} from 'lucide-react';
import { verifyWhatsAppApplication } from '../services/api.js';

interface WhatsAppVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAppId?: string;
}

export const WhatsAppVerificationModal: React.FC<WhatsAppVerificationModalProps> = ({
  isOpen,
  onClose,
  initialAppId = '',
}) => {
  const [applicationId, setApplicationId] = useState(initialAppId);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initialAppId or reset when opened
  useEffect(() => {
    if (isOpen) {
      if (initialAppId) {
        setApplicationId(initialAppId);
      }
      // Auto focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Reset state on close
      setIsLoading(false);
      setErrorMessage(null);
      setIsSuccess(false);
      setWhatsappUrl('');
    }
  }, [isOpen, initialAppId]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

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
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-police-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200">
        {/* Top Accent Strip */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyber-blue" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-police-100 text-police-900 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-police-700" />
                  <span>Alwar Police Internship Programme 2026</span>
                </div>
                <h2
                  id="whatsapp-modal-title"
                  className="text-2xl font-black tracking-tight text-police-900"
                >
                  Join Official WhatsApp Group
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Join the official WhatsApp group for document verification and further programme updates.
                </p>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-1.5 text-left animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Application ID could not be verified.</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed pl-6">
                    Please check your Application ID and try again. Make sure you enter the Application ID exactly as shown on your registration slip.
                  </p>
                </div>
              )}

              {/* Verification Form */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="whatsapp-app-id"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Enter your Application ID
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      id="whatsapp-app-id"
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
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-mono text-sm uppercase tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:normal-case focus:outline-hidden transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <FileText className="w-3.5 h-3.5 text-police-600 shrink-0" />
                    <span>Your Application ID can be found on your registration slip.</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !applicationId.trim()}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Application…</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Protocol Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Zero-PII Secure Verification • Alwar Police Cyber Cell</span>
              </div>
            </>
          ) : (
            /* STEP 3 — SUCCESS SCREEN */
            <div className="text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Verified Candidate
                </span>
                <h2 className="text-2xl font-black text-police-900 tracking-tight">
                  Application Verified Successfully
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your application has been verified. You can now join the official WhatsApp group for document verification and further programme updates.
                </p>
              </div>

              {/* WhatsApp Action Button */}
              <div className="space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-base shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-3 group"
                >
                  <MessageCircle className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span>Join Official WhatsApp Group</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </a>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-left">
                  <p className="text-xs text-amber-900 font-medium leading-relaxed">
                    📌 <strong>Notice:</strong> Please join the group using the same details submitted during registration.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 text-xs border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-slate-500 hover:text-slate-800 font-medium py-1 px-2 rounded transition-colors"
                >
                  ← Verify another Application ID
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Done / Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
