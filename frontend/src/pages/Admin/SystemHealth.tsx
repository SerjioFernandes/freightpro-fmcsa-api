import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminService } from '../../services/admin.service';
import type { AdminSystemStats } from '../../types/admin.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { AlertTriangle, ServerCrash, ShieldCheck } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const SystemHealth = () => {
  const [stats, setStats] = useState<AdminSystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useUIStore();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const response = await adminService.getSystemStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        addNotification({ type: 'error', message: 'Unable to fetch system health data.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [addNotification]);

  const uptime = (() => {
    if (!stats) return '—';
    const totalRecords = stats.users.total + stats.loads.total + stats.messages.total;
    if (totalRecords === 0) return 'No activity';
    return `${stats.users.total.toLocaleString()} users · ${stats.loads.total.toLocaleString()} loads · ${stats.messages.total.toLocaleString()} comms`;
  })();

  return (
    <AdminLayout title="System Integrity & Resilience">
      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : stats ? (
        <div className="space-y-8">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-emerald-600/40 bg-emerald-600/10 px-6 py-6 shadow-2xl shadow-black/30">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">AUTHORIZATION</p>
                  <p className="mt-2 text-sm text-emerald-100">Admin IP filtering active · Audit immutable</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-600/40 bg-amber-600/10 px-6 py-6 shadow-2xl shadow-black/30">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-amber-200">RISK WATCH</p>
                  <p className="mt-2 text-sm text-amber-100">Review suspended accounts and stale sessions</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-6 shadow-2xl shadow-black/30">
              <div className="flex items-center gap-3">
                <ServerCrash className="h-6 w-6 text-slate-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">THROUGHPUT</p>
                  <p className="mt-2 text-sm text-slate-200">{uptime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-black/30">
            <h2 className="text-lg font-semibold text-white mb-4">Operational Snapshot</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Users</p>
                  <div className="mt-3 text-2xl font-semibold text-white">{stats.users.total.toLocaleString()}</div>
                  <p className="text-xs text-slate-400 mt-1">{stats.users.active.toLocaleString()} active · {stats.users.admin} admin</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Loads</p>
                  <div className="mt-3 text-2xl font-semibold text-white">{stats.loads.total.toLocaleString()}</div>
                  <p className="text-xs text-slate-400 mt-1">{stats.loads.open.toLocaleString()} open · {stats.loads.booked.toLocaleString()} booked</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Shipments</p>
                  <div className="mt-3 text-2xl font-semibold text-white">{stats.shipments.total.toLocaleString()}</div>
                  <p className="text-xs text-slate-400 mt-1">{stats.shipments.open.toLocaleString()} open</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Messages</p>
                  <div className="mt-3 text-2xl font-semibold text-white">{stats.messages.total.toLocaleString()}</div>
                  <p className="text-xs text-slate-400 mt-1">Keep an eye on abnormal spikes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-black/30">
            <h2 className="text-lg font-semibold text-white mb-4">Security Checklist</h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                Admin routes protected by JWT, role check, IP allowlist, and rate limiting
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                Audit logs capture action, target, IP, and device fingerprint
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                Exports delivered as signed downloads with admin authorization
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-slate-400">No metrics available.</div>
      )}
    </AdminLayout>
  );
};

export default SystemHealth;


