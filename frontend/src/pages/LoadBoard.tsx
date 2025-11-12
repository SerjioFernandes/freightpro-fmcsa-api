import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLoadStore } from '../store/loadStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';
import { MapPin, Calendar, Weight, Truck, Package, ArrowRight, Navigation, Lock, ChevronLeft, ChevronRight, CheckCircle, MessageCircle, FileText, DollarSign, Loader2 } from 'lucide-react';
import { canViewLoadBoard } from '../utils/permissions';
import BoardSearchBar from '../components/board/BoardSearchBar';
import type { BoardSearchFilters } from '../types/board.types';
import type { Load } from '../types/load.types';
import { getStateCodeFromInput, getStateCentroid, haversineMiles } from '../utils/geo';
import { getErrorMessage } from '../utils/errors';
import { ROUTES } from '../utils/constants';
import { billingService } from '../services/billing.service';
import { exportInvoiceToPDF } from '../utils/exportData';

const createDefaultFilters = (): BoardSearchFilters => ({
  origin: '',
  destination: '',
  equipmentType: '',
  pickupDate: '',
  minRate: undefined,
  maxMiles: undefined,
  radiusMiles: undefined,
  rateType: '',
  keywords: '',
  stateShortcut: ''
});

const parseNumberParam = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const buildFiltersFromSearchParams = (params: URLSearchParams): BoardSearchFilters | null => {
  const recognizedKeys = [
    'origin',
    'originState',
    'destination',
    'destinationState',
    'equipment',
    'pickupDate',
    'minRate',
    'maxMiles',
    'radius',
    'rateType',
    'keywords',
    'state'
  ];

  const hasRelevant = recognizedKeys.some((key) => params.has(key));
  if (!hasRelevant) {
    return null;
  }

  const defaults = createDefaultFilters();

  return {
    ...defaults,
    origin: params.get('origin') ?? params.get('originState') ?? defaults.origin,
    destination: params.get('destination') ?? params.get('destinationState') ?? defaults.destination,
    equipmentType: params.get('equipment') ?? defaults.equipmentType,
    pickupDate: params.get('pickupDate') ?? defaults.pickupDate,
    minRate: parseNumberParam(params.get('minRate')) ?? defaults.minRate,
    maxMiles: parseNumberParam(params.get('maxMiles')) ?? defaults.maxMiles,
    radiusMiles: parseNumberParam(params.get('radius')) ?? defaults.radiusMiles,
    rateType: params.get('rateType') ?? defaults.rateType,
    keywords: params.get('keywords') ?? defaults.keywords,
    stateShortcut: params.get('state') ?? defaults.stateShortcut
  };
};

const calculateLinehaulTotal = (load: Load, overrideRate?: number): number | null => {
  const effectiveRate = typeof overrideRate === 'number' && overrideRate > 0 ? overrideRate : load.rate;
  if (load.rateType === 'per_mile' && typeof load.distance === 'number' && load.distance > 0) {
    return effectiveRate * load.distance;
  }
  if (load.rateType !== 'per_mile') {
    return effectiveRate;
  }
  return null;
};

const formatCurrency = (value: number): string =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const LoadBoard = () => {
  const { loads, pagination, isLoading, fetchLoads, bookLoad } = useLoadStore();
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const lastPrefillKeyRef = useRef<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const [bookingDialog, setBookingDialog] = useState<{
    load: Load;
    agreedRate: number;
    bookingNotes: string;
  } | null>(null);
  const [bookingSummary, setBookingSummary] = useState<{ load: Load } | null>(null);
  const [filters, setFilters] = useState<BoardSearchFilters>(() => createDefaultFilters());
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const liveLinehaulTotal = bookingDialog
    ? calculateLinehaulTotal(bookingDialog.load, bookingDialog.agreedRate)
    : null;

  useEffect(() => {
    const serialized = searchParams.toString();
    if (serialized === lastPrefillKeyRef.current) {
      return;
    }

    lastPrefillKeyRef.current = serialized;

    const derivedFilters = buildFiltersFromSearchParams(searchParams);
    const pageParam = parseNumberParam(searchParams.get('page'));

    if (derivedFilters) {
      setFilters(derivedFilters);
      setCurrentPage(1);

      if (searchParams.has('prefill')) {
        const updatedParams = new URLSearchParams(searchParams);
        updatedParams.delete('prefill');
        lastPrefillKeyRef.current = updatedParams.toString();
        setSearchParams(updatedParams, { replace: true });
      }
      return;
    }

    if (!serialized) {
      setFilters(createDefaultFilters());
      setCurrentPage(1);
      return;
    }

    if (pageParam && pageParam > 0 && pageParam !== currentPage) {
      setCurrentPage(pageParam);
    }
  }, [searchParams, setSearchParams, currentPage]);

  // Enable real-time updates for load board
  useRealTimeUpdates();

  useEffect(() => {
    fetchLoads(currentPage, limit);
  }, [fetchLoads, currentPage, limit]);

  const isLoadBoardAccessible = canViewLoadBoard(user?.accountType);

  const equipmentOptions = useMemo(() => {
    const unique = new Set<string>();
    loads.forEach((load) => {
      if (load.equipmentType) {
        unique.add(load.equipmentType);
      }
    });
    return Array.from(unique).sort();
  }, [loads]);

  const filteredLoads = useMemo(() => {
    const originStateCode = getStateCodeFromInput(filters.origin);
    const originStateCoords = originStateCode ? getStateCentroid(originStateCode) : null;
    const shortcutState = filters.stateShortcut?.trim().toUpperCase();

    return loads.filter((load) => {
      const { origin, destination, pickupDate, equipmentType, rate, distance, rateType, title, description } = load;
      const originMatch =
        !filters.origin ||
        `${origin.city} ${origin.state} ${origin.zip}`.toLowerCase().includes(filters.origin.toLowerCase());

      if (!originMatch) return false;

      if (shortcutState) {
        const loadOriginState = origin.state?.toUpperCase();
        const loadDestinationState = destination.state?.toUpperCase();

        if (loadOriginState !== shortcutState && loadDestinationState !== shortcutState) {
          return false;
        }
      }

      const destinationMatch =
        !filters.destination ||
        `${destination.city} ${destination.state} ${destination.zip}`.toLowerCase().includes(filters.destination.toLowerCase());

      if (!destinationMatch) return false;

      if (filters.equipmentType && filters.equipmentType !== equipmentType) {
        return false;
      }

      if (filters.rateType && filters.rateType !== rateType) {
        return false;
      }

      if (filters.pickupDate) {
        const pickupDateString = new Date(pickupDate).toISOString().split('T')[0];
        if (pickupDateString !== filters.pickupDate) {
          return false;
        }
      }

      if (typeof filters.minRate === 'number' && rate < filters.minRate) {
        return false;
      }

      if (typeof filters.maxMiles === 'number') {
        if (typeof distance === 'number') {
          if (distance > filters.maxMiles) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (typeof filters.radiusMiles === 'number' && originStateCoords) {
        const loadOriginStateCode = getStateCodeFromInput(origin.state) || origin.state?.toUpperCase();
        const loadOriginCoords =
          load.origin.coordinates?.lat && load.origin.coordinates?.lng
            ? { lat: load.origin.coordinates.lat, lng: load.origin.coordinates.lng }
            : getStateCentroid(loadOriginStateCode);

        if (loadOriginCoords) {
          const distanceMiles = haversineMiles(originStateCoords, loadOriginCoords);
          if (distanceMiles > filters.radiusMiles) {
            return false;
          }
        }
      }

      if (filters.keywords) {
        const searchSpace = `${title} ${description}`.toLowerCase();
        if (!searchSpace.includes(filters.keywords.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [loads, filters]);

  // Access control: Only carriers and brokers can view the load board
  if (!isLoadBoardAccessible) {
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

  const updateBookingDialog = (updates: Partial<{ agreedRate: number; bookingNotes: string }>) => {
    setBookingDialog((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const openBookingDialog = (load: Load) => {
    setBookingDialog({
      load,
      agreedRate: load.agreedRate ?? load.rate,
      bookingNotes: '',
    });
  };

  const submitBooking = async () => {
    if (!bookingDialog) return;
    setIsBooking(bookingDialog.load._id);
    try {
      const updatedLoad = await bookLoad(bookingDialog.load._id, {
        agreedRate: bookingDialog.agreedRate,
        bookingNotes: bookingDialog.bookingNotes.trim() || undefined,
      });
      setBookingSummary({ load: { ...bookingDialog.load, ...updatedLoad } });
      setBookingDialog(null);
      await fetchLoads(currentPage, limit);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to book load. Please try again.');
      addNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsBooking(null);
    }
  };

  const handleInvoicePreview = async (loadId: string) => {
    setIsGeneratingInvoice(true);
    try {
      const response = await billingService.previewInvoice(loadId);
      if (response.success && response.data) {
        exportInvoiceToPDF(response.data);
      } else {
        addNotification({
          type: 'error',
          message: response.error || 'Unable to generate invoice preview',
        });
      }
    } catch (error: unknown) {
      addNotification({
        type: 'error',
        message: getErrorMessage(error, 'Unable to generate invoice preview'),
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const canBookLoads = user?.accountType === 'carrier';
  const filteredPaginationTotal = filteredLoads.length;
  const equipmentSelectOptions = equipmentOptions.length ? equipmentOptions : undefined;

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
          </div>
        </div>

        <BoardSearchBar
          filters={filters}
          onChange={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
          onClear={() => setFilters(createDefaultFilters())}
          equipmentOptions={equipmentSelectOptions}
        />

        {isLoading ? (
          <div className="text-center py-20 card">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-blue/30 border-t-orange-accent"></div>
            <p className="text-gray-700 text-lg mt-6 font-medium">Loading loads...</p>
          </div>
        ) : filteredLoads.length > 0 ? (
          <div className="grid gap-6">
          {filteredLoads.map((load, index) => (
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
                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      Billing: {(load.billingStatus ?? 'not_ready').replace(/_/g, ' ')}
                    </div>
                    {load.rateType === 'per_mile' && typeof load.distance === 'number' && load.distance > 0 && (
                      <p className="mt-3 text-xs text-white/80">
                        Est line-haul ${formatCurrency(load.rate * load.distance)} ({load.distance.toLocaleString()} miles)
                      </p>
                    )}
                  </div>

                  {canBookLoads && load.status === 'available' && (
                    <button
                      onClick={() => openBookingDialog(load)}
                      disabled={isBooking === load._id || isLoading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBooking === load._id ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                          Processing...
                        </span>
                      ) : (
                        <>
                          Book Load
                          <ArrowRight className="h-5 w-5" />
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
        {pagination && pagination.pages > 1 && filteredPaginationTotal === loads.length && (
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

        {filteredPaginationTotal !== loads.length ? (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {filteredLoads.length} filtered loads out of {pagination?.total ?? loads.length}
          </div>
        ) : (
          pagination && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, pagination.total)} of {pagination.total} loads
            </div>
          )
        )}

        {bookingDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="bg-gradient-to-r from-emerald-500 to-blue-600 px-6 py-5 text-white">
                <h3 className="text-xl font-semibold">Confirm booking</h3>
                <p className="text-sm text-emerald-100">
                  Review the lane details and confirm the final rate before booking.
                </p>
              </div>
              <div className="space-y-6 p-6 md:p-8">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
                    {bookingDialog.load.title}
                  </p>
                  <h4 className="text-2xl font-bold text-slate-900">
                    {bookingDialog.load.origin.city}, {bookingDialog.load.origin.state}{' '}
                    <ArrowRight className="mx-2 inline h-5 w-5 text-blue-500 align-middle" />
                    {bookingDialog.load.destination.city}, {bookingDialog.load.destination.state}
                  </h4>
                  <p className="text-sm text-slate-600">
                    Pickup {new Date(bookingDialog.load.pickupDate).toLocaleDateString()} • Delivery{' '}
                    {new Date(bookingDialog.load.deliveryDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Agreed rate (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min={1}
                        step="0.01"
                        className="input pl-9"
                        value={bookingDialog.agreedRate}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          updateBookingDialog({
                            agreedRate: Number.isFinite(next) && next > 0 ? next : bookingDialog.load.rate,
                          });
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Defaults to the posted rate (${bookingDialog.load.rate.toLocaleString()}).
                      Adjust if you negotiated different terms.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Add booking notes (optional)
                    </label>
                    <textarea
                      className="input h-28 resize-none"
                      value={bookingDialog.bookingNotes}
                      onChange={(event) => updateBookingDialog({ bookingNotes: event.target.value })}
                      placeholder="Add accessorials, special instructions, or reference numbers for the broker."
                    />
                  </div>
                </div>

                {liveLinehaulTotal !== null && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Estimated line-haul total
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      ${formatCurrency(liveLinehaulTotal)}{' '}
                      {bookingDialog.load.rateType === 'per_mile' &&
                        typeof bookingDialog.load.distance === 'number' &&
                        bookingDialog.load.distance > 0 && (
                          <span className="text-xs font-medium text-emerald-600">
                            ({bookingDialog.load.distance.toLocaleString()} miles @ $
                            {bookingDialog.agreedRate.toFixed(2)}/mi)
                          </span>
                        )}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">Recommended next steps</p>
                  <ul className="mt-2 list-disc list-inside text-sm text-slate-600 space-y-1.5">
                    <li>Upload insurance & carrier packet documents after confirming.</li>
                    <li>Message the broker to coordinate pickup window and driver contact.</li>
                    <li>Capture accessorial agreements here so billing is accurate.</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:justify-end">
                  <button
                    type="button"
                    onClick={() => setBookingDialog(null)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 md:w-auto"
                    disabled={isBooking !== null}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitBooking}
                    disabled={isBooking === bookingDialog.load._id}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                  >
                    {isBooking === bookingDialog.load._id ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Booking…
                      </span>
                    ) : (
                      <>
                        Confirm Booking
                        <CheckCircle className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {bookingSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="bg-gradient-to-r from-emerald-500 to-blue-600 px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-7 w-7" />
                  <div>
                    <h3 className="text-xl font-semibold">Load booked successfully</h3>
                    <p className="text-sm text-emerald-100">
                      We captured the agreed rate and prepped billing for this lane.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6 p-6 md:p-8">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
                    {bookingSummary.load.title}
                  </p>
                  <h4 className="text-2xl font-bold text-slate-900">
                    {bookingSummary.load.origin.city}, {bookingSummary.load.origin.state}{' '}
                    <ArrowRight className="mx-2 inline h-5 w-5 text-blue-500 align-middle" />
                    {bookingSummary.load.destination.city}, {bookingSummary.load.destination.state}
                  </h4>
                  <p className="text-sm text-slate-600">
                    Pickup {new Date(bookingSummary.load.pickupDate).toLocaleDateString()} • Delivery{' '}
                    {new Date(bookingSummary.load.deliveryDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Billing Overview
                    </p>
                    <p>
                      Posted rate:{' '}
                      <span className="font-semibold text-slate-900">
                        ${bookingSummary.load.rate.toLocaleString()}
                      </span>
                    </p>
                    <p>
                      Agreed rate:{' '}
                      <span className="font-semibold text-emerald-700">
                        $
                        {formatCurrency(
                          Number(bookingSummary.load.agreedRate ?? bookingSummary.load.rate)
                        )}
                      </span>
                    </p>
                  {bookingSummary.load.rateType === 'per_mile' &&
                    typeof bookingSummary.load.distance === 'number' &&
                    bookingSummary.load.distance > 0 && (
                      <p>
                        Est line-haul total:{' '}
                        <span className="font-semibold text-slate-900">
                          $
                          {formatCurrency(
                            calculateLinehaulTotal(
                              bookingSummary.load,
                              bookingSummary.load.agreedRate ?? bookingSummary.load.rate
                            ) ?? bookingSummary.load.rate
                          )}
                        </span>
                      </p>
                    )}
                    <p>
                      Billing status:{' '}
                      <span className="font-semibold text-slate-900">
                        {(bookingSummary.load.billingStatus ?? 'ready').replace(/_/g, ' ')}
                      </span>
                    </p>
                    {bookingSummary.load.bookedAt && (
                      <p>
                        Booked:{' '}
                        <span className="font-semibold text-slate-900">
                          {new Date(bookingSummary.load.bookedAt).toLocaleString()}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Broker Contact
                    </p>
                    <p className="font-semibold text-slate-900">{bookingSummary.load.postedBy?.company}</p>
                    <p>{bookingSummary.load.postedBy?.email}</p>
                    {bookingSummary.load.postedBy?.phone && <p>{bookingSummary.load.postedBy.phone}</p>}
                    <p className="text-xs text-slate-500">
                      Reach out to lock in pickup check-in details and required paperwork.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-600/10 p-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">Checklist</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Upload insurance, carrier packet, and BOL/POD to the Documents hub.</li>
                        <li>Confirm driver contact and pickup instructions with the broker.</li>
                        <li>Track mileage and accessorials – billing is now marked as ready.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingSummary(null);
                      navigate(`${ROUTES.DOCUMENTS}?prefill=${bookingSummary.load._id}`);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-200 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 md:w-auto"
                  >
                    Manage documents
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInvoicePreview(bookingSummary.load._id)}
                    disabled={isGeneratingInvoice}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-60 md:w-auto"
                  >
                    {isGeneratingInvoice ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Building invoice…
                      </span>
                    ) : (
                      'Invoice PDF'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingSummary(null);
                      navigate(ROUTES.MESSAGES);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 md:w-auto"
                  >
                    Message broker
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingSummary(null)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-emerald-700 md:w-auto"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadBoard;

