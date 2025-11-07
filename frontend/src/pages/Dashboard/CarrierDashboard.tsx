import { useEffect, useState } from 'react';
import { useLoadStore } from '../../store/loadStore';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/dashboard.service';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { Truck, DollarSign, TrendingUp, Package, MapPin, ArrowRight, TrendingDown, Activity } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import LineChart from '../../components/Analytics/LineChart';
import BarChart from '../../components/Analytics/BarChart';

const CarrierDashboard = () => {
  const { user } = useAuthStore();
  const { loads, isLoading, fetchLoads } = useLoadStore();
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

  // Filter booked loads for this carrier (check if bookedBy is object or ID)
  const bookedLoads = loads.filter(load => {
    const bookedById = typeof load.bookedBy === 'object' ? load.bookedBy?._id : load.bookedBy;
    return bookedById === user?.id;
  });

  // Use API data if available, fallback to local calculations
  const stats = dashboardData?.stats ? [
    {
      label: 'Booked Loads',
      value: dashboardData.stats.totalBooked || 0,
      icon: <Package className="h-12 w-12" />,
      color: 'text-orange-accent',
      bgColor: 'bg-orange-accent/10'
    },
    {
      label: 'Total Earnings',
      value: `$${(dashboardData.stats.totalEarnings || 0).toLocaleString()}`,
      icon: <DollarSign className="h-12 w-12" />,
      color: 'text-primary-blue',
      bgColor: 'bg-primary-blue/10'
    },
    {
      label: 'Total Miles',
      value: (dashboardData.stats.totalMiles || 0).toLocaleString(),
      icon: <TrendingUp className="h-12 w-12" />,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10'
    },
    {
      label: 'Rating',
      value: dashboardData.stats.rating || '5.0',
      icon: <TrendingUp className="h-12 w-12" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10'
    },
  ] : [
    {
      label: 'Booked Loads',
      value: bookedLoads.length,
      icon: <Package className="h-12 w-12" />,
      color: 'text-orange-accent',
      bgColor: 'bg-orange-accent/10'
    },
    {
      label: 'Total Earnings',
      value: `$${bookedLoads.reduce((sum, load) => sum + (load.rate || 0), 0).toLocaleString()}`,
      icon: <DollarSign className="h-12 w-12" />,
      color: 'text-primary-blue',
      bgColor: 'bg-primary-blue/10'
    },
    {
      label: 'Total Miles',
      value: bookedLoads.reduce((sum, load) => sum + (load.distance || 0), 0).toLocaleString(),
      icon: <TrendingUp className="h-12 w-12" />,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10'
    },
    {
      label: 'Rating',
      value: '5.0',
      icon: <TrendingUp className="h-12 w-12" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10'
    },
  ];

  // Prepare chart data
  const revenueChartData = dashboardData?.timeSeries?.revenue ? {
    labels: dashboardData.timeSeries.revenue.map((item: any) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Revenue',
      data: dashboardData.timeSeries.revenue.map((item: any) => item.value),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4
    }]
  } : null;

  const loadCountChartData = dashboardData?.timeSeries?.loads ? {
    labels: dashboardData.timeSeries.loads.map((item: any) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Loads Booked',
      data: dashboardData.timeSeries.loads.map((item: any) => item.count),
      backgroundColor: 'rgba(255, 106, 61, 0.8)',
      borderColor: '#ff6a3d',
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
            <Link to={ROUTES.LOAD_BOARD} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hidden md:flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Browse Loads
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat) => (
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
        {dashboardData?.analytics && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend */}
            {dashboardData.analytics.revenue && (
              <div className="card animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-heading font-bold text-gray-900">
                    Revenue Trend
                  </h3>
                  <div className="flex items-center gap-2">
                    {dashboardData.analytics.revenue.trend === 'up' && (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    )}
                    {dashboardData.analytics.revenue.trend === 'down' && (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    {dashboardData.analytics.revenue.trend === 'stable' && (
                      <Activity className="h-5 w-5 text-gray-600" />
                    )}
                    <span className={`text-sm font-semibold ${
                      dashboardData.analytics.revenue.trend === 'up' ? 'text-green-600' :
                      dashboardData.analytics.revenue.trend === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {dashboardData.analytics.revenue.change > 0 ? '+' : ''}
                      {dashboardData.analytics.revenue.change}%
                    </span>
                  </div>
                </div>
                {revenueChartData && <LineChart data={revenueChartData} height={250} />}
              </div>
            )}

            {/* Loads Trend */}
            {dashboardData.analytics.loads && (
              <div className="card animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-heading font-bold text-gray-900">
                    Loads Activity
                  </h3>
                  <div className="flex items-center gap-2">
                    {dashboardData.analytics.loads.trend === 'up' && (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    )}
                    {dashboardData.analytics.loads.trend === 'down' && (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    {dashboardData.analytics.loads.trend === 'stable' && (
                      <Activity className="h-5 w-5 text-gray-600" />
                    )}
                    <span className={`text-sm font-semibold ${
                      dashboardData.analytics.loads.trend === 'up' ? 'text-green-600' :
                      dashboardData.analytics.loads.trend === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {dashboardData.analytics.loads.change > 0 ? '+' : ''}
                      {dashboardData.analytics.loads.change}%
                    </span>
                  </div>
                </div>
                {loadCountChartData && <BarChart data={loadCountChartData} height={250} />}
              </div>
            )}
          </div>
        )}

        {/* Top Equipment */}
        {dashboardData?.topEquipment && dashboardData.topEquipment.length > 0 && (
          <div className="card mb-8 animate-slide-up">
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
              Top Equipment Types
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {dashboardData.topEquipment.map((item: any) => (
                <div
                  key={item.type}
                  className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary-blue transition-colors"
                >
                  <p className="font-semibold text-gray-900 mb-1">{item.type}</p>
                  <p className="text-2xl font-bold text-primary-blue">{item.count}</p>
                  <p className="text-xs text-gray-500 mt-1">loads booked</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booked Loads */}
        <div className="card animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-heading font-bold text-gray-900">
              My Booked Loads
            </h2>
            <Link to={ROUTES.LOAD_BOARD} className="text-primary-blue hover:text-orange-accent font-medium flex items-center gap-2 transition-colors">
              Browse More Loads <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {isLoading || isLoadingStats ? (
            <div className="py-16">
              <LoadingSpinner size="lg" className="mx-auto" />
            </div>
          ) : bookedLoads.length > 0 ? (
            <div className="space-y-4">
              {bookedLoads.slice(0, 5).map((load, index) => (
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
                        {load.distance} miles
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Truck className="h-8 w-8" />}
              title="No Booked Loads Yet"
              description="Start browsing our load board to find freight opportunities that match your capacity."
              action={
                <Link to={ROUTES.LOAD_BOARD}>
                  <button className="btn btn-primary">
                    Browse Load Board
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

export default CarrierDashboard;
