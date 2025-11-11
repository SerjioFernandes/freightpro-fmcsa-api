import { useMemo } from 'react';
import { Search, MapPin, Navigation2, Calendar, Truck, DollarSign, Ruler, Target, RefreshCw } from 'lucide-react';
import type { BoardSearchFilters } from '../../types/board.types';
import { listStateOptions } from '../../utils/geo';

interface BoardSearchBarProps {
  filters: BoardSearchFilters;
  onChange: (updates: Partial<BoardSearchFilters>) => void;
  onClear: () => void;
  onSearch?: () => void;
  equipmentOptions?: string[];
  rateTypeOptions?: Array<{ value: string; label: string }>;
  title?: string;
  subtitle?: string;
  showEquipment?: boolean;
  showPickupDate?: boolean;
  showMinRate?: boolean;
  showMaxMiles?: boolean;
  showRateType?: boolean;
  showRadius?: boolean;
  showKeywords?: boolean;
  showStateShortcut?: boolean;
}

const defaultRateTypeOptions = [
  { value: '', label: 'All Rate Types' },
  { value: 'per_mile', label: 'Per Mile' },
  { value: 'flat_rate', label: 'Flat Rate' }
];

const BoardSearchBar = ({
  filters,
  onChange,
  onClear,
  onSearch,
  equipmentOptions,
  rateTypeOptions = defaultRateTypeOptions,
  title = 'Smart Load Search',
  subtitle = 'Tune your results with precise filters',
  showEquipment = true,
  showPickupDate = true,
  showMinRate = true,
  showMaxMiles = true,
  showRateType = true,
  showRadius = true,
  showKeywords = true,
  showStateShortcut = true
}: BoardSearchBarProps) => {
  const stateOptions = useMemo(() => listStateOptions(), []);

  const handleNumberChange = (value: string, field: keyof BoardSearchFilters) => {
    const numericValue = value === '' ? undefined : Number(value);
    onChange({ [field]: numericValue } as Partial<BoardSearchFilters>);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 h-10 w-10 flex items-center justify-center rounded-full shadow-sm">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Clear Filters
          </button>
          {onSearch && (
            <button
              onClick={onSearch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold shadow-md"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            Origin
          </label>
          <input
            type="text"
            value={filters.origin}
            onChange={(event) => onChange({ origin: event.target.value, stateShortcut: '' })}
            placeholder="City, State or ZIP"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
            <Navigation2 className="h-4 w-4 text-blue-500" />
            Destination
          </label>
          <input
            type="text"
            value={filters.destination}
            onChange={(event) => onChange({ destination: event.target.value })}
            placeholder="City, State or ZIP"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        {showEquipment && (
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-500" />
              Equipment Type
            </label>
            <select
              value={filters.equipmentType}
              onChange={(event) => onChange({ equipmentType: event.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            >
              <option value="">All Equipment</option>
              {equipmentOptions?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
        {showPickupDate && (
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Pickup Date
            </label>
            <input
              type="date"
              value={filters.pickupDate}
              onChange={(event) => onChange({ pickupDate: event.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-4">
        {showMinRate && (
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              Min Rate ($)
            </label>
            <input
              type="number"
              min={0}
              value={filters.minRate ?? ''}
              onChange={(event) => handleNumberChange(event.target.value, 'minRate')}
              placeholder="1000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        )}
        {showMaxMiles && (
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <Ruler className="h-4 w-4 text-blue-500" />
              Max Miles
            </label>
            <input
              type="number"
              min={0}
              value={filters.maxMiles ?? ''}
              onChange={(event) => handleNumberChange(event.target.value, 'maxMiles')}
              placeholder="Enter distance"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        )}
        {showRateType && (
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-500" />
              Rate Type
            </label>
            <select
              value={filters.rateType ?? ''}
              onChange={(event) => onChange({ rateType: event.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            >
              {rateTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {showRadius && (
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Radius (miles)
            </label>
            <input
              type="number"
              min={0}
              value={filters.radiusMiles ?? ''}
              onChange={(event) => handleNumberChange(event.target.value, 'radiusMiles')}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">
              Radius uses state-level centroids when detailed coordinates are unavailable.
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {showKeywords && (
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-500" />
              Keywords
            </label>
            <input
              type="text"
              value={filters.keywords}
              onChange={(event) => onChange({ keywords: event.target.value })}
              placeholder="Carrier name, commodity, lanes..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        )}
        {showStateShortcut && (
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              Quick State Picker
            </label>
            <select
              defaultValue=""
              onChange={(event) => {
                const value = event.target.value;
                if (value) {
                  onChange({ origin: value, stateShortcut: value });
                  event.target.value = '';
                }
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-slate-600"
            >
              <option value="">Select a state shortcut</option>
              {stateOptions.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name} ({code})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Selecting a state fills the origin input for quick radius searches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardSearchBar;


