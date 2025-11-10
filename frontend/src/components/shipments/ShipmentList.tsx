import { useState, useEffect, useMemo } from 'react';
import { shipmentService } from '../../services/shipment.service';
import { useUIStore } from '../../store/uiStore';
import ShipmentCard from './ShipmentCard';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { Package, AlertCircle } from 'lucide-react';
import type { Shipment } from '../../types/shipment.types';
import type { BoardSearchFilters } from '../../types/board.types';
import { getStateCentroid, getStateCodeFromInput, haversineMiles } from '../../utils/geo';

interface ShipmentListProps {
  status?: string;
  onShipmentUpdate?: () => void;
  filters?: BoardSearchFilters;
}

const ShipmentList = ({ status, onShipmentUpdate, filters }: ShipmentListProps) => {
  const { addNotification } = useUIStore();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadShipments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await shipmentService.getShipments(page, 20, status);
      if (response.success) {
        setShipments(response.shipments || []);
        setHasMore(response.pagination.page < response.pagination.pages);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to load shipments';
      setError(errorMessage);
      addNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, [page, status]);

  const handleUpdate = () => {
    loadShipments();
    if (onShipmentUpdate) {
      onShipmentUpdate();
    }
  };

  const filteredShipments = useMemo(() => {
    if (!filters) return shipments;

    const originStateCode = getStateCodeFromInput(filters.origin);
    const originStateCoords = originStateCode ? getStateCentroid(originStateCode) : null;

    return shipments.filter((shipment) => {
      const { pickup, delivery, title, description } = shipment;

      if (filters.origin) {
        const originString = `${pickup.city} ${pickup.state} ${pickup.zip}`.toLowerCase();
        if (!originString.includes(filters.origin.toLowerCase())) {
          return false;
        }
      }

      if (filters.destination) {
        const destinationString = `${delivery.city} ${delivery.state} ${delivery.zip}`.toLowerCase();
        if (!destinationString.includes(filters.destination.toLowerCase())) {
          return false;
        }
      }

      if (filters.pickupDate) {
        const pickupDateString = new Date(shipment.createdAt).toISOString().split('T')[0];
        if (pickupDateString !== filters.pickupDate) {
          return false;
        }
      }

      if (filters.keywords) {
        const searchSpace = `${title} ${description}`.toLowerCase();
        if (!searchSpace.includes(filters.keywords.toLowerCase())) {
          return false;
        }
      }

      if (typeof filters.radiusMiles === 'number' && originStateCoords) {
        const shipmentOriginStateCode = getStateCodeFromInput(pickup.state) || pickup.state?.toUpperCase();
        const shipmentOriginCoords = getStateCentroid(shipmentOriginStateCode);
        if (shipmentOriginCoords) {
          const distance = haversineMiles(originStateCoords, shipmentOriginCoords);
          if (distance > filters.radiusMiles) {
            return false;
          }
        }
      }

      return true;
    });
  }, [filters, shipments]);

  const showLoadMore = hasMore && filteredShipments.length === shipments.length;

  if (isLoading && shipments.length === 0) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" className="mx-auto" />
      </div>
    );
  }

  if (error && shipments.length === 0) {
    return (
      <div className="text-center py-16 card">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Shipments</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={loadShipments} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (filteredShipments.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-16 w-16" />}
        title="No Shipments Found"
        description={
          status === 'open'
            ? "There are no open shipments available at the moment."
            : "You haven't created any shipments yet."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {filteredShipments.map((shipment) => (
        <ShipmentCard
          key={shipment._id}
          shipment={shipment}
          onUpdate={handleUpdate}
          onDelete={handleUpdate}
          showActions={true}
        />
      ))}

      {/* Pagination */}
      {showLoadMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={() => setPage(page + 1)}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Loading...
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShipmentList;

