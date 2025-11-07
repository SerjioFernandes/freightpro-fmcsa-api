import React from 'react';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import { useAuthStore } from '../../store/authStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

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




