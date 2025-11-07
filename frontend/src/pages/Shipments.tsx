import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { canViewShipments } from '../utils/permissions';
import { shipmentService } from '../services/shipment.service';
import { useUIStore } from '../store/uiStore';
import { Lock, Plus, Package, Users, Filter, X } from 'lucide-react';
import ShipmentList from '../components/shipments/ShipmentList';
import CreateShipmentForm from '../components/forms/CreateShipmentForm';
import ShipmentRequestModal from '../components/shipments/ShipmentRequestModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { ShipmentRequest } from '../types/shipment.types';

const Shipments = () => {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ShipmentRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [requests, setRequests] = useState<ShipmentRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isShipper = user?.accountType === 'shipper';
  const isBroker = user?.accountType === 'broker';

  // Load shipment requests for shippers
  useEffect(() => {
    if (isShipper) {
      loadRequests();
    }
  }, [isShipper]);

  const loadRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await shipmentService.getShipmentRequests('pending');
      if (response.success) {
        setRequests(response.requests || []);
      }
    } catch (error: any) {
      // Silently fail - requests are optional
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleShipmentCreated = () => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleRequestUpdate = () => {
    loadRequests();
    setRefreshKey(prev => prev + 1);
  };

  // Access control: Only shippers and brokers can view shipments
  if (!canViewShipments(user?.accountType)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="card text-center animate-fade-in">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              Only shippers and brokers can access shipments.
            </p>
            <p className="text-sm text-gray-500">
              Carriers can browse and book loads on the Load Board instead.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900">
                Shipments
              </h1>
              <p className="text-xl text-gray-700 mt-2">
                {isShipper 
                  ? 'Manage your shipment requests and broker proposals'
                  : 'Browse available shipments and request access'
                }
              </p>
            </div>
            {isShipper && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-accent text-white"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Shipment
              </button>
            )}
          </div>
        </div>

        {/* Pending Requests Badge (Shippers) */}
        {isShipper && requests.length > 0 && (
          <div className="mb-6 card bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {requests.length} Pending Request{requests.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    You have pending shipment requests that need your attention
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(requests[0])}
                className="btn btn-primary"
              >
                Review Requests
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === ''
                  ? 'bg-primary-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'open'
                  ? 'bg-primary-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter('closed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'closed'
                  ? 'bg-primary-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-heading font-bold text-gray-900">
                  Create New Shipment
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <CreateShipmentForm
                  onSuccess={handleShipmentCreated}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Shipment List */}
        <div key={refreshKey}>
          <ShipmentList 
            status={statusFilter || undefined}
            onShipmentUpdate={handleRequestUpdate}
          />
        </div>

        {/* Request Modal */}
        {selectedRequest && (
          <ShipmentRequestModal
            request={selectedRequest}
            onUpdate={handleRequestUpdate}
            onClose={() => setSelectedRequest(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Shipments;
