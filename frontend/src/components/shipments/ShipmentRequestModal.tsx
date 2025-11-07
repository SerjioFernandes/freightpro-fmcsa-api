import { useState } from 'react';
import { shipmentService } from '../../services/shipment.service';
import { useUIStore } from '../../store/uiStore';
import { X, CheckCircle, XCircle } from 'lucide-react';
import type { ShipmentRequest } from '../../types/shipment.types';

interface ShipmentRequestModalProps {
  request: ShipmentRequest;
  onUpdate?: () => void;
  onClose: () => void;
}

const ShipmentRequestModal = ({ request, onUpdate, onClose }: ShipmentRequestModalProps) => {
  const { addNotification } = useUIStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [shipperResponse, setShipperResponse] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    setIsUpdating(true);
    setActionType('approve');
    try {
      await shipmentService.updateRequestStatus(request._id, 'approved', shipperResponse);
      addNotification({ type: 'success', message: 'Request approved successfully' });
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to approve request';
      addNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsUpdating(false);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    setIsUpdating(true);
    setActionType('reject');
    try {
      await shipmentService.updateRequestStatus(request._id, 'rejected', shipperResponse);
      addNotification({ type: 'success', message: 'Request rejected' });
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to reject request';
      addNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsUpdating(false);
      setActionType(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-heading font-bold text-gray-900">
            Shipment Request
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Request Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className={`badge ${
                request.status === 'pending' ? 'badge-warning' :
                request.status === 'approved' ? 'badge-success' :
                'badge-danger'
              }`}>
                {request.status}
              </span>
              <span className="text-sm text-gray-500">
                Requested: {new Date(request.requestedAt).toLocaleDateString()}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">
              {request.shipmentId.title}
            </h3>
            <p className="text-sm text-gray-600">
              Shipment ID: {request.shipmentId.shipmentId}
            </p>
          </div>

          {/* Broker Info */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Broker Information</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{request.brokerId.company}</p>
              <p className="text-sm text-gray-600">{request.brokerId.email}</p>
              {request.brokerId.usdotNumber && (
                <p className="text-sm text-gray-600">USDOT: {request.brokerId.usdotNumber}</p>
              )}
              {request.brokerId.mcNumber && (
                <p className="text-sm text-gray-600">MC: {request.brokerId.mcNumber}</p>
              )}
            </div>
          </div>

          {/* Broker Message */}
          {request.brokerMessage && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Broker Message</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{request.brokerMessage}</p>
              </div>
            </div>
          )}

          {/* Shipper Response (if already responded) */}
          {request.status !== 'pending' && request.shipperResponse && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Your Response</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{request.shipperResponse}</p>
              </div>
            </div>
          )}

          {/* Response Form (if pending) */}
          {request.status === 'pending' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Your Response (Optional)
              </label>
              <textarea
                value={shipperResponse}
                onChange={(e) => setShipperResponse(e.target.value)}
                rows={4}
                className="input w-full"
                placeholder="Add any notes or conditions for this request..."
              />
            </div>
          )}

          {/* Actions */}
          {request.status === 'pending' && (
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleReject}
                disabled={isUpdating}
                className="flex-1 btn btn-danger"
              >
                {isUpdating && actionType === 'reject' ? (
                  <span className="animate-spin">...</span>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 mr-2" />
                    Reject
                  </>
                )}
              </button>
              <button
                onClick={handleApprove}
                disabled={isUpdating}
                className="flex-1 btn btn-accent text-white"
              >
                {isUpdating && actionType === 'approve' ? (
                  <span className="animate-spin">...</span>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Approve
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipmentRequestModal;

