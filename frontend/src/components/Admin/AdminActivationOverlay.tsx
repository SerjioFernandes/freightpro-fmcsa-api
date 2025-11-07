import { useEffect, useState } from 'react';
import { Crown, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AdminActivationOverlay = () => {
  const [stage, setStage] = useState<'activating' | 'welcome'>('activating');
  const { adminActivation, dismissAdminActivation } = useAuthStore((state) => ({
    adminActivation: state.adminActivation,
    dismissAdminActivation: state.dismissAdminActivation,
  }));

  useEffect(() => {
    if (!adminActivation.isActive) return;

    const activatingTimer = setTimeout(() => {
      setStage('welcome');
    }, 1500);

    const dismissTimer = setTimeout(() => {
      dismissAdminActivation();
      setStage('activating');
    }, 4500);

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
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-center">
              <Crown className="h-20 w-20 text-yellow-400 drop-shadow-[0_0_24px_rgba(250,204,21,0.6)]" />
            </div>
            <h1 className="text-5xl font-bold text-white md:text-6xl">
              Welcome back, Admin
            </h1>
            <p className="text-lg text-slate-300">
              Full system access granted. All operations unlocked.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivationOverlay;


