import { useEffect } from 'react';
import { useLoadStore } from '../../store/loadStore';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { Truck, DollarSign, TrendingUp, Package, MapPin, ArrowRight } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CarrierDashboard = () => {
  const { user } = useAuthStore();
  const { loads, isLoading, fetchLoads } = useLoadStore();

  useEffect(() => {
    fetchLoads(1, 10);
  }, [fetchLoads]);

  // Filter booked loads for this carrier
  const bookedLoads = loads.filter(load => load.bookedBy === user?.id);

  // Calculate stats
  const totalBookedLoads = bookedLoads.length;
  const totalEarnings = bookedLoads.reduce((sum, load) => sum + (load.rate || 0), 0);
  const totalMiles = bookedLoads.reduce((sum, load) => sum + (load.distance || 0), 0);

  const stats = [
    {
      label: 'Booked Loads',
      value: totalBookedLoads,
      icon: <Package className="h-12 w-12" />,
      color: 'text-orange-accent',
      bgColor: 'bg-orange-accent/10'
    },
    {
      label: 'Total Earnings',
      value: `$${totalEarnings.toLocaleString()}`,
      icon: <DollarSign className="h-12 w-12" />,
      color: 'text-primary-blue',
      bgColor: 'bg-primary-blue/10'
    },
    {
      label: 'Total Miles',
      value: totalMiles.toLocaleString(),
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900">
            Carrier Dashboard
          </h1>
          <p className="text-xl text-gray-700 mt-2">
            Welcome back, <span className="text-orange-accent font-semibold">{user?.company}</span>! 🚛
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
          
          {isLoading ? (
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
