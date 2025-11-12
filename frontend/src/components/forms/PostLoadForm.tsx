import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadService } from '../../services/load.service';
import { shipmentService } from '../../services/shipment.service';
import { useUIStore } from '../../store/uiStore';
import { useLoadStore } from '../../store/loadStore';
import { ROUTES, US_STATES, EQUIPMENT_TYPES, MAX_LOAD_RATE_USD, MAX_LOAD_WEIGHT_LBS, MAX_PER_MILE_RATE_USD } from '../../utils/constants';
import type { Load, LoadFormData } from '../../types/load.types';
import type { Shipment } from '../../types/shipment.types';
import { Truck, MapPin, Calendar, Weight, DollarSign, Plus } from 'lucide-react';
import { getErrorMessage } from '../../utils/errors';

interface PostLoadFormProps {
  onLoadPosted?: (load: Load, context?: { shipment?: Shipment | null }) => void;
}

const PostLoadForm = ({ onLoadPosted }: PostLoadFormProps) => {
  const { addNotification } = useUIStore();
  const { fetchLoads } = useLoadStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoadingShipments, setIsLoadingShipments] = useState(false);
  const [shipmentSearch, setShipmentSearch] = useState('');

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
  const advisoryMessages = useMemo(() => {
    const messages: string[] = [];

    if (formData.weight >= MAX_LOAD_WEIGHT_LBS * 0.9) {
      messages.push(
        `Posted weight is ${formData.weight.toLocaleString()} lbs — double-check axle limits and permits for anything over ${(MAX_LOAD_WEIGHT_LBS * 0.9).toLocaleString()} lbs.`
      );
    }

    if (formData.rateType === 'per_mile') {
      if (formData.rate > MAX_PER_MILE_RATE_USD * 0.8) {
        messages.push(
          `Per-mile rate is $${formData.rate.toFixed(2)}/mi. Industry averages rarely exceed $${MAX_PER_MILE_RATE_USD.toFixed(
            2
          )}/mi — confirm your pricing.`
        );
      }
    } else if (formData.rate > 0 && formData.rate < 500) {
      messages.push('Flat rate is unusually low. Verify accessorials and fuel surcharge are accounted for.');
    }

    if (formData.pickupDate && formData.deliveryDate) {
      const pickup = new Date(formData.pickupDate);
      const delivery = new Date(formData.deliveryDate);
      const leadTime = (delivery.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24);
      if (leadTime > 7) {
        messages.push('Lead time exceeds one week. Consider splitting or validating layovers.');
      }
    }

    return messages;
  }, [formData]);

  const selectedShipment = useMemo(
    () => shipments.find((shipment) => shipment.shipmentId === formData.shipmentId),
    [shipments, formData.shipmentId]
  );

  const filteredShipments = useMemo(() => {
    if (!shipmentSearch.trim()) {
      return shipments;
    }
    const query = shipmentSearch.trim().toLowerCase();
    return shipments.filter((shipment) => {
      const haystack = [
        shipment.shipmentId,
        shipment.title,
        shipment.pickup?.city,
        shipment.pickup?.state,
        shipment.delivery?.city,
        shipment.delivery?.state,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [shipments, shipmentSearch]);

  useEffect(() => {
    const loadOpenShipments = async () => {
      setIsLoadingShipments(true);
      try {
        const response = await shipmentService.getShipments(1, 50, 'open');
        if (response.success && response.data) {
          setShipments(response.data.shipments ?? []);
        }
      } catch (error: unknown) {
        addNotification({
          type: 'error',
          message: getErrorMessage(error, 'Unable to fetch open shipments for linking.'),
        });
      } finally {
        setIsLoadingShipments(false);
      }
    };

    void loadOpenShipments();
  }, [addNotification]);

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
    } else if (formData.weight > MAX_LOAD_WEIGHT_LBS) {
      newErrors.weight = `Weight cannot exceed ${MAX_LOAD_WEIGHT_LBS.toLocaleString()} lbs`;
    }

    if (!formData.rate || formData.rate <= 0) {
      newErrors.rate = 'Rate must be greater than 0';
    } else if (formData.rate > MAX_LOAD_RATE_USD) {
      newErrors.rate = `Rate cannot exceed $${MAX_LOAD_RATE_USD.toLocaleString()}`;
    } else if (formData.rateType === 'per_mile' && formData.rate > MAX_PER_MILE_RATE_USD) {
      newErrors.rate = `Per-mile rate cannot exceed $${MAX_PER_MILE_RATE_USD.toLocaleString()}`;
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
      const response = await loadService.postLoad(formData);
      const createdLoad = response.load;

      addNotification({ type: 'success', message: 'Load posted successfully!' });

      await fetchLoads();

      if (createdLoad && onLoadPosted) {
        onLoadPosted(createdLoad, { shipment: selectedShipment ?? null });
        setFormData({
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
      } else {
        navigate(ROUTES.LOAD_BOARD);
      }
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to post load. Please try again.') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title and Description */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-100">
          <Truck className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Basic Information</h3>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
            Load Title *
          </label>
          <input
            type="text"
            name="title"
            required
            className={`w-full px-4 py-3 rounded-xl border-2 ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900`}
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Dry Van Load from LA to NYC"
          />
          {errors.title && <p className="text-red-600 text-sm mt-2 flex items-center gap-1"><span>⚠</span> {errors.title}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
            Description *
          </label>
          <textarea
            name="description"
            required
            rows={5}
            className={`w-full px-4 py-3 rounded-xl border-2 ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 resize-none`}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe load details, special handling requirements, any relevant shipping instructions..."
          />
          {errors.description && <p className="text-red-600 text-sm mt-2 flex items-center gap-1"><span>⚠</span> {errors.description}</p>}
        </div>
      </div>

      {/* Origin */}
      <div className="rounded-2xl bg-blue-50 border-2 border-blue-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-blue-600 p-2 rounded-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Pickup Location *</h3>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
      <div className="rounded-2xl bg-orange-50 border-2 border-orange-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-orange-600 p-2 rounded-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Delivery Location *</h3>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
      <div className="rounded-2xl bg-purple-50 border-2 border-purple-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Schedule *</h3>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="rounded-2xl bg-green-50 border-2 border-green-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-green-600 p-2 rounded-lg">
            <Weight className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Load Details *</h3>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                max={MAX_LOAD_WEIGHT_LBS}
                className={`input pl-10 ${errors.weight ? 'border-red-500' : ''}`}
                value={formData.weight || ''}
                onChange={handleChange}
              />
            </div>
            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
          </div>
        </div>
      </div>

      {/* Rate */}
      <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Pricing *</h3>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                max={MAX_LOAD_RATE_USD}
                step="0.01"
                className={`input pl-10 ${errors.rate ? 'border-red-500' : ''}`}
                value={formData.rate || ''}
                onChange={handleChange}
              />
            </div>
            {errors.rate && <p className="text-red-500 text-xs mt-1">{errors.rate}</p>}
          </div>
        </div>
        {advisoryMessages.length > 0 && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-white/70 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Posting advisory</p>
            <ul className="list-disc list-inside text-sm text-emerald-900 space-y-1.5">
              {advisoryMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Optional: Shipment Link */}
      <div className="rounded-2xl bg-gray-50 border-2 border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-gray-500" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Link to Shipment (Optional)
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Search open shipments
            </label>
            <input
              type="text"
              value={shipmentSearch}
              onChange={(event) => setShipmentSearch(event.target.value)}
              placeholder="Search by ID, title, pickup or delivery"
              className="input"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Refresh list
            </label>
            <button
              type="button"
              onClick={async () => {
                setShipmentSearch('');
                setIsLoadingShipments(true);
                try {
                  const response = await shipmentService.getShipments(1, 50, 'open');
                  if (response.success && response.data) {
                    setShipments(response.data.shipments ?? []);
                  }
                } catch (error: unknown) {
                  addNotification({
                    type: 'error',
                    message: getErrorMessage(error, 'Unable to refresh shipments list.'),
                  });
                } finally {
                  setIsLoadingShipments(false);
                }
              }}
              className="inline-flex w-full items-center justify-center rounded-lg border-2 border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoadingShipments}
            >
              {isLoadingShipments ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Select open shipment
          </label>
          <select
            name="shipmentId"
            className="input"
            value={formData.shipmentId ?? ''}
            onChange={handleChange}
          >
            <option value="">No shipment linkage</option>
            {filteredShipments.map((shipment) => (
              <option key={shipment._id} value={shipment.shipmentId}>
                {shipment.shipmentId} · {shipment.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Need to link a shipment outside this list? Paste the reference ID below.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Manual Shipment ID Entry
          </label>
          <input
            type="text"
            name="shipmentId"
            className="input"
            value={formData.shipmentId}
            onChange={handleChange}
            placeholder="Paste shipment ID if not listed above"
          />
        </div>

        {selectedShipment ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
              Linked Shipment Overview
            </p>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-gray-900">{selectedShipment.title}</h4>
                {selectedShipment.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedShipment.description}</p>
                )}
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-semibold text-gray-900">Pickup:</span>{' '}
                  {selectedShipment.pickup.city}, {selectedShipment.pickup.state}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Delivery:</span>{' '}
                  {selectedShipment.delivery.city}, {selectedShipment.delivery.state}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            Linking a shipment helps keep documents and billing aligned but is optional. You can update this later from the load details page.
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-gray-100">
        <button
          type="button"
          onClick={() => navigate(ROUTES.LOAD_BOARD)}
          className="flex-1 px-6 py-3.5 rounded-xl border-2 border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
              Posting Load...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              Publish Load to Marketplace
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default PostLoadForm;

