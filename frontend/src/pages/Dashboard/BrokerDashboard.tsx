import { useEffect } from 'react';
import { useLoadStore } from '../../store/loadStore';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { Plus, Package, Users, DollarSign, MapPin } from 'lucide-react';

const BrokerDashboard = () => {
  const { user } = useAuthStore();
  const { loads, fetchLoads } = useLoadStore();

  useEffect(() => {
    fetchLoads(1, 10);
  }, [fetchLoads]);

  // Filter loads posted by this broker
  const postedLoads = loads.filter(load => load.postedBy?._id === user?.id);
  const activeLoads = postedLoads.filter(load => load.status === 'available');
  const bookedLoads = postedLoads.filter(load => load.status === 'booked');

  // Calculate stats
  const totalPosted = postedLoads.length;
  const totalActive = activeLoads.length;
  const carrierRequests = bookedLoads.length; // Count of carrier requests
  const totalRevenue = bookedLoads.reduce((sum, load) => sum + (load.rate || 0), 0);

  const stats = [
    {
      label: 'Posted Loads',
      value: totalPosted,
      icon: <Package className="h-12 w-12" />,
      color: 'text-orange-accent',
      bgColor: 'bg-orange-accent/10'
    },
    {
      label: 'Active Loads',
      value: totalActive,
      icon: <Package className="h-12 w-12" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10'
    },
    {
      label: 'Carrier Requests',
      value: carrierRequests,
      icon: <Users className="h-12 w-12" />,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10'
    },
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
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
            Broker Dashboard
          </h1>
          <p className="text-xl text-gray-700 mt-2">
            Welcome back, <span className="text-orange-accent font-semibold">{user?.company}</span>! 🤝
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

        {/* Posted Loads */}
        <div className="card animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-heading font-bold text-gray-900">
              My Posted Loads
            </h2>
            <Link to={ROUTES.POST_LOAD} className="btn btn-accent text-white">
              <Plus className="h-4 w-4 mr-2" />
              Post New Load
            </Link>
          </div>
          
          {postedLoads.length > 0 ? (
            <div className="space-y-4">
              {postedLoads.slice(0, 5).map((load, index) => (
                <div 
                  key={load._id} 
                  className="border-2 border-primary-blue/30 rounded-lg p-5 hover:border-orange-accent hover:shadow-lg transition-all duration-200 bg-white animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-heading font-semibold text-gray-900 text-lg">
                          {load.title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          load.status === 'available' ? 'bg-green-100 text-green-800' : 
                          load.status === 'booked' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {load.status?.toUpperCase()}
                        </span>
                      </div>
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
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">No loads posted yet</p>
              <Link to={ROUTES.POST_LOAD}>
                <button className="btn btn-accent text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Load
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;
