import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-police-950 text-slate-300 border-t border-police-800 pt-12 pb-8 text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Initiative Overview */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1 border border-police-600 flex items-center justify-center overflow-hidden shrink-0 shadow">
                <img
                  src="/Rajasthan-Police.webp"
                  alt="Rajasthan Police"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-white text-base block leading-tight">Alwar Police</span>
                <span className="text-[11px] text-police-300">Cyber Crime & Security Wing</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Alwar Police Internship Programme 2026</strong><br />
              Cyber Security Internship Programme
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              A specialized police-academic collaborative initiative providing eligible undergraduate and postgraduate technology students with hands-on exposure to cyber threat intelligence, digital forensics, and cyber crime investigation methodologies.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-police-300">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-cyber-blue transition-colors">
                  Programme Overview
                </Link>
              </li>
              <li>
                <a href="/#eligibility" className="hover:text-cyber-blue transition-colors">
                  Eligibility Criteria (BCA, B.Tech, MCA)
                </a>
              </li>
              <li>
                <a href="/#curriculum" className="hover:text-cyber-blue transition-colors">
                  Cyber Security Domains & Labs
                </a>
              </li>
              <li>
                <Link to="/register" className="hover:text-cyber-blue transition-colors text-emerald-400 font-medium">
                  → Student Registration 2026
                </Link>
              </li>
              <li>
                <Link to="/verify/check" className="hover:text-cyber-blue transition-colors">
                  Live Application Status Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Programme Help & Cyber Experts Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-police-300">
              Helpdesk & Cyber Experts
            </h4>
            <div className="space-y-2 text-xs">
              {/* Expert 1 */}
              <div className="bg-police-900/80 p-2.5 rounded-lg border border-police-800 space-y-0.5">
                <span className="text-white font-semibold block text-[11px]">Abhishek Sharma</span>
                <span className="text-police-400 text-[10px] block">Cyber Expert / Coordinator</span>
                <a
                  href="tel:9680895044"
                  className="text-cyber-blue hover:underline font-mono font-bold text-xs inline-flex items-center gap-1 mt-0.5"
                >
                  <Phone className="w-3 h-3" /> +91 96808 95044
                </a>
              </div>

              {/* Expert 2 */}
              <div className="bg-police-900/80 p-2.5 rounded-lg border border-police-800 space-y-0.5">
                <span className="text-white font-semibold block text-[11px]">Sachin Yadav</span>
                <span className="text-police-400 text-[10px] block">Cyber Expert / Technical Lead</span>
                <a
                  href="tel:8239930511"
                  className="text-cyber-blue hover:underline font-mono font-bold text-xs inline-flex items-center gap-1 mt-0.5"
                >
                  <Phone className="w-3 h-3" /> +91 82399 30511
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Official Security Notice */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-police-300">
              Official Disclaimer
            </h4>
            <div className="bg-police-900/80 p-3.5 rounded-lg border border-police-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Security & Privacy Protocol</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Registration data is securely stored and encrypted. Submission does not constitute guaranteed appointment. No government fees are charged for application.
              </p>
              <div className="pt-1">
                <Link to="/admin/login" className="text-police-400 hover:text-cyber-blue text-[11px] inline-flex items-center gap-1">
                  Authorized Admin Access <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-police-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Alwar Police Internship Programme. All Rights Reserved.</p>
          <div className="flex gap-6">
            <span>Cyber Cell Alwar</span>
            <span>Government of Rajasthan</span>
            <span>HTTPS Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
