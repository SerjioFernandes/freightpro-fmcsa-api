import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminService } from '../../services/admin.service';
import type { AdminUser } from '../../types/admin.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useUIStore();

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await adminService.getUser(id);
        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        addNotification({ type: 'error', message: 'Failed to load user.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [id, addNotification]);

  return (
    <AdminLayout title="User Intelligence Report">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : user ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-black/30">
            <h2 className="text-xl font-semibold text-white mb-4">Identity Summary</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Company</p>
                <p className="mt-1 text-lg text-slate-200">{user.company}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</p>
                <p className="mt-1 text-lg text-slate-200">{user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Account Type</p>
                <p className="mt-1 text-lg text-slate-200">{user.accountType?.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Role</p>
                <p className="mt-1 text-lg text-slate-200">{user.role?.toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-black/30">
            <h2 className="text-xl font-semibold text-white mb-4">Raw Document</h2>
            <pre className="max-h-[60vh] overflow-auto text-sm text-emerald-200 bg-slate-900/60 border border-slate-800 rounded-xl p-4 font-mono whitespace-pre-wrap">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="text-slate-400">User not found.</div>
      )}
    </AdminLayout>
  );
};

export default UserDetails;


