import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useWebSocket } from './hooks/useWebSocket';
import { ROUTES } from './utils/constants';
import type { AccountType } from './types/user.types';

// Layout
import MainLayout from './components/layout/MainLayout';
import Notifications from './components/common/Notifications';
import OfflineIndicator from './components/common/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import AdminActivationOverlay from './components/Admin/AdminActivationOverlay';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyEmail from './pages/Auth/VerifyEmail';
import Dashboard from './pages/Dashboard';
import LoadBoard from './pages/LoadBoard';
import PostLoad from './pages/PostLoad';
import Shipments from './pages/Shipments';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import Documents from './pages/Documents';
import SavedSearches from './pages/SavedSearches';
import ActiveSessions from './pages/ActiveSessions';
import Pricing from './pages/Pricing';
import Offline from './pages/Offline';
import SupportChatWidget from './components/SupportChat/SupportChatWidget';
import InstallPrompt from './components/PWA/InstallPrompt';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import UserDetails from './pages/Admin/UserDetails';
import AuditLogs from './pages/Admin/AuditLogs';
import SystemHealth from './pages/Admin/SystemHealth';

// Protected Route Component
import ProtectedRouteComponent from './components/auth/ProtectedRoute';

function ProtectedRoute({ children, allowedAccountTypes, requireAdmin }: { children: React.ReactNode; allowedAccountTypes?: AccountType[]; requireAdmin?: boolean }) {
  return (
    <ProtectedRouteComponent allowedAccountTypes={allowedAccountTypes} requireAdmin={requireAdmin}>
      {children}
    </ProtectedRouteComponent>
  );
}

function App() {
  const { checkAuth } = useAuthStore();
  
  // Initialize WebSocket connection
  useWebSocket();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <Router>
        <Notifications />
        <OfflineIndicator />
        <AdminActivationOverlay />
        <InstallPrompt />
        <SupportChatWidget />
        <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.HOME} element={<MainLayout><Home /></MainLayout>} />
        <Route path={ROUTES.LOGIN} element={<MainLayout><Login /></MainLayout>} />
        <Route path={ROUTES.REGISTER} element={<MainLayout><Register /></MainLayout>} />
        <Route path={ROUTES.VERIFY} element={<MainLayout><VerifyEmail /></MainLayout>} />
        <Route path={ROUTES.PRICING} element={<MainLayout><Pricing /></MainLayout>} />
        <Route path="/offline" element={<Offline />} />
        
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
          path={ROUTES.POST_LOAD}
          element={
            <ProtectedRoute allowedAccountTypes={['broker']}>
              <MainLayout><PostLoad /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SHIPMENTS}
          element={
            <ProtectedRoute allowedAccountTypes={['shipper', 'broker']}>
              <MainLayout><Shipments /></MainLayout>
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
        <Route
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoute>
              <MainLayout><Settings /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MESSAGES}
          element={
            <ProtectedRoute>
              <MainLayout><Messages /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DOCUMENTS}
          element={
            <ProtectedRoute>
              <MainLayout><Documents /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SAVED_SEARCHES}
          element={
            <ProtectedRoute>
              <MainLayout><SavedSearches /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ACTIVE_SESSIONS}
          element={
            <ProtectedRoute>
              <MainLayout><ActiveSessions /></MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_USERS}
          element={
            <ProtectedRoute requireAdmin>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute requireAdmin>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_AUDIT}
          element={
            <ProtectedRoute requireAdmin>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_SYSTEM_HEALTH}
          element={
            <ProtectedRoute requireAdmin>
              <SystemHealth />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
