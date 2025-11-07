import { useEffect } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AdminActivationOverlay = () => {
  const { adminActivation, dismissAdminActivation } = useAuthStore((state) => ({
    adminActivation: state.adminActivation,
    dismissAdminActivation: state.dismissAdminActivation,
  }));

  useEffect(() => {
    if (!adminActivation.isActive) return;

    const timer = setTimeout(() => {
      dismissAdminActivation();
    }, 2200);

    return () => clearTimeout(timer);
  }, [adminActivation.isActive, dismissAdminActivation]);

  if (!adminActivation.isActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center px-6">
      <div className="relative w-full max-w-xl rounded-3xl border border-red-600/40 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-10 shadow-2xl shadow-red-900/30 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" aria-hidden="true"></div>
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" aria-hidden="true"></div>

        <div className="relative flex flex-col items-center gap-6 text-center">
          <div className="flex items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 p-4">
            <ShieldAlert className="h-10 w-10 text-red-300" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-red-300/80">High-Privilege Session</p>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold text-white">
              {adminActivation.title || 'Admin Mode Activated'}
            </h1>
            <p className="mt-3 text-base md:text-lg text-slate-300">
              {adminActivation.subtitle || 'Welcome back, Admin'}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/80 px-6 py-3 text-sm text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin text-red-300" />
            Establishing secure channel…
          </div>
          <button
            type="button"
            onClick={dismissAdminActivation}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-all hover:from-red-700 hover:to-red-800"
          >
            Enter Command Center
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminActivationOverlay;


