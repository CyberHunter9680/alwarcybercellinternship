import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Activity,
  Loader2,
} from 'lucide-react';
import { getAdminAuditLogs } from '../../services/api.js';
import { AuditLogItem, PaginationMeta } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });

  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAdminAuditLogs({
        page,
        limit: 50,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
      });
      setLogs(result.logs);
      setMeta(result.meta);
    } catch (err: any) {
      toast.error('Failed to load audit logs: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, actionFilter, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-police-900 tracking-tight">
            Security Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Immutable log of officer authentications, status changes, and data export operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-600 uppercase text-[10px]">Filter by Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="p-2 rounded-lg border border-slate-300 bg-slate-50 font-medium text-xs focus:ring-1 focus:ring-police-700 focus:outline-hidden"
          >
            <option value="ALL">All Recorded Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="VIEW_APPLICATION">VIEW_APPLICATION</option>
            <option value="EXPORT_DATA">EXPORT_DATA</option>
          </select>
        </div>

        <div className="font-semibold text-slate-500">
          Showing <strong className="text-police-900 font-mono">{logs.length}</strong> of{' '}
          <strong className="text-police-900 font-mono">{meta.total}</strong> events
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-police-700 animate-spin" />
              <p className="text-xs text-slate-500">Fetching audit records...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs">No audit events recorded yet.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Admin / Officer</th>
                  <th className="py-3 px-4">Application Reference</th>
                  <th className="py-3 px-4">Activity Details</th>
                  <th className="py-3 px-4">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-sans text-[11px]">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-police-100 text-police-900 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-800 whitespace-nowrap">
                      {log.admin ? (
                        <div className="text-xs font-semibold">{log.admin.name}</div>
                      ) : (
                        <span className="text-slate-400 italic font-mono">System</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-police-900 font-bold whitespace-nowrap">
                      {log.application?.applicationId || '-'}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 max-w-sm truncate" title={log.details || ''}>
                      {log.details || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {log.ipAddress || 'unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Page <strong className="font-mono text-slate-900">{meta.page}</strong> of{' '}
            <strong className="font-mono text-slate-900">{meta.totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={meta.page <= 1 || isLoading}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold disabled:opacity-40 flex items-center gap-1 hover:bg-slate-100"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
              disabled={meta.page >= meta.totalPages || isLoading}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold disabled:opacity-40 flex items-center gap-1 hover:bg-slate-100"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
