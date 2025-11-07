import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import AdminLayout from './AdminLayout';
import { useAuthStore } from '../../store/authStore';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [viewAsUser, setViewAsUser] = useState(false);

  // Admin control panel floating button (always visible for admin)
  const AdminControlButton = () => {
    if (!isAdmin || isAdminRoute) return null;

    return (
      <div className="fixed bottom-20 md:bottom-6 left-6 z-[9998] flex flex-col gap-2">
        <button
          onClick={() => setViewAsUser(!viewAsUser)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold shadow-2xl transition-all duration-300 ${
            viewAsUser
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
              : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
          }`}
          title={viewAsUser ? 'Switch to Admin View' : 'View as Regular User'}
        >
          <Shield className="h-5 w-5" />
          {viewAsUser ? (
            <>
              <Eye className="h-4 w-4" />
              <span className="text-sm">Admin Mode</span>
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4" />
              <span className="text-sm">User View</span>
            </>
          )}
        </button>
      </div>
    );
  };

  // If user is admin and NOT on admin route and NOT viewing as user, use admin layout
  if (isAdmin && !isAdminRoute && !viewAsUser) {
    return (
      <>
        <AdminLayout>{children}</AdminLayout>
        <AdminControlButton />
      </>
    );
  }

  // Regular layout for non-admin users OR when admin views as user
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <footer className="bg-gray-900 text-white py-8 hidden md:block">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} CargoLume. All rights reserved.</p>
          </div>
        </footer>
        {isAuthenticated && <MobileBottomNav />}
      </div>
      <AdminControlButton />
    </>
  );
};

export default MainLayout;




