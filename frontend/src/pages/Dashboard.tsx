import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import CarrierDashboard from './Dashboard/CarrierDashboard';
import BrokerDashboard from './Dashboard/BrokerDashboard';
import ShipperDashboard from './Dashboard/ShipperDashboard';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';
import { ROUTES } from '../utils/constants';

/**
 * Main Dashboard component that routes to account-specific dashboards
 * based on the user's account type
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  
  // Enable real-time updates for dashboard
  useRealTimeUpdates();

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-600/40 bg-slate-950/80 p-10 text-center shadow-2xl shadow-red-900/40">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/20">
            <ShieldAlert className="h-8 w-8 text-red-200" />
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.5em] text-red-200/80">Administrator Access</p>
          <h1 className="mt-4 text-3xl font-bold text-white">Mission Control Dashboard</h1>
          <p className="mt-3 text-sm text-slate-300">
            You&apos;re signed in with elevated privileges. Jump into the admin console to oversee live operations,
            messaging events, alerts, and user onboarding.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              to={ROUTES.ADMIN_DASHBOARD}
              className="inline-flex items-center gap-3 rounded-2xl border border-red-600/50 bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-red-900/30 transition-all hover:from-red-700 hover:to-red-800"
            >
              Enter Admin Console
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-slate-500">
              Need the standard view? Navigate through the top menu to inspect user-facing pages.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on account type
  if (user?.accountType === 'carrier') {
    return <CarrierDashboard />;
  }

  if (user?.accountType === 'broker') {
    return <BrokerDashboard />;
  }

  if (user?.accountType === 'shipper') {
    return <ShipperDashboard />;
  }

  // Fallback for unknown account type or no user
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">Please log in to view your dashboard.</p>
      </div>
    </div>
  );
};

export default Dashboard;