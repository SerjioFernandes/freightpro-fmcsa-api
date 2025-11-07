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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Clear error for this field when user starts typing
    setErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[name]) {
        delete newErrors[name];
      }
      return newErrors;
    });

    if (name.startsWith('origin.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        origin: {
          ...prev.origin,
          [field]: value,
        },
      }));
      // Clear error for nested field
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[`origin.${field}`]) {
          delete newErrors[`origin.${field}`];
        }
        return newErrors;
      });
    } else if (name.startsWith('destination.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        destination: {
          ...prev.destination,
          [field]: value,
        },
      }));
      // Clear error for nested field
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[`destination.${field}`]) {
          delete newErrors[`destination.${field}`];
        }
        return newErrors;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'weight' || name === 'rate' ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Load title is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.origin.city?.trim()) {
      newErrors['origin.city'] = 'Pickup city is required';
    }

    if (!formData.origin.state) {
      newErrors['origin.state'] = 'Pickup state is required';
    }

    if (!formData.origin.zip?.trim()) {
      newErrors['origin.zip'] = 'Pickup ZIP code is required';
    } else if (!/^\d{5}$/.test(formData.origin.zip)) {
      newErrors['origin.zip'] = 'ZIP code must be 5 digits';
    }

    if (!formData.destination.city?.trim()) {
      newErrors['destination.city'] = 'Delivery city is required';
    }

    if (!formData.destination.state) {
      newErrors['destination.state'] = 'Delivery state is required';
    }

    if (!formData.destination.zip?.trim()) {
      newErrors['destination.zip'] = 'Delivery ZIP code is required';
    } else if (!/^\d{5}$/.test(formData.destination.zip)) {
      newErrors['destination.zip'] = 'ZIP code must be 5 digits';
    }

    if (!formData.pickupDate) {
      newErrors.pickupDate = 'Pickup date is required';
    } else {
      const pickupDate = new Date(formData.pickupDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (pickupDate < today) {
        newErrors.pickupDate = 'Pickup date cannot be in the past';
      }
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    } else if (formData.pickupDate) {
      const pickupDate = new Date(formData.pickupDate);
      const deliveryDate = new Date(formData.deliveryDate);
      if (deliveryDate <= pickupDate) {
        newErrors.deliveryDate = 'Delivery date must be after pickup date';
      }
    }

    if (!formData.equipmentType) {
      newErrors.equipmentType = 'Equipment type is required';
    }

    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    }

    if (!formData.rate || formData.rate <= 0) {
      newErrors.rate = 'Rate must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification({ type: 'error', message: 'Please fix the errors in the form' });
      return;
    }

    setIsLoading(true);

    try {
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
          className={`input ${errors.title ? 'border-red-500' : ''}`}
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Dry Van Load from LA to NYC"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
          Description *
        </label>
        <textarea
          name="description"
          required
          rows={4}
          className={`input ${errors.description ? 'border-red-500' : ''}`}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the load details, special requirements, etc."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
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
              className={`input ${errors['origin.city'] ? 'border-red-500' : ''}`}
              value={formData.origin.city}
              onChange={handleChange}
            />
            {errors['origin.city'] && <p className="text-red-500 text-xs mt-1">{errors['origin.city']}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <select
              name="origin.state"
              required
              className={`input ${errors['origin.state'] ? 'border-red-500' : ''}`}
              value={formData.origin.state}
              onChange={handleChange}
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state.code} value={state.code}>{state.name}</option>
              ))}
            </select>
            {errors['origin.state'] && <p className="text-red-500 text-xs mt-1">{errors['origin.state']}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
            <input
              type="text"
              name="origin.zip"
              required
              pattern="[0-9]{5}"
              maxLength={5}
              className={`input ${errors['origin.zip'] ? 'border-red-500' : ''}`}
              value={formData.origin.zip}
              onChange={handleChange}
            />
            {errors['origin.zip'] && <p className="text-red-500 text-xs mt-1">{errors['origin.zip']}</p>}
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
              className={`input ${errors['destination.city'] ? 'border-red-500' : ''}`}
              value={formData.destination.city}
              onChange={handleChange}
            />
            {errors['destination.city'] && <p className="text-red-500 text-xs mt-1">{errors['destination.city']}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <select
              name="destination.state"
              required
              className={`input ${errors['destination.state'] ? 'border-red-500' : ''}`}
              value={formData.destination.state}
              onChange={handleChange}
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state.code} value={state.code}>{state.name}</option>
              ))}
            </select>
            {errors['destination.state'] && <p className="text-red-500 text-xs mt-1">{errors['destination.state']}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
            <input
              type="text"
              name="destination.zip"
              required
              pattern="[0-9]{5}"
              maxLength={5}
              className={`input ${errors['destination.zip'] ? 'border-red-500' : ''}`}
              value={formData.destination.zip}
              onChange={handleChange}
            />
            {errors['destination.zip'] && <p className="text-red-500 text-xs mt-1">{errors['destination.zip']}</p>}
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
              className={`input ${errors.pickupDate ? 'border-red-500' : ''}`}
              value={formData.pickupDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.pickupDate && <p className="text-red-500 text-xs mt-1">{errors.pickupDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
            <input
              type="date"
              name="deliveryDate"
              required
              className={`input ${errors.deliveryDate ? 'border-red-500' : ''}`}
              value={formData.deliveryDate}
              onChange={handleChange}
              min={formData.pickupDate || new Date().toISOString().split('T')[0]}
            />
            {errors.deliveryDate && <p className="text-red-500 text-xs mt-1">{errors.deliveryDate}</p>}
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
              className={`input ${errors.equipmentType ? 'border-red-500' : ''}`}
              value={formData.equipmentType}
              onChange={handleChange}
            >
              <option value="">Select Equipment</option>
              {EQUIPMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.equipmentType && <p className="text-red-500 text-xs mt-1">{errors.equipmentType}</p>}
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
                className={`input pl-10 ${errors.weight ? 'border-red-500' : ''}`}
                value={formData.weight || ''}
                onChange={handleChange}
              />
            </div>
            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
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
                className={`input pl-10 ${errors.rate ? 'border-red-500' : ''}`}
                value={formData.rate || ''}
                onChange={handleChange}
              />
            </div>
            {errors.rate && <p className="text-red-500 text-xs mt-1">{errors.rate}</p>}
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

