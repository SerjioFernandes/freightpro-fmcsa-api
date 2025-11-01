import { useAuthStore } from '../store/authStore';
import CarrierDashboard from './Dashboard/CarrierDashboard';
import BrokerDashboard from './Dashboard/BrokerDashboard';
import ShipperDashboard from './Dashboard/ShipperDashboard';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';

/**
 * Main Dashboard component that routes to account-specific dashboards
 * based on the user's account type
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  
  // Enable real-time updates for dashboard
  useRealTimeUpdates();

  // Route to appropriate dashboard based on account type
  if (user?.accountType === 'carrier') {
    return <CarrierDashboard />;
  }

  if (user?.accountType === 'broker') {
    return <BrokerDashboard />;
  }

  if (user?.accountType === 'shipper') {
    return <ShipperDashboard />;
  }

  // Fallback for unknown account type or no user
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">Please log in to view your dashboard.</p>
      </div>
    </div>
  );
};

export default Dashboard;