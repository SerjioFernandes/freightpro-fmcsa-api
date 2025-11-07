import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { ROUTES } from '../../utils/constants';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const passwordValue = password.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      addNotification({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    if (!passwordValue) {
      addNotification({ type: 'error', message: 'Password is required.' });
      return;
    }

    setIsLoading(true);

    try {
      const authenticatedUser = await login(trimmedEmail, passwordValue);
      addNotification({ type: 'success', message: 'Login successful!' });

      if (authenticatedUser?.role === 'admin') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed. Please check your credentials.'
        : 'Login failed. Please check your credentials.';
      addNotification({ 
        type: 'error', 
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black py-12 px-4">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-red-600/30 bg-slate-950/80 shadow-2xl shadow-red-900/40 backdrop-blur-xl">
        <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-red-600/20 blur-3xl" aria-hidden="true"></div>
        <div className="absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-rose-500/10 blur-3xl" aria-hidden="true"></div>

        <div className="relative p-10">
          <div className="text-center mb-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10">
              <LogIn className="h-10 w-10 text-red-300" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-600/30 bg-red-600/15 px-4 py-1 text-xs uppercase tracking-[0.45em] text-red-200">
              Secure Access Gate
            </div>
            <h2 className="mt-4 text-4xl font-bold text-white">Enter Command Network</h2>
            <p className="mt-3 text-sm text-slate-300">
              Authenticate to unlock CargoLume&apos;s mission control suite.
            </p>
          </div>
 
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white shadow-inner shadow-black/40 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>
 
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 pr-12 text-sm text-white shadow-inner shadow-black/40 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/40"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
 
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-red-900/30 transition-all hover:from-red-700 hover:to-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Signing in...
                </span>
              ) : (
                'Authorize Access'
              )}
            </button>
          </form>
 
          <div className="mt-8 rounded-2xl border border-slate-800/60 bg-slate-900/60 px-6 py-5 text-center text-xs text-slate-400">
            Need assistance? Contact your primary administrator to provision access.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


