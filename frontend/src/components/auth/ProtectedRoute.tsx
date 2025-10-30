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
}

/**
 * ProtectedRoute component that checks authentication and account type permissions
 * before rendering child components
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedAccountTypes,
  requireAuth = true,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const { addNotification } = useUIStore();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    addNotification({
      type: 'error',
      message: 'Please log in to access this page.',
    });
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // If specific account types are required
  if (allowedAccountTypes && allowedAccountTypes.length > 0) {
    // Check if user has one of the allowed account types
    if (!user || !hasAccountType(allowedAccountTypes, user.accountType)) {
      addNotification({
        type: 'error',
        message: 'You do not have permission to access this page.',
      });
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
