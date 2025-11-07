import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminService } from '../../services/admin.service';
import type { AdminAuditLog } from '../../types/admin.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ShieldAlert, Search } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const AuditLogs = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const { addNotification } = useUIStore();

  const loadLogs = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await adminService.getAuditLogs({
        page,
        limit: pagination.limit,
        action: actionFilter || undefined,
      });
      if (response.success) {
        setLogs(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to load audit logs.' });
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, pagination.limit, addNotification]);

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  return (
    <AdminLayout title="Security Audit Trail">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-5 py-6 shadow-2xl shadow-black/30 flex items-start gap-4">
          <div className="p-3 bg-red-600/20 rounded-xl text-red-300">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Immutable audit history</p>
            <p className="text-sm text-slate-400">Every admin action is recorded with IP, device, and timestamp for compliance readiness.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-black/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
              <Search className="h-4 w-4" />
              Filter by action code
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value.toUpperCase())}
                placeholder="VIEW_ALL_USERS, EXPORT_USERS..."
                className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
              <button
                onClick={() => loadLogs(1)}
                className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900/80">
                <tr>
                  {['Time', 'Administrator', 'Action', 'Target', 'IP / Device'].map((header) => (
                    <th key={header} className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-slate-950/60 divide-y divide-slate-900">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      No audit entries match the filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-5 py-4 text-sm text-slate-300">
                        <div>{new Date(log.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">
                        {typeof log.admin === 'string' ? log.admin : log.admin?.email}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">
                        <div className="font-semibold text-white">{log.action}</div>
                        <div className="text-xs text-slate-500">{log.description}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">
                        <div>{log.targetCollection || '—'}</div>
                        <div className="text-xs text-slate-500">{log.targetId || '—'}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">
                        <div>{log.ipAddress || '—'}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[220px]">{log.userAgent || 'Unknown device'}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <div>
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadLogs(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1 || isLoading}
                className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => loadLogs(Math.min(pagination.pages, pagination.page + 1))}
                disabled={pagination.page === pagination.pages || isLoading}
                className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AuditLogs;

