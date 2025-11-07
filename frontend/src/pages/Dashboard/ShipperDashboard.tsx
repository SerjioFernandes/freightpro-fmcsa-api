import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { shipmentService } from '../../services/shipment.service';
import { dashboardService } from '../../services/dashboard.service';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { Package, TrendingUp, DollarSign, Users, Plus, MapPin, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Shipment, ShipmentRequest } from '../../types/shipment.types';

const ShipperDashboard = () => {
  const { user } = useAuthStore();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [requests, setRequests] = useState<ShipmentRequest[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    loadData();
    loadDashboardStats();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load shipments
      const shipmentsResponse = await shipmentService.getShipments(1, 10);
      if (shipmentsResponse.success) {
        setShipments(shipmentsResponse.shipments || []);
      }

      // Load shipment requests (proposals)
      const requestsResponse = await shipmentService.getShipmentRequests();
      if (requestsResponse.success) {
        setRequests(requestsResponse.requests || []);
      }
    } catch (error: any) {
      // Silently fail - data is optional
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await dashboardService.getStats();
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error: any) {
      // Silently fail - stats are optional
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Use API data if available, fallback to local calculations
  const stats = dashboardData?.stats ? [
    {
      label: 'Shipment Requests',
      value: dashboardData.stats.totalShipments || 0,
      icon: <Package className="h-12 w-12" />,
      color: 'text-orange-accent',
      bgColor: 'bg-orange-accent/10'
    },
    {
      label: 'Active Shipments',
      value: dashboardData.stats.activeShipments || 0,
      icon: <TrendingUp className="h-12 w-12" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10'
    },
    {
      label: 'Broker Proposals',
      value: dashboardData.stats.totalProposals || 0,
      icon: <Users className="h-12 w-12" />,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10'
    },
    {
      label: 'Total Costs',
      value: `$${(dashboardData.stats.totalSpend || 0).toLocaleString()}`,
      icon: <DollarSign className="h-12 w-12" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10'
    },
  ] : [
    {
      label: 'Shipment Requests',
      value: shipments.length,
      icon: <Package className="h-12 w-12" />,
      color: 'text-orange-accent',
      bgColor: 'bg-orange-accent/10'
    },
    {
      label: 'Active Shipments',
      value: shipments.filter(s => s.status === 'open').length,
      icon: <TrendingUp className="h-12 w-12" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10'
    },
    {
      label: 'Broker Proposals',
      value: requests.length,
      icon: <Users className="h-12 w-12" />,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10'
    },
    {
      label: 'Total Costs',
      value: '$0',
      icon: <DollarSign className="h-12 w-12" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900">
            Shipper Dashboard
          </h1>
          <p className="text-xl text-gray-700 mt-2">
            Welcome back, <span className="text-orange-accent font-semibold">{user?.company}</span>! 📦
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="card card-hover group animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-2">
                    {stat.label}
                  </p>
                  <p className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} ${stat.bgColor} p-3 rounded-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Shipment Requests */}
        <div className="card animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-heading font-bold text-gray-900">
              My Shipments
            </h2>
            <Link to={ROUTES.SHIPMENTS} className="btn btn-accent text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New Shipment
            </Link>
          </div>
          
          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner size="lg" className="mx-auto" />
            </div>
          ) : shipments.length > 0 ? (
            <div className="space-y-4">
              {shipments.slice(0, 5).map((shipment, index) => {
                const shipmentRequests = requests.filter(r => r.shipmentId._id === shipment._id);
                return (
                  <div 
                    key={shipment._id} 
                    className="border-2 border-primary-blue/30 rounded-lg p-5 hover:border-orange-accent hover:shadow-lg transition-all duration-200 bg-white animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-heading font-semibold text-gray-900 text-lg">
                            {shipment.title}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            shipment.status === 'open' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {shipment.status?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="h-4 w-4 text-primary-blue flex-shrink-0" />
                          <p className="text-sm">
                            <span className="font-medium">{shipment.pickup.city}, {shipment.pickup.state}</span>
                            {' → '}
                            <span className="font-medium">{shipment.delivery.city}, {shipment.delivery.state}</span>
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {shipment.shipmentId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">
                          {shipmentRequests.length} request{shipmentRequests.length !== 1 ? 's' : ''}
                        </p>
                        <Link to={ROUTES.SHIPMENTS} className="text-primary-blue hover:text-orange-accent font-medium text-sm flex items-center justify-end gap-1">
                          View Details <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">No shipments yet</p>
              <Link to={ROUTES.SHIPMENTS}>
                <button className="btn btn-accent text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Shipment
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Broker Proposals */}
        {requests.length > 0 && (
          <div className="card animate-slide-up mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                Broker Requests
              </h2>
              <Link to={ROUTES.SHIPMENTS} className="text-primary-blue hover:text-orange-accent font-medium flex items-center gap-2 transition-colors">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {requests.slice(0, 3).map((request, index) => (
                <div 
                  key={request._id} 
                  className={`border-2 rounded-lg p-5 hover:shadow-lg transition-all duration-200 animate-fade-in ${
                    request.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                    request.status === 'approved' ? 'border-green-200 bg-green-50' :
                    'border-red-200 bg-red-50'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-heading font-semibold text-gray-900 text-lg">
                          {request.brokerId.company}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      {request.brokerMessage && (
                        <p className="text-sm text-gray-700 mb-2">{request.brokerMessage}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        For shipment: {request.shipmentId.title}
                      </p>
                    </div>
                    <div className="text-right">
                      {request.status === 'pending' && (
                        <Link
                          to={ROUTES.SHIPMENTS}
                          className="btn btn-primary text-sm"
                        >
                          Review
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipperDashboard;
