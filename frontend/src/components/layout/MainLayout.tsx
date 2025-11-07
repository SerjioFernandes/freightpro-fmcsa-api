import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import AdminLayout from './AdminLayout';
import { useAuthStore } from '../../store/authStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');

  // If user is admin and NOT already on an admin route, use admin layout everywhere
  if (isAdmin && !isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Regular layout for non-admin users
  return (
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
  );
};

export default MainLayout;




