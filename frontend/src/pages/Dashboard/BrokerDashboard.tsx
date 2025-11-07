import { useEffect, useState } from 'react';
import { useLoadStore } from '../../store/loadStore';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/dashboard.service';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { Plus, Package, Users, DollarSign, MapPin } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BarChart from '../../components/Analytics/BarChart';

const BrokerDashboard = () => {
  const { user } = useAuthStore();
  const { loads, fetchLoads, isLoading } = useLoadStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchLoads(1, 10);
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchLoads]);

  const loadDashboardData = async () => {
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

  // Filter loads posted by this broker (check if postedBy is object or ID)
  const postedLoads = loads.filter(load => {
    const postedById = typeof load.postedBy === 'object' ? load.postedBy?._id : load.postedBy;
    return postedById === user?.id;
  });
  const activeLoads = postedLoads.filter(load => load.status === 'available');
  const bookedLoads = postedLoads.filter(load => load.status === 'booked');

  // Use API data if available, fallback to local calculations
  const stats = dashboardData?.stats ? [
    {
      label: 'Posted Loads',
      value: dashboardData.stats.totalPosted || 0,
      icon: <Package className="h-12 w-12" />,
      color: 'text-orange-accent',
      bgColor: 'bg-orange-accent/10'
    },
    {
      label: 'Active Loads',
      value: dashboardData.stats.activeLoads || 0,
      icon: <Package className="h-12 w-12" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10'
    },
    {
      label: 'Carrier Requests',
      value: dashboardData.stats.carrierRequests || 0,
      icon: <Users className="h-12 w-12" />,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10'
    },
    {
      label: 'Total Revenue',
      value: `$${(dashboardData.stats.potentialRevenue || 0).toLocaleString()}`,
      icon: <DollarSign className="h-12 w-12" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10'
    },
  ] : [
    {
      label: 'Posted Loads',
      value: postedLoads.length,
      icon: <Package className="h-12 w-12" />,
      color: 'text-orange-accent',
      bgColor: 'bg-orange-accent/10'
    },
    {
      label: 'Active Loads',
      value: activeLoads.length,
      icon: <Package className="h-12 w-12" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10'
    },
    {
      label: 'Carrier Requests',
      value: bookedLoads.length,
      icon: <Users className="h-12 w-12" />,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10'
    },
    {
      label: 'Total Revenue',
      value: `$${bookedLoads.reduce((sum, load) => sum + (load.rate || 0), 0).toLocaleString()}`,
      icon: <DollarSign className="h-12 w-12" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10'
    },
  ];

  // Prepare chart data for loads time series
  const loadsChartData = dashboardData?.timeSeries?.loads ? {
    labels: dashboardData.timeSeries.loads.map((item: any) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Loads Posted',
      data: dashboardData.timeSeries.loads.map((item: any) => item.count),
      backgroundColor: 'rgba(37, 99, 235, 0.8)',
      borderColor: '#2563eb',
      borderWidth: 1
    }]
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Dashboard Overview
              </h1>
              <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm md:text-base font-semibold text-blue-900">
                  {user?.company}
                </span>
              </div>
            </div>
            <Link to={ROUTES.POST_LOAD} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hidden md:flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Post Load
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 p-5 md:p-6 transition-all duration-300 hover:-translate-y-1"
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

        {/* Analytics Section */}
        {loadsChartData && (
          <div className="card mb-8 animate-slide-up">
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
              Loads Posted Over Time
            </h3>
            <BarChart data={loadsChartData} height={300} />
          </div>
        )}

        {/* Top Equipment */}
        {dashboardData?.topEquipment && dashboardData.topEquipment.length > 0 && (
          <div className="card mb-8 animate-slide-up">
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
              Most Posted Equipment Types
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {dashboardData.topEquipment.map((item: any) => (
                <div
                  key={item.type}
                  className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary-blue transition-colors"
                >
                  <p className="font-semibold text-gray-900 mb-1">{item.type}</p>
                  <p className="text-2xl font-bold text-primary-blue">{item.count}</p>
                  <p className="text-xs text-gray-500 mt-1">loads posted</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posted Loads */}
        <div className="card animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-heading font-bold text-gray-900">
              My Posted Loads
            </h2>
            <Link to={ROUTES.POST_LOAD} className="text-primary-blue hover:text-orange-accent font-medium flex items-center gap-2 transition-colors">
              Post New Load <Plus className="h-4 w-4" />
            </Link>
          </div>
          
          {isLoading || isLoadingStats ? (
            <div className="py-16">
              <LoadingSpinner size="lg" className="mx-auto" />
            </div>
          ) : postedLoads.length > 0 ? (
            <div className="space-y-4">
              {postedLoads.slice(0, 5).map((load, index) => (
                <div 
                  key={load._id} 
                  className="border-2 border-primary-blue/30 rounded-lg p-5 hover:border-orange-accent hover:shadow-lg transition-all duration-200 bg-white animate-fade-in card-hover"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-gray-900 text-lg mb-2">
                        {load.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 text-primary-blue flex-shrink-0" />
                        <p className="text-sm">
                          <span className="font-medium">{load.origin?.city}, {load.origin?.state}</span>
                          {' → '}
                          <span className="font-medium">{load.destination?.city}, {load.destination?.state}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-heading font-bold text-orange-accent">
                        ${load.rate?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {load.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              title="No Posted Loads Yet"
              description="Get started by posting your first load to connect with carriers."
              action={
                <Link to={ROUTES.POST_LOAD}>
                  <button className="btn btn-primary">
                    <Plus className="h-5 w-5" />
                    Post Your First Load
                  </button>
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;
