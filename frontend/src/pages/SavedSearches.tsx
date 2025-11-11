import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { savedSearchService, type SavedSearch } from '../services/savedSearch.service';
import { useUIStore } from '../store/uiStore';
import { Bookmark, Search, Bell, BellOff, Trash2, Play, Settings } from 'lucide-react';
import { ROUTES } from '../utils/constants';

const SavedSearches = () => {
  const { addNotification } = useUIStore();
  const navigate = useNavigate();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSearches = useCallback(async () => {
    try {
      const response = await savedSearchService.getSearches();
      if (response.success) {
        setSearches(response.data);
      }
    } catch {
      addNotification({ type: 'error', message: 'Failed to load saved searches' });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  const handleQuickApply = (search: SavedSearch) => {
    try {
      const params = new URLSearchParams();
      params.set('prefill', 'saved');
      params.set('saved', search._id);
      params.set('name', search.name);

      if (search.filters.originState) {
        params.set('originState', search.filters.originState);
        params.set('state', search.filters.originState);
      }

      if (search.filters.destinationState) {
        params.set('destinationState', search.filters.destinationState);
        params.set('destination', search.filters.destinationState);
      }

      if (search.filters.equipment && search.filters.equipment.length > 0) {
        params.set('equipment', search.filters.equipment[0]);
      }

      if (typeof search.filters.priceMin === 'number') {
        params.set('minRate', String(search.filters.priceMin));
      }

      if (typeof search.filters.radius === 'number') {
        params.set('radius', String(search.filters.radius));
      }

      navigate({ pathname: ROUTES.LOAD_BOARD, search: params.toString() });
      addNotification({ type: 'success', message: `Applied search: ${search.name}` });
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to apply search' });
    }
  };

  const handleToggleAlert = async (search: SavedSearch) => {
    try {
      const response = await savedSearchService.toggleAlert(search._id, !search.alertEnabled);
      if (response.success) {
        setSearches(searches.map(s => s._id === search._id ? response.data : s));
        addNotification({ 
          type: 'success', 
          message: `Alerts ${response.data.alertEnabled ? 'enabled' : 'disabled'}` 
        });
      }
    } catch {
      addNotification({ type: 'error', message: 'Failed to toggle alert' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return;
    
    try {
      const response = await savedSearchService.deleteSearch(id);
      if (response.success) {
        setSearches(searches.filter(s => s._id !== id));
        addNotification({ type: 'success', message: 'Saved search deleted' });
      }
    } catch {
      addNotification({ type: 'error', message: 'Failed to delete search' });
    }
  };

  const formatFrequency = (freq: string) => {
    switch (freq) {
      case 'instant': return 'Every hour';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      default: return freq;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900">
            Saved Searches
          </h1>
          <p className="text-xl text-gray-700 mt-2">
            Manage your custom load search filters and alerts
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 card">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-blue/30 border-t-orange-accent"></div>
            <p className="text-gray-700 text-lg mt-6 font-medium">Loading saved searches...</p>
          </div>
        ) : searches.length > 0 ? (
          <div className="grid gap-6">
            {searches.map((search, index) => (
              <div 
                key={search._id}
                className="card border-2 border-gray-200 hover:border-primary-blue transition-all animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Search Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-heading font-bold text-gray-900 flex items-center gap-2">
                        <Bookmark className="h-6 w-6 text-primary-blue" />
                        {search.name}
                      </h3>
                      <span className={`badge ${search.alertEnabled ? 'badge-success' : 'badge-warning'}`}>
                        {search.alertEnabled ? 'Alerts ON' : 'Alerts OFF'}
                      </span>
                    </div>

                    {/* Filters Summary */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {search.filters.equipment && search.filters.equipment.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Search className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Equipment:</span>
                          <span className="text-gray-700">
                            {search.filters.equipment.join(', ')}
                          </span>
                        </div>
                      )}
                      {(search.filters.priceMin || search.filters.priceMax) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Settings className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Price:</span>
                          <span className="text-gray-700">
                            ${search.filters.priceMin?.toLocaleString() || '0'} - 
                            ${search.filters.priceMax?.toLocaleString() || '∞'}
                          </span>
                        </div>
                      )}
                      {search.filters.originState && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Origin:</span>
                          <span className="text-gray-700">{search.filters.originState}</span>
                        </div>
                      )}
                      {search.filters.destinationState && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Destination:</span>
                          <span className="text-gray-700">{search.filters.destinationState}</span>
                        </div>
                      )}
                    </div>

                    {/* Alert Settings */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {search.alertEnabled && (
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-green-600" />
                          <span>{formatFrequency(search.frequency)}</span>
                        </div>
                      )}
                      {search.lastAlertSent && (
                        <span className="text-xs">
                          Last alert: {new Date(search.lastAlertSent).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <button
                      onClick={() => handleQuickApply(search)}
                      className="btn btn-primary w-full"
                    >
                      <Play className="h-5 w-5" />
                      Apply Search
                    </button>
                    <button
                      onClick={() => handleToggleAlert(search)}
                      className={`btn w-full flex items-center justify-center gap-2 ${
                        search.alertEnabled ? 'btn-secondary' : 'btn-accent'
                      }`}
                    >
                      {search.alertEnabled ? (
                        <>
                          <BellOff className="h-5 w-5" />
                          Disable Alert
                        </>
                      ) : (
                        <>
                          <Bell className="h-5 w-5" />
                          Enable Alert
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(search._id)}
                      className="btn btn-danger w-full"
                    >
                      <Trash2 className="h-5 w-5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 card">
            <Bookmark className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">
              No Saved Searches
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Create a saved search from the Load Board to get notified about matching loads
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSearches;

