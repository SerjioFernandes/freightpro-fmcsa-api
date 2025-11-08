import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import type { AccountType } from '../../types/user.types';
import { ROUTES } from '../../utils/constants';
import { hasAccountType } from '../../utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedAccountTypes?: AccountType[];
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

/**
 * ProtectedRoute component that checks authentication and account type permissions
 * before rendering child components
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedAccountTypes,
  requireAuth = true,
  requireAdmin = false,
}) => {
  const { isAuthenticated, user, isLoading, justLoggedOut, clearLogoutFlag } = useAuthStore();
  const { addNotification } = useUIStore();

  // Wait for auth to load before making routing decisions
  if (isLoading) {
    return null; // Or a loading spinner
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    if (justLoggedOut) {
      clearLogoutFlag();
      return <Navigate to={ROUTES.LOGIN} replace />;
    }
    // Only show notification if not already on login page (to prevent duplicate messages)
    if (!window.location.pathname.includes('/login')) {
      addNotification({
        type: 'error',
        message: 'Please log in to access this page.',
      });
    }
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // If specific account types are required
  if (allowedAccountTypes && allowedAccountTypes.length > 0) {
    // Admin bypasses all account type restrictions
    if (user?.role === 'admin') {
      if (import.meta.env.DEV) {
        console.log('[ProtectedRoute] Admin bypassing account type restriction');
      }
      // Admin has full access - continue
    } else if (!user || !hasAccountType(allowedAccountTypes, user.accountType)) {
      // Check if user has one of the allowed account types
      addNotification({
        type: 'error',
        message: 'You do not have permission to access this page.',
      });
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  if (requireAdmin) {
    if (!user || user.role !== 'admin') {
      if (import.meta.env.DEV) {
        console.log('[ProtectedRoute] Admin check failed:', {
          hasUser: !!user,
          userRole: user?.role,
          userEmail: user?.email,
          requireAdmin,
        });
      }
      addNotification({
        type: 'error',
        message: 'Administrator privileges required.',
      });
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  if (import.meta.env.DEV && requireAdmin) {
    console.log('[ProtectedRoute] Admin check passed:', {
      userRole: user?.role,
      userEmail: user?.email,
    });
  }

  return <>{children}</>;
};

export default ProtectedRoute;
