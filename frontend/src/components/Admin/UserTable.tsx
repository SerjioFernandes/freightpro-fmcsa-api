import { Fragment } from 'react';
import type { AdminUser } from '../../types/admin.types';
import { ShieldCheck, Shield } from 'lucide-react';

interface UserTableProps {
  users: AdminUser[];
  isLoading?: boolean;
  onViewRaw: (user: AdminUser) => void;
  onEdit?: (user: AdminUser) => void;
  onDelete?: (user: AdminUser) => void;
}

const headers = [
  'Company',
  'Email',
  'Account Type',
  'Role',
  'Status',
  'USDOT/MC',
  'Created',
  'Actions',
];

const UserTable: React.FC<UserTableProps> = ({ users, isLoading = false, onViewRaw, onEdit, onDelete }) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-900/80">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-950/60 divide-y divide-slate-900">
            {isLoading ? (
              <tr>
                <td colSpan={headers.length} className="px-5 py-10 text-center text-slate-500">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-5 py-10 text-center text-slate-500">
                  No users found with the current filters.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isAdmin = user.role === 'admin';
                const statusBadge = user.isActive ? 'Active' : 'Suspended';
                return (
                  <Fragment key={user._id}>
                    <tr className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-semibold ${
                              isAdmin ? 'bg-red-600/20 text-red-400' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {user.company?.slice(0, 2)?.toUpperCase() || '??'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-100">{user.company || 'N/A'}</div>
                            <div className="text-xs text-slate-500">ID: {user._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-200">{user.email}</div>
                        <div className="text-xs text-slate-500">{user.phone}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-300">
                        {user.accountType?.toUpperCase()}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            isAdmin
                              ? 'bg-red-600/20 text-red-300 border border-red-600/40'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                          {user.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {statusBadge}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-300">
                        <div className="text-sm">USDOT: {user.usdotNumber || '—'}</div>
                        <div className="text-xs text-slate-500">MC: {user.mcNumber || '—'}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-400 text-sm">
                        <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewRaw(user)}
                            className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all"
                          >
                            View
                          </button>
                          {onEdit && (
                            <button
                              onClick={() => onEdit(user)}
                              className="px-3 py-1.5 rounded-md bg-blue-600/20 text-blue-300 text-xs font-semibold hover:bg-blue-600/40 border border-blue-500/40 transition-all"
                            >
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(user)}
                              className="px-3 py-1.5 rounded-md bg-red-600/20 text-red-300 text-xs font-semibold hover:bg-red-600/40 border border-red-500/40 transition-all"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;

