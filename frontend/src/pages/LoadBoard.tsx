import { useEffect } from 'react';
import { useLoadStore } from '../store/loadStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { MapPin, Calendar, Weight, Truck, Package, ArrowRight, Navigation, Lock } from 'lucide-react';
import { canViewLoadBoard } from '../utils/permissions';

const LoadBoard = () => {
  const { loads, isLoading, fetchLoads, bookLoad } = useLoadStore();
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();

  useEffect(() => {
    fetchLoads();
  }, [fetchLoads]);

  // Access control: Only carriers and brokers can view the load board
  if (!canViewLoadBoard(user?.accountType)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="card text-center animate-fade-in">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              Only carriers and brokers can access the Load Board.
            </p>
            <p className="text-sm text-gray-500">
              Shippers can create shipments instead. Check your dashboard for shipment management options.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleBookLoad = async (loadId: string) => {
    try {
      await bookLoad(loadId);
      addNotification({ type: 'success', message: 'Load booked successfully!' });
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to book load. Please try again.' });
    }
  };

  const canBookLoads = user?.accountType === 'carrier';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900">
            Load Board
          </h1>
          <p className="text-xl text-gray-700 mt-2">
            Browse and book available freight loads in real-time
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 card">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-blue/30 border-t-orange-accent"></div>
            <p className="text-gray-700 text-lg mt-6 font-medium">Loading loads...</p>
          </div>
        ) : loads.length > 0 ? (
          <div className="grid gap-6">
            {loads.map((load, index) => (
              <div 
                key={load._id} 
                className="card card-hover border-2 border-primary-blue/30 hover:border-orange-accent animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Load Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-heading font-bold text-gray-900">
                        {load.title}
                      </h3>
                      <span className={`badge ${load.status === 'available' ? 'badge-success' : 'badge-warning'} ml-4`}>
                        {load.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-6">{load.description}</p>
                    
                    {/* Route Information */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="flex items-start space-x-3">
                        <div className="bg-primary-blue/10 p-2 rounded-lg">
                          <MapPin className="h-5 w-5 text-primary-blue" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Origin
                          </p>
                          <p className="text-gray-900 font-medium">
                            {load.origin.city}, {load.origin.state} {load.origin.zip}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-orange-accent/10 p-2 rounded-lg">
                          <Navigation className="h-5 w-5 text-orange-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Destination
                          </p>
                          <p className="text-gray-900 font-medium">
                            {load.destination.city}, {load.destination.state} {load.destination.zip}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-primary-blue/10 p-2 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary-blue" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Pickup Date
                          </p>
                          <p className="text-gray-900 font-medium">
                            {new Date(load.pickupDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="bg-orange-accent/10 p-2 rounded-lg">
                          <Weight className="h-5 w-5 text-orange-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Weight
                          </p>
                          <p className="text-gray-900 font-medium">
                            {load.weight.toLocaleString()} lbs
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Load Metadata */}
                    <div className="flex items-center flex-wrap gap-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
                        <Truck className="h-4 w-4 text-primary-blue" />
                        <span className="font-medium">{load.equipmentType}</span>
                      </div>
                      {load.isInterstate && (
                        <span className="badge badge-success">Interstate</span>
                      )}
                      {load.distance && (
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                          📍 {load.distance} miles
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Action */}
                  <div className="flex flex-col items-center lg:items-end justify-between min-w-[220px] space-y-4">
                    <div className="text-center lg:text-right gradient-blue rounded-xl p-6 w-full">
                      <p className="text-sm text-white/80 font-medium uppercase tracking-wide mb-2">
                        Rate
                      </p>
                      <p className="text-4xl font-heading font-bold text-orange-accent mb-1">
                        ${load.rate.toLocaleString()}
                      </p>
                      <p className="text-sm text-white/90">
                        {load.rateType === 'per_mile' ? 'per mile' : 'flat rate'}
                      </p>
                    </div>

                    {canBookLoads && load.status === 'available' && (
                      <button
                        onClick={() => handleBookLoad(load._id)}
                        className="btn btn-accent w-full group"
                      >
                        Book Load
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    )}
                    
                    {!canBookLoads && (
                      <div className="text-center text-sm text-gray-600 bg-light-ivory px-4 py-2 rounded-lg">
                        Carrier accounts only
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 card">
            <Package className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">
              No Loads Available
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Check back soon for new freight opportunities
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadBoard;

