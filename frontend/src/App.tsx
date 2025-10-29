import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { ROUTES } from './utils/constants';

// Layout
import MainLayout from './components/layout/MainLayout';
import Notifications from './components/common/Notifications';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyEmail from './pages/Auth/VerifyEmail';
import Dashboard from './pages/Dashboard';
import LoadBoard from './pages/LoadBoard';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Notifications />
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.HOME} element={<MainLayout><Home /></MainLayout>} />
        <Route path={ROUTES.LOGIN} element={<MainLayout><Login /></MainLayout>} />
        <Route path={ROUTES.REGISTER} element={<MainLayout><Register /></MainLayout>} />
        <Route path={ROUTES.VERIFY} element={<MainLayout><VerifyEmail /></MainLayout>} />
        <Route path={ROUTES.PRICING} element={<MainLayout><Pricing /></MainLayout>} />
        
        {/* Protected Routes */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <MainLayout><Dashboard /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.LOAD_BOARD}
          element={
            <ProtectedRoute>
              <MainLayout><LoadBoard /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <MainLayout><Profile /></MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
