import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/admin.service';
import AdminLayout from '../../components/layout/AdminLayout';
import type { AdminAuditLog, AdminSystemStats, AdminUser } from '../../types/admin.types';
import {
  Activity,
  Users,
  Truck,
  MessageSquare,
  AlertOctagon,
  Inbox,
  ShieldCheck,
  ActivitySquare,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { getErrorMessage } from '../../utils/errors';
import { exportRecordsToPDF } from '../../utils/exportData';

type CategorisedLogs = {
  communications: AdminAuditLog[];
  systemAlerts: AdminAuditLog[];
  adminActions: AdminAuditLog[];
};

const formatLogTime = (isoDate: string) => {
  try {
    return new Date(isoDate).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminSystemStats | null>(null);
  const [auditFeed, setAuditFeed] = useState<AdminAuditLog[]>([]);
  const [recentSignups, setRecentSignups] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [exportInProgress, setExportInProgress] = useState<string | null>(null);
  const { addNotification } = useUIStore();

  const downloadBlobFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportLoadsCsv = async () => {
    setExportInProgress('loads-csv');
    try {
      const blob = await adminService.exportLoadsCsv();
      const timestamp = new Date().toISOString().split('T')[0];
      downloadBlobFile(blob, `loads-export-${timestamp}.csv`);
      addNotification({ type: 'success', message: 'Loads exported as CSV.' });
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to export loads') });
    } finally {
      setExportInProgress(null);
    }
  };

  const handleExportShipmentsCsv = async () => {
    setExportInProgress('shipments-csv');
    try {
      const blob = await adminService.exportShipmentsCsv();
      const timestamp = new Date().toISOString().split('T')[0];
      downloadBlobFile(blob, `shipments-export-${timestamp}.csv`);
      addNotification({ type: 'success', message: 'Shipments exported as CSV.' });
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to export shipments') });
    } finally {
      setExportInProgress(null);
    }
  };

  const handleExportUsersCsv = async () => {
    setExportInProgress('users-csv');
    try {
      const blob = await adminService.exportUsers('csv');
      const timestamp = new Date().toISOString().split('T')[0];
      downloadBlobFile(blob, `users-export-${timestamp}.csv`);
      addNotification({ type: 'success', message: 'Users exported as CSV.' });
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to export users') });
    } finally {
      setExportInProgress(null);
    }
  };

  const handleExportLoadsPdf = async () => {
    setExportInProgress('loads-pdf');
    try {
      const data = await adminService.fetchLoadsDataset();
      exportRecordsToPDF(`Loads Report (${data.totalLoads})`, data.loads);
      addNotification({ type: 'success', message: 'Loads PDF report generated.' });
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to generate loads PDF') });
    } finally {
      setExportInProgress(null);
    }
  };

  const handleExportShipmentsPdf = async () => {
    setExportInProgress('shipments-pdf');
    try {
      const data = await adminService.fetchShipmentsDataset();
      exportRecordsToPDF(`Shipments Report (${data.totalShipments})`, data.shipments);
      addNotification({ type: 'success', message: 'Shipments PDF report generated.' });
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to generate shipments PDF') });
    } finally {
      setExportInProgress(null);
    }
  };

  const handleExportUsersPdf = async () => {
    setExportInProgress('users-pdf');
    try {
      const data = await adminService.fetchUsersDataset();
      const simplified = data.users.map((user) => ({
        email: user.email,
        company: user.company,
        accountType: user.accountType,
        role: user.role,
        active: user.isActive ? 'Yes' : 'No',
        joined: new Date(user.createdAt).toLocaleDateString(),
      }));
      exportRecordsToPDF(`Users Report (${data.totalUsers})`, simplified);
      addNotification({ type: 'success', message: 'Users PDF report generated.' });
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to generate users PDF') });
    } finally {
      setExportInProgress(null);
    }
  };

  const handleSeedLoads = async () => {
    if (!window.confirm('This will generate 100 test loads. Continue?')) return;
    
    setIsSeeding(true);
    addNotification({ type: 'info', message: 'Seeding loads... This may take a moment.' });
    
    try {
      const response = await adminService.seedLoads();
      if (response.success) {
        addNotification({ type: 'success', message: '✅ 100 loads seeded successfully! Check the Load Board.' });
        // Wait a bit then refresh stats
        setTimeout(async () => {
          const statsResponse = await adminService.getSystemStats();
          if (statsResponse.success) {
            setStats(statsResponse.data);
          }
        }, 2000);
      }
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, 'Failed to seed loads');
      addNotification({ type: 'error', message: `❌ Seeding failed: ${errorMsg}` });
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const [statsResponse, auditResponse, usersResponse] = await Promise.all([
          adminService.getSystemStats(),
          adminService.getAuditLogs({ limit: 40 }),
          adminService.getUsers({ limit: 6 }),
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
        if (auditResponse.success) {
          setAuditFeed(auditResponse.data);
        }
        if (usersResponse.success) {
          setRecentSignups(usersResponse.data);
        }
      } catch (error: unknown) {
        if (import.meta.env.DEV) {
          console.warn('Failed to load admin dashboard data', error);
        }
        addNotification({ type: 'error', message: 'Failed to load admin mission data.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [addNotification]);

  const widgets = stats
    ? [
        {
          title: 'Total Users',
          displayValue: stats.users.total.toLocaleString(),
          subtext: `${stats.users.admin} admins • ${stats.users.active} active`,
          icon: Users,
          accent: 'from-red-500/20 to-red-600/10 text-red-200 border-red-600/40',
        },
        {
          title: 'Conversion Rate',
          displayValue: `${stats.analytics.conversionRate.toFixed(1)}%`,
          subtext: `${stats.loads.booked.toLocaleString()} of ${stats.loads.total.toLocaleString()} loads`,
          icon: Activity,
          accent: 'from-emerald-500/20 to-emerald-600/10 text-emerald-200 border-emerald-600/40',
        },
        {
          title: 'Active Lanes',
          displayValue: stats.analytics.activeLaneCount.toLocaleString(),
          subtext: `${stats.loads.inTransit.toLocaleString()} lanes in transit`,
          icon: ActivitySquare,
          accent: 'from-blue-500/20 to-blue-600/10 text-blue-200 border-blue-600/40',
        },
        {
          title: 'Billing Queue',
          displayValue: stats.analytics.readyForBilling.toLocaleString(),
          subtext: `${stats.documents.verified.toLocaleString()} docs verified`,
          icon: Inbox,
          accent: 'from-amber-500/20 to-amber-600/10 text-amber-200 border-amber-600/40',
        },
      ]
    : [];

  const categorisedLogs: CategorisedLogs = useMemo(() => {
    const communications: AdminAuditLog[] = [];
    const systemAlerts: AdminAuditLog[] = [];
    const adminActions: AdminAuditLog[] = [];

    auditFeed.forEach((log) => {
      const action = (log.action || '').toUpperCase();
      const description = (log.description || '').toUpperCase();

      if (action.includes('MESSAGE') || (log.targetCollection as string)?.includes?.('message')) {
        communications.push(log);
        return;
      }

      if (/(FAILED|ERROR|BLOCKED|UNAUTHORIZED|RATE_LIMIT)/.test(action) || /(FAILED|ERROR)/.test(description)) {
        systemAlerts.push(log);
        return;
      }

      adminActions.push(log);
    });

    return {
      communications,
      systemAlerts,
      adminActions,
    };
  }, [auditFeed]);

  const renderLogItem = (log: AdminAuditLog) => {
    const adminIdentity = typeof log.admin === 'string' ? log.admin : log.admin?.email;
    return (
      <li key={log._id} className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{formatLogTime(log.createdAt)}</span>
          <span className="uppercase tracking-widest text-[10px] text-slate-500">{log.action}</span>
        </div>
        <p className="mt-2 text-sm text-slate-200">{log.description || 'No description provided'}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
          {adminIdentity && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1">
              <ShieldCheck className="h-3 w-3 text-red-300" />
              {adminIdentity}
            </span>
          )}
          {log.targetCollection && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/70 px-3 py-1 uppercase tracking-[0.3em] text-slate-500">
              {log.targetCollection}
            </span>
          )}
        </div>
      </li>
    );
  };

  return (
    <AdminLayout title="Mission Control Overview">
      {isLoading ? (
        <div className="space-y-10">
          <div className="flex items-center justify-end">
            <div className="h-10 w-56 rounded-xl bg-slate-800/60 animate-pulse" />
          </div>

          <section>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-2xl shadow-black/30 animate-pulse space-y-4"
                >
                  <div className="h-3 w-24 rounded bg-slate-700/60" />
                  <div className="h-8 w-32 rounded bg-slate-600/60" />
                  <div className="h-3 w-20 rounded bg-slate-700/60" />
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-6 w-40 rounded bg-slate-700/60 animate-pulse" />
                <div className="h-10 w-10 rounded-xl bg-slate-800/60 animate-pulse" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-6 space-y-3 animate-pulse">
                    <div className="h-3 w-24 rounded bg-slate-700/60" />
                    <div className="h-6 w-14 rounded bg-slate-600/60" />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-5 space-y-3 animate-pulse">
                    <div className="h-3 w-24 rounded bg-slate-700/60" />
                    <div className="h-6 w-16 rounded bg-slate-600/60" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 space-y-4 animate-pulse">
              <div className="h-6 w-32 rounded bg-slate-700/60" />
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-4 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-slate-700/60" />
                  <div className="h-3 w-1/3 rounded bg-slate-800/60" />
                  <div className="h-3 w-1/4 rounded bg-slate-800/60" />
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 space-y-4 animate-pulse"
              >
                <div className="h-6 w-40 rounded bg-slate-700/60" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, itemIndex) => (
                    <div key={itemIndex} className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-4 space-y-2">
                      <div className="h-3 w-1/2 rounded bg-slate-700/60" />
                      <div className="h-3 w-2/3 rounded bg-slate-800/60" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : stats ? (
        <div className="space-y-10">
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportLoadsCsv}
                disabled={exportInProgress === 'loads-csv'}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-slate-500 transition-colors disabled:opacity-50"
              >
                {exportInProgress === 'loads-csv' ? 'Exporting...' : 'Loads CSV'}
              </button>
              <button
                onClick={handleExportShipmentsCsv}
                disabled={exportInProgress === 'shipments-csv'}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-slate-500 transition-colors disabled:opacity-50"
              >
                {exportInProgress === 'shipments-csv' ? 'Exporting...' : 'Shipments CSV'}
              </button>
              <button
                onClick={handleExportUsersCsv}
                disabled={exportInProgress === 'users-csv'}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-slate-500 transition-colors disabled:opacity-50"
              >
                {exportInProgress === 'users-csv' ? 'Exporting...' : 'Users CSV'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportLoadsPdf}
                disabled={exportInProgress === 'loads-pdf'}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-slate-500 transition-colors disabled:opacity-50"
              >
                {exportInProgress === 'loads-pdf' ? 'Preparing…' : 'Loads PDF'}
              </button>
              <button
                onClick={handleExportShipmentsPdf}
                disabled={exportInProgress === 'shipments-pdf'}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-slate-500 transition-colors disabled:opacity-50"
              >
                {exportInProgress === 'shipments-pdf' ? 'Preparing…' : 'Shipments PDF'}
              </button>
              <button
                onClick={handleExportUsersPdf}
                disabled={exportInProgress === 'users-pdf'}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-slate-500 transition-colors disabled:opacity-50"
              >
                {exportInProgress === 'users-pdf' ? 'Preparing…' : 'Users PDF'}
              </button>
            </div>
            <button
              onClick={handleSeedLoads}
              disabled={isSeeding}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSeeding ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Seeding...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  Seed 100 Test Loads
                </>
              )}
            </button>
          </div>

          <section>
            <h2 className="text-xs uppercase tracking-[0.6em] text-slate-500 mb-3">Mission Summary</h2>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {widgets.map((widget) => {
                const Icon = widget.icon;
                return (
                  <article
                    key={widget.title}
                    className={`rounded-2xl border bg-gradient-to-br ${widget.accent} p-6 shadow-2xl shadow-black/40 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-slate-400">{widget.title}</p>
                        <p className="mt-3 text-3xl font-bold text-white">{widget.displayValue}</p>
                        <p className="mt-1 text-xs text-slate-300">{widget.subtext}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Traffic Overview</h3>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Accounts • Loads • Shipments</p>
                </div>
                <ActivitySquare className="h-10 w-10 text-red-300" />
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: 'Carriers Online',
                    value: stats.users.carriers,
                    accent: 'border-blue-600/40 bg-blue-500/15 text-blue-200',
                  },
                  {
                    label: 'Brokers Active',
                    value: stats.users.brokers,
                    accent: 'border-emerald-600/40 bg-emerald-500/15 text-emerald-200',
                  },
                  {
                    label: 'Shippers Engaged',
                    value: stats.users.shippers,
                    accent: 'border-amber-600/40 bg-amber-500/15 text-amber-200',
                  },
                ].map((item) => (
                  <div key={item.label} className={`rounded-2xl border px-5 py-6 shadow-inner shadow-black/20 ${item.accent}`}>
                    <p className="text-[11px] uppercase tracking-[0.4em]">{item.label}</p>
                    <p className="mt-4 text-2xl font-semibold">{item.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Loads</p>
                  <div className="mt-3 space-y-3 text-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Open</span>
                      <span>{stats.loads.open.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-sm uppercase tracking-[0.3em]">In transit</span>
                      <span>{stats.loads.inTransit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-sm uppercase tracking-[0.3em]">Delivered</span>
                      <span>{stats.loads.delivered.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
                      <span>Total loads</span>
                      <span>{stats.loads.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Shipments</p>
                  <div className="mt-3 space-y-3 text-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Open</span>
                      <span>{stats.shipments.open.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-sm uppercase tracking-[0.3em]">Total</span>
                      <span>{stats.shipments.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Documents</p>
                  <div className="mt-3 space-y-3 text-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Verified</span>
                      <span>{stats.documents.verified.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-sm uppercase tracking-[0.3em]">Pending</span>
                      <span>{stats.documents.pending.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
                      <span>Verification rate</span>
                      <span>{stats.documents.verificationRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Avg time to book</p>
                  <div className="mt-3 text-2xl font-semibold text-slate-200">
                    {stats.analytics.averageHoursToBook > 1
                      ? `${stats.analytics.averageHoursToBook.toFixed(1)} hrs`
                      : `${Math.max(stats.analytics.averageHoursToBook * 60, 1).toFixed(0)} mins`}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">From posting to booking confirmation</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Conversion</p>
                  <div className="mt-3 text-2xl font-semibold text-slate-200">
                    {stats.analytics.conversionRate.toFixed(1)}%
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Booked loads vs. total loads</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Billing queue</p>
                  <div className="mt-3 text-2xl font-semibold text-slate-200">
                    {stats.analytics.readyForBilling.toLocaleString()}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Loads flagged ready for invoicing</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent Sign-ups</h3>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Last 6 accounts created</p>
                </div>
                <Inbox className="h-8 w-8 text-red-300" />
              </div>
              <ul className="mt-6 space-y-3">
                {recentSignups.length ? (
                  recentSignups.map((signup) => (
                    <li
                      key={signup._id}
                      className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{signup.company || signup.email}</span>
                        <span className="text-xs uppercase tracking-[0.4em] text-slate-500">{signup.accountType}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{signup.email}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Joined {new Date(signup.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-500">
                    No recent sign-ups detected.
                  </li>
                )}
              </ul>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/40">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Message Intelligence</h3>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Friend request & chat events</p>
                </div>
                <MessageSquare className="h-6 w-6 text-amber-300" />
              </header>
              <ul className="mt-5 space-y-3 max-h-72 overflow-y-auto pr-1">
                {categorisedLogs.communications.length ? (
                  categorisedLogs.communications.slice(0, 10).map(renderLogItem)
                ) : (
                  <li className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-500">
                    No communication events logged yet.
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/40">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">System Alerts</h3>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Errors • Warnings • Blocks</p>
                </div>
                <AlertOctagon className="h-6 w-6 text-red-300" />
              </header>
              <ul className="mt-5 space-y-3 max-h-72 overflow-y-auto pr-1">
                {categorisedLogs.systemAlerts.length ? (
                  categorisedLogs.systemAlerts.slice(0, 10).map(renderLogItem)
                ) : (
                  <li className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-500">
                    System stable. No critical alerts.
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/40">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Admin Actions Ledger</h3>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Audited changes & exports</p>
                </div>
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
              </header>
              <ul className="mt-5 space-y-3 max-h-72 overflow-y-auto pr-1">
                {categorisedLogs.adminActions.length ? (
                  categorisedLogs.adminActions.slice(0, 10).map(renderLogItem)
                ) : (
                  <li className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-500">
                    Begin managing data to populate the ledger.
                  </li>
                )}
              </ul>
            </div>
          </section>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-14 text-center text-slate-400">
          Unable to retrieve mission intelligence.
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;

