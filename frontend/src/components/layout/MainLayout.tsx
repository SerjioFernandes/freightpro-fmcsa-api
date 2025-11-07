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
  const pathname = location.pathname;

  const adminPageTitle = React.useMemo(() => {
    const normalized = pathname.replace(/\/$/, '') || '/';
    const titleMap: Record<string, string> = {
      '/': 'Public Site Overview',
      '/login': 'Authentication Console',
      '/register': 'Onboarding Flow',
      '/verify-email': 'Verification Control',
      '/pricing': 'Pricing Intelligence',
      '/dashboard': 'Mission Dashboard',
      '/load-board': 'Load Board Control',
      '/post-load': 'Load Creation Station',
      '/shipments': 'Shipment Command Center',
      '/profile': 'Identity Management',
      '/settings': 'Configuration Suite',
      '/messages': 'Communications Hub',
      '/documents': 'Document Vault',
      '/saved-searches': 'Discovery Intelligence',
      '/active-sessions': 'Session Monitor',
    };

    if (normalized.startsWith('/admin')) {
      return undefined;
    }

    return titleMap[normalized] || 'Administrator Console';
  }, [pathname]);

  if (isAdmin) {
    return <AdminLayout title={adminPageTitle}>{children}</AdminLayout>;
  }

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




