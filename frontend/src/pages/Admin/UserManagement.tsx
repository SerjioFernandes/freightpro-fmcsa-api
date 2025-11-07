import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminService } from '../../services/admin.service';
import type { AdminUser } from '../../types/admin.types';
import UserTable from '../../components/Admin/UserTable';
import RawDataViewer from '../../components/Admin/RawDataViewer';
import UserEditModal from '../../components/Admin/UserEditModal';
import { useUIStore } from '../../store/uiStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CloudDownload, Filter, Search, RefreshCw } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [query, setQuery] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { addNotification } = useUIStore();

  const loadUsers = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await adminService.getUsers({
        page,
        limit: pagination.limit,
        search: query || undefined,
        accountType: accountTypeFilter || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter ? statusFilter === 'active' : undefined,
      });

      if (response.success) {
        setUsers(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      addNotification({ type: 'error', message: 'Unable to load users. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [accountTypeFilter, roleFilter, statusFilter, pagination.limit, query, addNotification]);

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const blob = await adminService.exportUsers(format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export.${format}`;
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      addNotification({ type: 'success', message: `Users exported as ${format.toUpperCase()} successfully.` });
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to export users.' });
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!window.confirm(`Delete user ${user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteUser(user._id);
      addNotification({ type: 'success', message: 'User deleted successfully.' });
      loadUsers(pagination.page);
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to delete user.' });
    }
  };

  const handleUpdate = async (values: Partial<AdminUser>) => {
    if (!editingUser) return;
    try {
      await adminService.updateUser(editingUser._id, values);
      addNotification({ type: 'success', message: 'User updated successfully.' });
      setEditingUser(null);
      loadUsers(pagination.page);
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to update user.' });
    }
  };

  const summary = useMemo(() => {
    const totalAdmins = users.filter((user) => user.role === 'admin').length;
    const suspended = users.filter((user) => !user.isActive).length;
    return { totalAdmins, suspended };
  }, [users]);

  return (
    <AdminLayout title="User Registry Intelligence">
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-5 py-6 shadow-2xl shadow-black/30">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Records in view</p>
            <p className="mt-2 text-3xl font-bold text-white">{pagination.total.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Across {pagination.pages} pages</p>
          </div>
          <div className="rounded-2xl border border-red-600/40 bg-red-600/10 px-5 py-6 shadow-2xl shadow-black/30">
            <p className="text-xs uppercase tracking-[0.35em] text-red-200">Admins</p>
            <p className="mt-2 text-3xl font-bold text-white">{summary.totalAdmins}</p>
            <p className="text-xs text-red-200/80 mt-1">Ensure IP allowlist is configured</p>
          </div>
          <div className="rounded-2xl border border-amber-600/40 bg-amber-600/10 px-5 py-6 shadow-2xl shadow-black/30">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Suspended</p>
            <p className="mt-2 text-3xl font-bold text-white">{summary.suspended}</p>
            <p className="text-xs text-amber-200/80 mt-1">Accounts awaiting review</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-black/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search email, company, DOT, MC..."
                  className="pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <button
                onClick={() => loadUsers(1)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                <Filter className="h-4 w-4" />
                Filters
              </div>
              <select
                value={accountTypeFilter}
                onChange={(event) => setAccountTypeFilter(event.target.value)}
                className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
              >
                <option value="">All roles</option>
                <option value="carrier">Carrier</option>
                <option value="broker">Broker</option>
                <option value="shipper">Shipper</option>
              </select>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
              >
                <option value="">All access</option>
                <option value="admin">Admins</option>
                <option value="user">Standard</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
              >
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              <button
                onClick={() => handleExport('json')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                <CloudDownload className="h-4 w-4" />
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                CSV
              </button>
            </div>
          </div>

          <div className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <UserTable
                users={users}
                isLoading={isLoading}
                onViewRaw={(user) => setSelectedUser(user)}
                onEdit={(user) => setEditingUser(user)}
                onDelete={handleDelete}
              />
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <div>
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadUsers(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1 || isLoading}
                className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => loadUsers(Math.min(pagination.pages, pagination.page + 1))}
                disabled={pagination.page === pagination.pages || isLoading}
                className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedUser && (
        <RawDataViewer data={selectedUser as unknown as Record<string, unknown>} onClose={() => setSelectedUser(null)} />
      )}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdate}
        />
      )}
    </AdminLayout>
  );
};

export default UserManagement;

