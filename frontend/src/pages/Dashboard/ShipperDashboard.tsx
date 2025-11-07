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
  const [_isLoadingStats, setIsLoadingStats] = useState(true);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-3 sm:px-4 py-5 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Shipper Command Center
              </h1>
              <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 px-4 py-2 rounded-full shadow-sm">
                <span className="text-xs sm:text-sm md:text-base font-semibold text-blue-900">
                  {user?.company}
                </span>
              </div>
            </div>
            <Link to={ROUTES.SHIPMENTS} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hidden md:flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Shipment
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-xl shadow-sm`}>
                    <div className={`${stat.color} scale-90 md:scale-100`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">
                  {stat.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Shipment Requests */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 md:p-7">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Active Shipments
            </h2>
            <Link to={ROUTES.SHIPMENTS} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-sm md:text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">Create New Shipment</span>
              <span className="md:hidden">New</span>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner size="lg" className="mx-auto" />
            </div>
          ) : shipments.length > 0 ? (
            <div className="space-y-4">
              {shipments.slice(0, 5).map((shipment) => {
                const shipmentRequests = requests.filter(r => r.shipmentId._id === shipment._id);
                return (
                  <div 
                    key={shipment._id} 
                    className="border border-gray-200 rounded-xl p-5 md:p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                            {shipment.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            shipment.status === 'open' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' : 
                            'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
                          }`}>
                            {shipment.status?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <p className="text-sm md:text-base">
                            {shipment.pickup.city}, {shipment.pickup.state} → {shipment.delivery.city}, {shipment.delivery.state}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            ID: {shipment.shipmentId}
                          </span>
                          <span className="text-xs font-medium text-blue-600">
                            {shipmentRequests.length} request{shipmentRequests.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Link 
                          to={ROUTES.SHIPMENTS} 
                          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                          Details <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 md:py-20">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Package className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
              </div>
              <p className="text-gray-700 text-base md:text-lg font-semibold mb-2">No active shipments</p>
              <p className="text-gray-500 text-sm mb-6">Create your first shipment to get started</p>
              <Link to={ROUTES.SHIPMENTS}>
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base flex items-center gap-2 mx-auto">
                  <Plus className="h-5 w-5" />
                  Create Shipment
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Broker Requests */}
        {requests.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 md:p-7 mt-6">
            <div className="flex justify-between items-center mb-5 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Pending Requests
              </h2>
              <Link to={ROUTES.SHIPMENTS} className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1 transition-all duration-300 hover:gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {requests.slice(0, 3).map((request) => (
                <div 
                  key={request._id} 
                  className={`border-2 rounded-xl p-5 hover:shadow-lg transition-all duration-300 ${
                    request.status === 'pending' ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100/50 hover:border-yellow-300' :
                    request.status === 'approved' ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 hover:border-green-300' :
                    'border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 hover:border-red-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                          {request.brokerId.company}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          request.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                          request.status === 'approved' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                          'bg-gradient-to-r from-red-400 to-red-500 text-white'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      {request.brokerMessage && (
                        <p className="text-sm md:text-base text-gray-700 mb-2 line-clamp-2">{request.brokerMessage}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Shipment: {request.shipmentId.title}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {request.status === 'pending' && (
                        <Link
                          to={ROUTES.SHIPMENTS}
                          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-semibold text-xs md:text-sm shadow-md hover:shadow-lg transition-all duration-300"
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
