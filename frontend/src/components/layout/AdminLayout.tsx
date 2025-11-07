import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Activity, FileText, Gauge, LogOut, ArrowLeft, Menu, X, Home } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useState } from 'react';

interface AdminLayoutProps {
  title?: string;
  children: React.ReactNode;
}

const navItems = [
  { to: ROUTES.ADMIN_DASHBOARD, icon: Gauge, label: 'Overview' },
  { to: ROUTES.ADMIN_USERS, icon: Users, label: 'All Users' },
  { to: ROUTES.ADMIN_AUDIT, icon: FileText, label: 'Audit Logs' },
  { to: ROUTES.ADMIN_SYSTEM_HEALTH, icon: Activity, label: 'System Health' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ title, children }) => {
  const { user, logout } = useAuthStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    addNotification({ type: 'info', message: 'Admin logged out successfully.' });
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black border-r border-slate-800">
        <div className="px-6 py-8 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-600/20 text-red-400 p-2 rounded-lg">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Admin Mode</p>
              <p className="text-lg font-semibold text-white">CargoLume Control</p>
            </div>
          </div>
          <Link 
            to={ROUTES.DASHBOARD} 
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to User Dashboard
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    isActive
                      ? 'bg-red-600/20 text-white shadow-lg shadow-red-500/20 border border-red-600/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="px-6 py-6 border-t border-slate-800 space-y-2">
          <Link
            to={ROUTES.DASHBOARD}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 transition-all"
          >
            <Home className="h-5 w-5" />
            <span>Main Dashboard</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600/10 text-red-300 hover:bg-red-600/30 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header with Menu */}
      <div className="lg:hidden bg-gradient-to-r from-slate-900 via-slate-950 to-black border-b border-slate-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600/20 text-red-400 p-2 rounded-lg">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin</p>
              <p className="text-sm font-semibold text-white">Control Panel</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-slate-300 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="px-4 py-4 border-t border-slate-800 space-y-1 bg-slate-950/95">
            <Link
              to={ROUTES.DASHBOARD}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-900/60 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to User Dashboard</span>
            </Link>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? 'bg-red-600/20 text-white border border-red-600/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-300 hover:bg-red-600/20 rounded-lg transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-gradient-to-r from-slate-900 via-slate-950 to-black border-b border-slate-800 sticky top-0 z-40 shadow-2xl shadow-black/20">
          <div className="px-4 sm:px-6 lg:px-10 py-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/10 text-red-300 text-xs font-semibold uppercase tracking-wider border border-red-600/30">
                  <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  Elevated Access
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-white hidden md:block">
                  {title || 'Administrator Console'}
                </h1>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-3 md:px-4 py-2 md:py-3 flex items-center gap-3 shadow-inner shadow-black/40">
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase tracking-widest hidden md:block">Admin</p>
                  <p className="text-sm font-semibold text-slate-200">{user?.email}</p>
                </div>
                <div className="bg-red-600/10 text-red-300 px-2 md:px-3 py-1 md:py-2 rounded-lg text-xs font-semibold uppercase tracking-wider">
                  {user?.role || 'Admin'}
                </div>
              </div>
            </div>
            
            {/* Quick Access Nav - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-red-600/20 text-white border border-red-600/40 shadow-lg shadow-red-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              <div className="flex-1"></div>
              <Link
                to={ROUTES.DASHBOARD}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-700 transition-all"
              >
                <Home className="h-4 w-4" />
                <span>Exit Admin</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-black px-4 sm:px-6 lg:px-10 py-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

