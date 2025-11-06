import { useState } from 'react';
import { Filter, DollarSign, MapPin, Truck } from 'lucide-react';
import { EQUIPMENT_TYPES, US_STATES } from '../../utils/constants';

interface AdvancedFiltersProps {
  filters: {
    equipment: string[];
    priceMin?: number;
    priceMax?: number;
    originState?: string;
    destinationState?: string;
    dateRange?: { from: Date; to: Date };
    radius?: number;
  };
  onFiltersChange: (filters: AdvancedFiltersProps['filters']) => void;
  onSaveSearch?: () => void;
}

const AdvancedFilters = ({ filters, onFiltersChange, onSaveSearch }: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: string, value: string | number | string[] | { from: Date; to: Date } | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="mb-6">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-blue transition-colors"
      >
        <Filter className="h-5 w-5" />
        <span className="font-semibold">Advanced Filters</span>
        <svg
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filters Panel */}
      {isOpen && (
        <div className="mt-4 p-6 bg-white rounded-lg border-2 border-gray-200 animate-slide-up">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Equipment Type */}
            <div>
              <label className="flex items-center gap-2 mb-3 font-semibold text-gray-700">
                <Truck className="h-5 w-5 text-primary-blue" />
                Equipment Type
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {EQUIPMENT_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={filters.equipment?.includes(type) || false}
                      onChange={(e) => {
                        const equipment = e.target.checked
                          ? [...(filters.equipment || []), type]
                          : (filters.equipment || []).filter((t) => t !== type);
                        updateFilter('equipment', equipment);
                      }}
                      className="rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="flex items-center gap-2 mb-3 font-semibold text-gray-700">
                <DollarSign className="h-5 w-5 text-green-600" />
                Price Range
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin || ''}
                  onChange={(e) => updateFilter('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                />
                <span className="text-gray-500 flex items-center">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax || ''}
                  onChange={(e) => updateFilter('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                />
              </div>
            </div>

            {/* Origin State */}
            <div>
              <label className="flex items-center gap-2 mb-3 font-semibold text-gray-700">
                <MapPin className="h-5 w-5 text-blue-600" />
                Origin State
              </label>
              <select
                value={filters.originState || ''}
                onChange={(e) => updateFilter('originState', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              >
                <option value="">All States</option>
                {US_STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination State */}
            <div>
              <label className="flex items-center gap-2 mb-3 font-semibold text-gray-700">
                <MapPin className="h-5 w-5 text-orange-accent" />
                Destination State
              </label>
              <select
                value={filters.destinationState || ''}
                onChange={(e) => updateFilter('destinationState', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              >
                <option value="">All States</option>
                {US_STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Search Button */}
          {onSaveSearch && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={onSaveSearch}
                className="btn btn-secondary"
              >
                Save Search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;

