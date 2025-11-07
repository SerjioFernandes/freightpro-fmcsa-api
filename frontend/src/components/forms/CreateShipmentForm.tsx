import { useState } from 'react';
import { shipmentService } from '../../services/shipment.service';
import { useUIStore } from '../../store/uiStore';
import { US_STATES } from '../../utils/constants';
import type { ShipmentFormData } from '../../types/shipment.types';
import { MapPin, Package } from 'lucide-react';

interface CreateShipmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateShipmentForm = ({ onSuccess, onCancel }: CreateShipmentFormProps) => {
  const { addNotification } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<ShipmentFormData>({
    title: '',
    description: '',
    pickup: {
      city: '',
      state: '',
      zip: '',
      country: 'US',
    },
    delivery: {
      city: '',
      state: '',
      zip: '',
      country: 'US',
    },
    status: 'open',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('pickup.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pickup: {
          ...prev.pickup,
          [field]: value,
        },
      }));
    } else if (name.startsWith('delivery.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        delivery: {
          ...prev.delivery,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.pickup.city || 
          !formData.pickup.state || !formData.pickup.zip || 
          !formData.delivery.city || !formData.delivery.state || 
          !formData.delivery.zip) {
        addNotification({ type: 'error', message: 'Please fill in all required fields' });
        setIsLoading(false);
        return;
      }

      // Validate ZIP codes
      if (!/^\d{5}$/.test(formData.pickup.zip)) {
        addNotification({ type: 'error', message: 'Pickup ZIP code must be 5 digits' });
        setIsLoading(false);
        return;
      }

      if (!/^\d{5}$/.test(formData.delivery.zip)) {
        addNotification({ type: 'error', message: 'Delivery ZIP code must be 5 digits' });
        setIsLoading(false);
        return;
      }

      await shipmentService.createShipment(formData);
      addNotification({ type: 'success', message: 'Shipment created successfully!' });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create shipment. Please try again.';
      addNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title and Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
          Shipment Title *
        </label>
        <input
          type="text"
          name="title"
          required
          className="input"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Electronics Shipment from LA to NYC"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
          Description
        </label>
        <textarea
          name="description"
          rows={4}
          className="input"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the shipment details, special requirements, etc."
        />
      </div>

      {/* Pickup Location */}
      <div className="border-t-2 border-primary-blue/20 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary-blue" />
          <h3 className="text-lg font-semibold text-gray-900">Pickup Location *</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              name="pickup.city"
              required
              className="input"
              value={formData.pickup.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <select
              name="pickup.state"
              required
              className="input"
              value={formData.pickup.state}
              onChange={handleChange}
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state.code} value={state.code}>{state.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
            <input
              type="text"
              name="pickup.zip"
              required
              pattern="[0-9]{5}"
              maxLength={5}
              className="input"
              value={formData.pickup.zip}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Delivery Location */}
      <div className="border-t-2 border-primary-blue/20 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-orange-accent" />
          <h3 className="text-lg font-semibold text-gray-900">Delivery Location *</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              name="delivery.city"
              required
              className="input"
              value={formData.delivery.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <select
              name="delivery.state"
              required
              className="input"
              value={formData.delivery.state}
              onChange={handleChange}
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state.code} value={state.code}>{state.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
            <input
              type="text"
              name="delivery.zip"
              required
              pattern="[0-9]{5}"
              maxLength={5}
              className="input"
              value={formData.delivery.zip}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
          Status
        </label>
        <select
          name="status"
          className="input"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 btn btn-secondary py-3"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 btn btn-accent py-3 text-white"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
              Creating...
            </span>
          ) : (
            <>
              <Package className="h-5 w-5 mr-2" />
              Create Shipment
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateShipmentForm;

