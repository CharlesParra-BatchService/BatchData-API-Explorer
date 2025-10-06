import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

const IntelFilters = ({ filters, onChange }) => {
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
          <h3 className="text-lg font-semibold text-gray-900">Intel Filters</h3>
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
            <DateFilterField
              label="Last Sold Date"
              category="lastSoldDate"
              minValue={filters.lastSoldDate?.minDate}
              maxValue={filters.lastSoldDate?.maxDate}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Last Sold Price"
              category="lastSoldPrice"
              minValue={filters.lastSoldPrice?.min}
              maxValue={filters.lastSoldPrice?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Sale Propensity (0-100)"
              category="salePropensity"
              minValue={filters.salePropensity?.min}
              maxValue={filters.salePropensity?.max}
              onFieldChange={handleChange}
            />
          </div>

          {Object.keys(filters).length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Active Intel Filters:</strong>
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

export default IntelFilters;
