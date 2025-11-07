import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package, Calendar, Edit, Trash2, Eye, CheckCircle, XCircle, Send, X } from 'lucide-react';
import type { Shipment } from '../../types/shipment.types';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { shipmentService } from '../../services/shipment.service';

interface ShipmentCardProps {
  shipment: Shipment;
  onUpdate?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const ShipmentCard = ({ shipment, onUpdate, onDelete, showActions = true }: ShipmentCardProps) => {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const isOwner = user?.id === shipment.postedBy._id;
  const isShipper = user?.accountType === 'shipper';
  const isBroker = user?.accountType === 'broker';

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this shipment?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await shipmentService.deleteShipment(shipment._id);
      addNotification({ type: 'success', message: 'Shipment deleted successfully' });
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete shipment';
      addNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: 'open' | 'closed') => {
    setIsStatusChanging(true);
    try {
      await shipmentService.updateShipment(shipment._id, { status: newStatus });
      addNotification({ type: 'success', message: `Shipment ${newStatus === 'open' ? 'opened' : 'closed'} successfully` });
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update shipment status';
      addNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsStatusChanging(false);
    }
  };

  const handleRequestAccess = async () => {
    setIsRequesting(true);
    try {
      await shipmentService.requestAccess({
        shipmentId: shipment._id,
        brokerMessage: requestMessage
      });
      addNotification({ type: 'success', message: 'Access request submitted successfully!' });
      setShowRequestModal(false);
      setRequestMessage('');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to submit request';
      addNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="card card-hover border-2 border-primary-blue/30 hover:border-orange-accent animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Shipment Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-2xl font-heading font-bold text-gray-900">
              {shipment.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`badge ${
                shipment.status === 'open' 
                  ? 'badge-success' 
                  : 'badge-secondary'
              }`}>
                {shipment.status}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {shipment.shipmentId}
              </span>
            </div>
          </div>
          
          {shipment.description && (
            <p className="text-gray-700 mb-6">{shipment.description}</p>
          )}
          
          {/* Route Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div className="flex items-start space-x-3">
              <div className="bg-primary-blue/10 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-primary-blue" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Pickup
                </p>
                <p className="text-gray-900 font-medium">
                  {shipment.pickup.city}, {shipment.pickup.state} {shipment.pickup.zip}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-orange-accent/10 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-orange-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Delivery
                </p>
                <p className="text-gray-900 font-medium">
                  {shipment.delivery.city}, {shipment.delivery.state} {shipment.delivery.zip}
                </p>
              </div>
            </div>
          </div>

          {/* Posted By */}
          <div className="text-sm text-gray-600">
            Posted by: <span className="font-semibold">{shipment.postedBy.company}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col items-center lg:items-end justify-between min-w-[200px] space-y-3">
            {isOwner && isShipper && (
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => handleStatusChange(shipment.status === 'open' ? 'closed' : 'open')}
                  disabled={isStatusChanging}
                  className={`flex-1 btn ${
                    shipment.status === 'open' ? 'btn-secondary' : 'btn-primary'
                  } py-2 text-sm`}
                >
                  {isStatusChanging ? (
                    <span className="animate-spin">...</span>
                  ) : shipment.status === 'open' ? (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Close
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Open
                    </>
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="btn btn-danger py-2 px-3"
                >
                  {isDeleting ? (
                    <span className="animate-spin">...</span>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}

            {isBroker && shipment.status === 'open' && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="w-full btn btn-accent text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Request Access
              </button>
            )}

            {isShipper && isOwner && (
              <Link
                to={`/shipments/${shipment._id}`}
                className="w-full btn btn-primary"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Request Access Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-heading font-bold text-gray-900">
                Request Access
              </h2>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestMessage('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Request access to shipment: <span className="font-semibold">{shipment.title}</span>
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                  className="input w-full"
                  placeholder="Add a message to the shipper..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {requestMessage.length}/500 characters
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestMessage('');
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestAccess}
                  disabled={isRequesting}
                  className="flex-1 btn btn-accent text-white"
                >
                  {isRequesting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentCard;

