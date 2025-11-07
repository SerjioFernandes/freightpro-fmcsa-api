import { useEffect, useState } from 'react';
import { useLoadStore } from '../store/loadStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';
import { MapPin, Calendar, Weight, Truck, Package, ArrowRight, Navigation, Lock, Map, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { canViewLoadBoard } from '../utils/permissions';
import LoadMap from '../components/Map/LoadMap';

const LoadBoard = () => {
  const { loads, pagination, isLoading, fetchLoads, bookLoad } = useLoadStore();
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [isBooking, setIsBooking] = useState<string | null>(null);

  // Enable real-time updates for load board
  useRealTimeUpdates();

  useEffect(() => {
    fetchLoads(currentPage, limit);
  }, [fetchLoads, currentPage, limit]);

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
    setIsBooking(loadId);
    try {
      await bookLoad(loadId);
      addNotification({ type: 'success', message: 'Load booked successfully!' });
      // Refresh current page after booking
      await fetchLoads(currentPage, limit);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to book load. Please try again.';
      addNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsBooking(null);
    }
  };

  const canBookLoads = user?.accountType === 'carrier';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900">
                Load Board
              </h1>
              <p className="text-xl text-gray-700 mt-2">
                Browse and book available freight loads in real-time
              </p>
            </div>
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary-blue text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-5 w-5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                  viewMode === 'map'
                    ? 'bg-primary-blue text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="h-5 w-5" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 card">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-blue/30 border-t-orange-accent"></div>
            <p className="text-gray-700 text-lg mt-6 font-medium">Loading loads...</p>
          </div>
        ) : loads.length > 0 ? (
          viewMode === 'map' ? (
            <LoadMap loads={loads} />
          ) : (
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
                        disabled={isBooking === load._id || isLoading}
                        className="btn btn-accent w-full group"
                      >
                        {isBooking === load._id ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            Booking...
                          </span>
                        ) : (
                          <>
                            Book Load
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    )}
                    {canBookLoads && load.status !== 'available' && (
                      <div className="text-center text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                        {load.status === 'booked' ? 'Already Booked' : load.status}
                      </div>
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
          )
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

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary-blue text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
              disabled={currentPage === pagination.pages || isLoading}
              className="btn btn-secondary flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {pagination && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.total)} of {pagination.total} loads
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadBoard;

