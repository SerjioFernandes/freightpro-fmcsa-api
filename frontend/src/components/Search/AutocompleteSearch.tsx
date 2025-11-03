import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { searchService } from '../../services/search.service';

interface AutocompleteSearchProps {
  onSelect: (value: string) => void;
  placeholder?: string;
  type?: 'origin' | 'destination';
}

const AutocompleteSearch = ({ onSelect, placeholder = 'Search...', type = 'origin' }: AutocompleteSearchProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(async () => {
        setIsLoading(true);
        try {
          const response = await searchService.autocomplete(query, type);
          if (response.success && response.data) {
            setSuggestions(response.data);
            setIsOpen(true);
          }
        } catch (error) {
          console.error('Autocomplete error:', error);
        } finally {
          setIsLoading(false);
        }
      }, 300); // Debounce 300ms

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query, type]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setQuery(value);
    setIsOpen(false);
    onSelect(value);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto animate-slide-down">
          {isLoading ? (
            <div className="p-4 text-center text-gray-600">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-blue/30 border-t-orange-accent"></div>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSelect(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-primary-blue/5 transition-colors"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 && (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;

