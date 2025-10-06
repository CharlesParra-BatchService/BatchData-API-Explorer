import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FORECLOSURE_STATUS_TYPES } from '../constants/foreclosureCodes';

const NumericFilterField = React.memo(({ label, category, minValue, maxValue, onFieldChange }) => {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Min"
          value={minValue ?? ''}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, '');
            onFieldChange(category, 'min', val);
          }}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Max"
          value={maxValue ?? ''}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, '');
            onFieldChange(category, 'max', val);
          }}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
});

NumericFilterField.displayName = 'NumericFilterField';

const DateFilterField = React.memo(({ label, category, minValue, maxValue, onFieldChange }) => {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={minValue ?? ''}
          onChange={(e) => onFieldChange(category, 'minDate', e.target.value || undefined)}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="date"
          value={maxValue ?? ''}
          onChange={(e) => onFieldChange(category, 'maxDate', e.target.value || undefined)}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
});

DateFilterField.displayName = 'DateFilterField';

const SelectFilterField = React.memo(({ label, category, values = [], options, onFieldChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  const handleToggle = (value) => {
    const currentValues = values || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    onFieldChange(category, 'inList', newValues.length > 0 ? newValues : undefined);
  };

  const selectedCount = (values || []).length;
  const displayText = selectedCount === 0
    ? 'All'
    : selectedCount === 1
    ? options.find(opt => opt.value === values[0])?.label || values[0]
    : `${selectedCount} selected`;

  return (
    <div className="p-3 bg-gray-50 rounded-lg relative" ref={dropdownRef}>
      <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 py-1 text-sm text-left border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex justify-between items-center"
      >
        <span className={selectedCount === 0 ? 'text-gray-500' : 'text-gray-900'}>{displayText}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={() => onFieldChange(category, 'inList', undefined)}
                className="w-full text-left px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded mb-1"
              >
                Clear All
              </button>
            )}
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer rounded"
              >
                <input
                  type="checkbox"
                  checked={(values || []).includes(option.value)}
                  onChange={() => handleToggle(option.value)}
                  className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

SelectFilterField.displayName = 'SelectFilterField';

const ForeclosureFilters = ({ filters, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = useCallback((category, filterType, value) => {
    onChange(prevFilters => {
      const newFilters = { ...prevFilters };

      if (!newFilters[category]) {
        newFilters[category] = {};
      }

      if (value === undefined || value === '') {
        delete newFilters[category][filterType];
        if (Object.keys(newFilters[category]).length === 0) {
          delete newFilters[category];
        }
      } else {
        newFilters[category][filterType] = value;
      }

      return newFilters;
    });
  }, [onChange]);

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div
        className="flex items-center justify-between cursor-pointer mb-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Foreclosure Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectFilterField
              label="Status"
              category="status"
              values={filters.status?.inList}
              options={FORECLOSURE_STATUS_TYPES}
              onFieldChange={handleChange}
            />

            <DateFilterField
              label="Recording Date"
              category="recordingDate"
              minValue={filters.recordingDate?.minDate}
              maxValue={filters.recordingDate?.maxDate}
              onFieldChange={handleChange}
            />

            <DateFilterField
              label="Auction Date"
              category="auctionDate"
              minValue={filters.auctionDate?.minDate}
              maxValue={filters.auctionDate?.maxDate}
              onFieldChange={handleChange}
            />

            <DateFilterField
              label="Release Date"
              category="releaseDate"
              minValue={filters.releaseDate?.minDate}
              maxValue={filters.releaseDate?.maxDate}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Auction Minimum Bid Amount"
              category="auctionMinimumBidAmount"
              minValue={filters.auctionMinimumBidAmount?.min}
              maxValue={filters.auctionMinimumBidAmount?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Past Due Amount"
              category="pastDueAmount"
              minValue={filters.pastDueAmount?.min}
              maxValue={filters.pastDueAmount?.max}
              onFieldChange={handleChange}
            />
          </div>

          {Object.keys(filters).length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Active Foreclosure Filters:</strong>
                <span className="block mt-1 space-y-1">
                  {Object.entries(filters).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const parts = [];

                    // Handle numeric min/max filters
                    if (value.min !== undefined) parts.push(`Min: ${Number(value.min).toLocaleString()}`);
                    if (value.max !== undefined) parts.push(`Max: ${Number(value.max).toLocaleString()}`);

                    // Handle date min/max filters
                    if (value.minDate !== undefined) parts.push(`From: ${value.minDate}`);
                    if (value.maxDate !== undefined) parts.push(`To: ${value.maxDate}`);

                    // Handle string filters (inList) - show count instead of values
                    if (value.inList !== undefined && value.inList.length > 0) {
                      parts.push(`${value.inList.length} selected`);
                    }

                    return parts.length > 0 ? (
                      <span key={key} className="block">
                        • {label}: {parts.join(', ')}
                      </span>
                    ) : null;
                  })}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ForeclosureFilters;
