import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadService } from '../../services/load.service';
import { useUIStore } from '../../store/uiStore';
import { useLoadStore } from '../../store/loadStore';
import { ROUTES, US_STATES, EQUIPMENT_TYPES } from '../../utils/constants';
import type { LoadFormData } from '../../types/load.types';
import { Truck, MapPin, Calendar, Weight, DollarSign } from 'lucide-react';

const PostLoadForm = () => {
  const { addNotification } = useUIStore();
  const { fetchLoads } = useLoadStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<LoadFormData>({
    title: '',
    description: '',
    origin: {
      city: '',
      state: '',
      zip: '',
      country: 'US',
    },
    destination: {
      city: '',
      state: '',
      zip: '',
      country: 'US',
    },
    pickupDate: '',
    deliveryDate: '',
    equipmentType: '',
    weight: 0,
    rate: 0,
    rateType: 'flat_rate',
    shipmentId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('origin.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        origin: {
          ...prev.origin,
          [field]: value,
        },
      }));
    } else if (name.startsWith('destination.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        destination: {
          ...prev.destination,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'weight' || name === 'rate' ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.origin.city || 
          !formData.origin.state || !formData.origin.zip || !formData.destination.city ||
          !formData.destination.state || !formData.destination.zip || !formData.pickupDate ||
          !formData.deliveryDate || !formData.equipmentType || !formData.weight || !formData.rate) {
        addNotification({ type: 'error', message: 'Please fill in all required fields' });
        setIsLoading(false);
        return;
      }

      // Validate dates
      const pickupDate = new Date(formData.pickupDate);
      const deliveryDate = new Date(formData.deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (pickupDate < today) {
        addNotification({ type: 'error', message: 'Pickup date cannot be in the past' });
        setIsLoading(false);
        return;
      }

      if (deliveryDate <= pickupDate) {
        addNotification({ type: 'error', message: 'Delivery date must be after pickup date' });
        setIsLoading(false);
        return;
      }

      await loadService.postLoad(formData);
      addNotification({ type: 'success', message: 'Load posted successfully!' });
      
      // Refresh loads and navigate to load board
      await fetchLoads();
      navigate(ROUTES.LOAD_BOARD);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to post load. Please try again.';
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
          Load Title *
        </label>
        <input
          type="text"
          name="title"
          required
          className="input"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Dry Van Load from LA to NYC"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
          Description *
        </label>
        <textarea
          name="description"
          required
          rows={4}
          className="input"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the load details, special requirements, etc."
        />
      </div>

      {/* Origin */}
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
              name="origin.city"
              required
              className="input"
              value={formData.origin.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <select
              name="origin.state"
              required
              className="input"
              value={formData.origin.state}
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
              name="origin.zip"
              required
              pattern="[0-9]{5}"
              maxLength={5}
              className="input"
              value={formData.origin.zip}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Destination */}
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
              name="destination.city"
              required
              className="input"
              value={formData.destination.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <select
              name="destination.state"
              required
              className="input"
              value={formData.destination.state}
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
              name="destination.zip"
              required
              pattern="[0-9]{5}"
              maxLength={5}
              className="input"
              value={formData.destination.zip}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="border-t-2 border-primary-blue/20 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary-blue" />
          <h3 className="text-lg font-semibold text-gray-900">Schedule *</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date *</label>
            <input
              type="date"
              name="pickupDate"
              required
              className="input"
              value={formData.pickupDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
            <input
              type="date"
              name="deliveryDate"
              required
              className="input"
              value={formData.deliveryDate}
              onChange={handleChange}
              min={formData.pickupDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {/* Equipment and Weight */}
      <div className="border-t-2 border-primary-blue/20 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-primary-blue" />
          <h3 className="text-lg font-semibold text-gray-900">Load Details *</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Type *</label>
            <select
              name="equipmentType"
              required
              className="input"
              value={formData.equipmentType}
              onChange={handleChange}
            >
              <option value="">Select Equipment</option>
              {EQUIPMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (lbs) *
            </label>
            <div className="relative">
              <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                name="weight"
                required
                min="1"
                className="input pl-10"
                value={formData.weight || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rate */}
      <div className="border-t-2 border-primary-blue/20 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Rate *</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate Type *</label>
            <select
              name="rateType"
              required
              className="input"
              value={formData.rateType}
              onChange={handleChange}
            >
              <option value="flat_rate">Flat Rate</option>
              <option value="per_mile">Per Mile</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate ($) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                name="rate"
                required
                min="1"
                step="0.01"
                className="input pl-10"
                value={formData.rate || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Optional: Shipment ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Shipment ID (Optional)
        </label>
        <input
          type="text"
          name="shipmentId"
          className="input"
          value={formData.shipmentId}
          onChange={handleChange}
          placeholder="Link to existing shipment"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(ROUTES.LOAD_BOARD)}
          className="flex-1 btn btn-secondary py-3"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 btn btn-accent py-3 text-white"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
              Posting Load...
            </span>
          ) : (
            'Post Load'
          )}
        </button>
      </div>
    </form>
  );
};

export default PostLoadForm;

