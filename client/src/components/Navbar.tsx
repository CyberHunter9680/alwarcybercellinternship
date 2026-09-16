import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Lock, Menu, X, CheckCircle, FileText, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, admin } = useAuth();

  const isAdminSection = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-police-900/95 backdrop-blur-md border-b border-police-700/60 shadow-lg text-white">
      {/* Top micro-bar for official disclaimer */}
      <div className="bg-police-950 py-1 px-4 text-xs text-police-300 flex justify-between items-center border-b border-police-800">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">Official Portal</span>
            <span className="hidden sm:inline text-police-400">| Alwar Police Department • Rajasthan</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="hidden md:inline text-xs">National Cyber Helpline: <strong className="text-cyber-blue font-semibold">1930</strong></span>
            {isAuthenticated && (
              <span className="text-xs bg-police-800 text-police-200 px-2 py-0.5 rounded border border-police-700">
                Logged in: {admin?.name || 'Admin'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-white p-1 border border-police-500/40 flex items-center justify-center shadow-md group-hover:border-cyber-blue transition-all overflow-hidden shrink-0">
            <img
              src="/Rajasthan-Police.webp"
              alt="Rajasthan Police Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-cyber-blue transition-colors">
              Alwar Police Internship Programme 2026
            </span>
            <span className="text-xs text-police-300 font-medium tracking-wide">
              Cyber Security Internship Programme
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {!isAdminSection ? (
            <>
              <Link
                to="/"
                className={`transition-colors hover:text-cyber-blue ${
                  location.pathname === '/' ? 'text-cyber-blue font-semibold' : 'text-slate-200'
                }`}
              >
                Home
              </Link>
              <a href="/#eligibility" className="text-slate-200 hover:text-cyber-blue transition-colors">
                Eligibility
              </a>
              <a href="/#curriculum" className="text-slate-200 hover:text-cyber-blue transition-colors">
                Curriculum & Labs
              </a>
              <a href="/#timeline" className="text-slate-200 hover:text-cyber-blue transition-colors">
                Timeline
              </a>
              <Link
                to="/verify/check"
                className={`transition-colors hover:text-cyber-blue flex items-center gap-1.5 ${
                  location.pathname.startsWith('/verify') ? 'text-cyber-blue font-semibold' : 'text-slate-200'
                }`}
              >
                <UserCheck className="w-4 h-4 text-cyber-blue" /> Verify Application
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-police-600 to-cyber-blue hover:from-police-500 hover:to-cyan-400 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                <span>Register Now</span>
                <CheckCircle className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/admin/dashboard"
                className={`transition-colors hover:text-cyber-blue ${
                  location.pathname === '/admin/dashboard' ? 'text-cyber-blue font-semibold' : 'text-slate-200'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/applications"
                className={`transition-colors hover:text-cyber-blue ${
                  location.pathname.startsWith('/admin/applications') ? 'text-cyber-blue font-semibold' : 'text-slate-200'
                }`}
              >
                Applications
              </Link>
              <Link
                to="/admin/reports"
                className={`transition-colors hover:text-cyber-blue ${
                  location.pathname === '/admin/reports' ? 'text-cyber-blue font-semibold' : 'text-slate-200'
                }`}
              >
                Reports & Export
              </Link>
              <Link
                to="/admin/audit-logs"
                className={`transition-colors hover:text-cyber-blue ${
                  location.pathname === '/admin/audit-logs' ? 'text-cyber-blue font-semibold' : 'text-slate-200'
                }`}
              >
                Audit Trail
              </Link>
              <Link
                to="/"
                className="text-xs bg-police-800 hover:bg-police-700 text-police-200 px-3 py-1.5 rounded-lg border border-police-600 transition-colors"
              >
                Public Site ↗
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg bg-police-800 text-slate-200 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-police-950/98 border-b border-police-800 px-4 py-4 flex flex-col gap-3 text-sm">
          {!isAdminSection ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded hover:bg-police-800 text-slate-200"
              >
                Home
              </Link>
              <a
                href="/#eligibility"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded hover:bg-police-800 text-slate-200"
              >
                Eligibility
              </a>
              <a
                href="/#curriculum"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded hover:bg-police-800 text-slate-200"
              >
                Curriculum & Labs
              </a>
              <a
                href="/#timeline"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded hover:bg-police-800 text-slate-200"
              >
                Timeline
              </a>
              <Link
                to="/verify/check"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded hover:bg-police-800 text-slate-200 flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-cyber-blue" /> Verify Application
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 bg-gradient-to-r from-police-600 to-cyber-blue text-white text-center py-2.5 rounded-lg font-semibold"
              >
                Register Now
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded hover:bg-police-800 text-slate-200"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded hover:bg-police-800 text-slate-200"
              >
                Applications
              </Link>
              <Link
                to="/admin/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded hover:bg-police-800 text-slate-200"
              >
                Reports & Export
              </Link>
              <Link
                to="/admin/audit-logs"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded hover:bg-police-800 text-slate-200"
              >
                Audit Trail
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
