import { useEffect, useState } from 'react';
import { Crown, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AdminActivationOverlay = () => {
  const [stage, setStage] = useState<'activating' | 'welcome'>('activating');
  const adminActivation = useAuthStore((state) => state.adminActivation);
  const dismissAdminActivation = useAuthStore((state) => state.dismissAdminActivation);

  useEffect(() => {
    if (!adminActivation.isActive) return;

    // Show "Activating Admin Mode" for 2.5 seconds
    const activatingTimer = setTimeout(() => {
      setStage('welcome');
    }, 2500);

    // Show "Welcome back, Admin" for 3.5 seconds, then dismiss
    const dismissTimer = setTimeout(() => {
      dismissAdminActivation();
      setStage('activating');
    }, 6000);

    return () => {
      clearTimeout(activatingTimer);
      clearTimeout(dismissTimer);
    };
  }, [adminActivation.isActive, dismissAdminActivation]);

  if (!adminActivation.isActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-slate-950/98 px-6 backdrop-blur-3xl">
      <div className="relative flex flex-col items-center text-center">
        {stage === 'activating' ? (
          <div className="animate-fade-in space-y-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-red-400" />
            </div>
            <h1 className="text-2xl font-semibold uppercase tracking-[0.5em] text-red-200">
              Activating Admin Mode
            </h1>
          </div>
        ) : (
          <div className="animate-fade-in space-y-8">
            <div className="flex items-center justify-center">
              <Crown className="h-32 w-32 text-yellow-400 animate-pulse drop-shadow-[0_0_40px_rgba(250,204,21,0.9)]" />
            </div>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-300 md:text-8xl animate-pulse drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]">
              Welcome back, Admin
            </h1>
            <p className="text-xl text-emerald-200/90 font-semibold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              Full system access granted. All operations unlocked.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivationOverlay;


