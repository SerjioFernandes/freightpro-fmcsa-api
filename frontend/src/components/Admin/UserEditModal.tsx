import { useState } from 'react';
import type { AdminUser } from '../../types/admin.types';

interface UserEditModalProps {
  user: AdminUser;
  onClose: () => void;
  onSubmit: (values: Partial<AdminUser>) => Promise<void>;
}

const accountTypes = ['carrier', 'broker', 'shipper'] as const;
const roles = ['user', 'admin'] as const;
const subscriptionPlans = ['free', 'ultima', 'premium'] as const;

type FormState = {
  phone: string;
  accountType: AdminUser['accountType'];
  role: AdminUser['role'];
  subscriptionPlan: string;
  isActive: boolean;
  usdotNumber: string;
  mcNumber: string;
};

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSubmit }) => {
  const [formValues, setFormValues] = useState<FormState>({
    phone: user.phone || '',
    accountType: user.accountType ?? 'carrier',
    role: user.role ?? 'user',
    subscriptionPlan: user.subscriptionPlan ?? 'ultima',
    isActive: Boolean(user.isActive),
    usdotNumber: user.usdotNumber ?? '',
    mcNumber: user.mcNumber ?? '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const key = name as keyof FormState;
    const nextValue =
      type === 'checkbox'
        ? (event.target as HTMLInputElement).checked
        : (value as FormState[keyof FormState]);
    setFormValues((prev) => ({
      ...prev,
      [key]: nextValue,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Partial<AdminUser> = {
        phone: formValues.phone,
        accountType: formValues.accountType,
        role: formValues.role,
        subscriptionPlan: formValues.subscriptionPlan,
        isActive: formValues.isActive,
        usdotNumber: formValues.usdotNumber,
        mcNumber: formValues.mcNumber,
      };
      await onSubmit(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] flex items-center justify-center px-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 w-full max-w-3xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Edit User</h3>
              <p className="text-xs uppercase tracking-widest text-slate-500">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
          <div className="px-6 py-6 space-y-6 bg-slate-950/90">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase text-slate-400 tracking-widest">Phone</span>
                <input
                  type="text"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase text-slate-400 tracking-widest">Account Type</span>
                <select
                  name="accountType"
                  value={formValues.accountType}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {accountTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase text-slate-400 tracking-widest">Role</span>
                <select
                  name="role"
                  value={formValues.role}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase text-slate-400 tracking-widest">Subscription</span>
                <select
                  name="subscriptionPlan"
                  value={formValues.subscriptionPlan}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {subscriptionPlans.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase text-slate-400 tracking-widest">USDOT Number</span>
                <input
                  type="text"
                  name="usdotNumber"
                  value={formValues.usdotNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase text-slate-400 tracking-widest">MC Number</span>
                <input
                  type="text"
                  name="mcNumber"
                  value={formValues.mcNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formValues.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-red-500 border-slate-600 bg-slate-900 rounded"
              />
              <span className="text-sm text-slate-200">Account is active and allowed to sign in</span>
            </label>
          </div>
          <div className="px-6 py-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;

