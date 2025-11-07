import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { AdminSystemStats } from '../../types/admin.types';
import { Activity, Users, Truck, MessageSquare, AlertTriangle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminSystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const response = await adminService.getSystemStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        addNotification({ type: 'error', message: 'Failed to load system statistics.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [addNotification]);

  const widgets = stats
    ? [
        {
          title: 'Total Users',
          value: stats.users.total,
          subtext: `${stats.users.admin} admins`,
          icon: Users,
          accent: 'from-red-500/20 to-red-600/10 text-red-300 border-red-600/40',
        },
        {
          title: 'Active Loads',
          value: stats.loads.open,
          subtext: `${stats.loads.total} total`,
          icon: Truck,
          accent: 'from-blue-500/20 to-blue-600/10 text-blue-300 border-blue-600/40',
        },
        {
          title: 'Open Shipments',
          value: stats.shipments.open,
          subtext: `${stats.shipments.total} created`,
          icon: Activity,
          accent: 'from-emerald-500/20 to-emerald-600/10 text-emerald-300 border-emerald-600/40',
        },
        {
          title: 'Messages Sent',
          value: stats.messages.total,
          subtext: 'All time',
          icon: MessageSquare,
          accent: 'from-amber-500/20 to-amber-600/10 text-amber-300 border-amber-600/40',
        },
      ]
    : [];

  return (
    <AdminLayout title="Mission Control Overview">
      {/* Debug Info - Remove after confirming */}
      {import.meta.env.DEV && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-yellow-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Debug Info (Dev Mode Only)
          </p>
          <p className="text-sm text-yellow-200">User Role: {user?.role || 'undefined'}</p>
          <p className="text-sm text-yellow-200">Email: {user?.email || 'undefined'}</p>
          <p className="text-sm text-yellow-200">Is Admin: {user?.role === 'admin' ? 'YES' : 'NO'}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : stats ? (
        <div className="space-y-10">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {widgets.map((widget) => {
              const Icon = widget.icon;
              return (
                <div
                  key={widget.title}
                  className={`rounded-2xl border bg-gradient-to-br ${widget.accent} p-6 shadow-2xl shadow-black/40 backdrop-blur-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{widget.title}</p>
                      <p className="mt-3 text-3xl font-bold text-white">{widget.value.toLocaleString()}</p>
                      <p className="mt-1 text-xs text-slate-400">{widget.subtext}</p>
                    </div>
                    <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/30">
              <h2 className="text-lg font-semibold text-white mb-4">User Distribution</h2>
              <div className="space-y-4">
                {[
                  { label: 'Carriers', value: stats.users.carriers, accent: 'bg-blue-500/20 text-blue-200 border-blue-600/40' },
                  { label: 'Brokers', value: stats.users.brokers, accent: 'bg-emerald-500/20 text-emerald-200 border-emerald-600/40' },
                  { label: 'Shippers', value: stats.users.shippers, accent: 'bg-amber-500/20 text-amber-200 border-amber-600/40' },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl border px-4 py-4 flex items-center justify-between ${item.accent}`}>
                    <span className="text-sm uppercase tracking-[0.3em]">{item.label}</span>
                    <span className="text-xl font-semibold">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/30">
              <h2 className="text-lg font-semibold text-white mb-4">Security Signal</h2>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="rounded-xl border border-red-600/40 bg-red-600/10 px-4 py-3 flex items-start gap-3">
                  <span className="h-2 w-2 rounded-full bg-red-500 mt-2 animate-pulse"></span>
                  <div>
                    <p className="font-semibold text-white">Audit logging enabled</p>
                    <p className="text-xs text-red-200">All admin actions are tracked and immutable.</p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                  <p className="font-semibold text-white">Admin Access Guarded</p>
                  <p className="text-xs text-slate-400">Rate limiting and IP allowlisting shield the admin perimeter.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                  <p className="font-semibold text-white">Generated</p>
                  <p className="text-xs text-slate-400">{new Date(stats.generatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-400">No data available</div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;

