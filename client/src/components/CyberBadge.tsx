import React from 'react';
import { ApplicationStatus } from '../types/index.js';

interface CyberBadgeProps {
  status: ApplicationStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const CyberBadge: React.FC<CyberBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase().replace(' ', '_');

  let colorClasses = 'bg-slate-100 text-slate-800 border-slate-300';
  let label = status;

  switch (normalized) {
    case 'SUBMITTED':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'Submitted';
      break;
    case 'UNDER_REVIEW':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Under Review';
      break;
    case 'SHORTLISTED':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
      label = 'Shortlisted';
      break;
    case 'SELECTED':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      label = 'Selected';
      break;
    case 'REJECTED':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Rejected';
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-sm ${colorClasses} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      <span>{label}</span>
    </span>
  );
};
