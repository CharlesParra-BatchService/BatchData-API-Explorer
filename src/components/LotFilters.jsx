import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Numeric Filter Field Component
const NumericFilterField = React.memo(({ label, category, minValue, maxValue, onFieldChange }) => {
  const [localMin, setLocalMin] = useState(minValue || '');
  const [localMax, setLocalMax] = useState(maxValue || '');

  useEffect(() => {
    setLocalMin(minValue || '');
    setLocalMax(maxValue || '');
  }, [minValue, maxValue]);

  const handleMinChange = useCallback((e) => {
    const value = e.target.value;
    setLocalMin(value);
    onFieldChange(category, 'min', value || undefined);
  }, [category, onFieldChange]);

  const handleMaxChange = useCallback((e) => {
    const value = e.target.value;
    setLocalMax(value);
    onFieldChange(category, 'max', value || undefined);
  }, [category, onFieldChange]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Min"
          value={localMin}
          onChange={handleMinChange}
          onKeyPress={(e) => {
            if (!/[\d.]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          inputMode="decimal"
          placeholder="Max"
          value={localMax}
          onChange={handleMaxChange}
          onKeyPress={(e) => {
            if (!/[\d.]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
});

NumericFilterField.displayName = 'NumericFilterField';

// Text Filter Field Component with operator selection
const TextFilterField = React.memo(({ label, category, value, operator, onFieldChange }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [localOperator, setLocalOperator] = useState(operator || 'contains');
  const [pendingValue, setPendingValue] = useState(value || '');
  const [pendingOperator, setPendingOperator] = useState(operator || 'contains');

  useEffect(() => {
    setLocalValue(value || '');
    setPendingValue(value || '');
  }, [value]);

  useEffect(() => {
    setLocalOperator(operator || 'contains');
    setPendingOperator(operator || 'contains');
  }, [operator]);

  const handleValueChange = (e) => {
    const newValue = e.target.value.slice(0, 255);
    setPendingValue(newValue);
  };

  const handleOperatorChange = (e) => {
    setPendingOperator(e.target.value);
  };

  const handleApply = useCallback(() => {
    setLocalValue(pendingValue);
    setLocalOperator(pendingOperator);

    // Clear all operators first
    onFieldChange(category, 'equals', undefined);
    onFieldChange(category, 'contains', undefined);
    onFieldChange(category, 'startsWith', undefined);
    onFieldChange(category, 'endsWith', undefined);

    // Set the selected operator
    if (pendingValue) {
      onFieldChange(category, pendingOperator, pendingValue);
    }
  }, [category, pendingValue, pendingOperator, onFieldChange]);

  const handleClear = useCallback(() => {
    setPendingValue('');
    setLocalValue('');
    setPendingOperator('contains');
    setLocalOperator('contains');

    // Clear all operators
    onFieldChange(category, 'equals', undefined);
    onFieldChange(category, 'contains', undefined);
    onFieldChange(category, 'startsWith', undefined);
    onFieldChange(category, 'endsWith', undefined);
  }, [category, onFieldChange]);

  const remainingChars = 255 - pendingValue.length;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="space-y-2">
        <select
          value={pendingOperator}
          onChange={handleOperatorChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="equals">Equals</option>
          <option value="contains">Contains</option>
          <option value="startsWith">Starts With</option>
          <option value="endsWith">Ends With</option>
        </select>
        <input
          type="text"
          placeholder={`Enter ${label.toLowerCase()}`}
          value={pendingValue}
          onChange={handleValueChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{remainingChars} characters remaining</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

TextFilterField.displayName = 'TextFilterField';

const LotFilters = ({ filters, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = useCallback((category, filterType, value) => {
    onChange(prevFilters => {
      const newFilters = { ...prevFilters };

      if (!newFilters[category]) {
        newFilters[category] = {};
      }

      if (category === 'zoningCode') {
        // Handle text field with operators
        if (value === undefined || value === '') {
          delete newFilters[category][filterType];
          if (Object.keys(newFilters[category]).length === 0) {
            delete newFilters[category];
          }
        } else {
          newFilters[category][filterType] = value;
        }
      } else {
        // Handle numeric fields
        if (value === undefined || value === '') {
          delete newFilters[category][filterType];
          if (Object.keys(newFilters[category]).length === 0) {
            delete newFilters[category];
          }
        } else {
          newFilters[category][filterType] = value;
        }
      }

      return newFilters;
    });
  }, [onChange]);

  const activeFilterCount = Object.keys(filters).length;

  // Get current zoningCode value and operator
  const currentZoningCodeValue = filters.zoningCode?.equals || filters.zoningCode?.contains ||
                                  filters.zoningCode?.startsWith || filters.zoningCode?.endsWith || '';
  const currentZoningCodeOperator = filters.zoningCode?.equals ? 'equals' :
                                     filters.zoningCode?.contains ? 'contains' :
                                     filters.zoningCode?.startsWith ? 'startsWith' :
                                     filters.zoningCode?.endsWith ? 'endsWith' : 'contains';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800">Lot Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFilterCount}
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
            <NumericFilterField
              label="Lot Size (Acres)"
              category="lotSizeAcres"
              minValue={filters.lotSizeAcres?.min}
              maxValue={filters.lotSizeAcres?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Lot Size (Sq Ft)"
              category="lotSizeSquareFeet"
              minValue={filters.lotSizeSquareFeet?.min}
              maxValue={filters.lotSizeSquareFeet?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Lot Depth (Feet)"
              category="lotDepthFeet"
              minValue={filters.lotDepthFeet?.min}
              maxValue={filters.lotDepthFeet?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Lot Frontage (Feet)"
              category="lotFrontageFeet"
              minValue={filters.lotFrontageFeet?.min}
              maxValue={filters.lotFrontageFeet?.max}
              onFieldChange={handleChange}
            />

            <TextFilterField
              label="Zoning Code"
              category="zoningCode"
              value={currentZoningCodeValue}
              operator={currentZoningCodeOperator}
              onFieldChange={handleChange}
            />
          </div>

          {Object.keys(filters).length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Active Lot Filters:</strong>
                <span className="block mt-1 space-y-1">
                  {Object.entries(filters).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const parts = [];

                    // Handle numeric min/max filters
                    if (value.min !== undefined) parts.push(`Min: ${Number(value.min).toLocaleString()}`);
                    if (value.max !== undefined) parts.push(`Max: ${Number(value.max).toLocaleString()}`);

                    // Handle text operator filters
                    if (value.equals !== undefined) parts.push(`Equals: "${value.equals}"`);
                    if (value.contains !== undefined) parts.push(`Contains: "${value.contains}"`);
                    if (value.startsWith !== undefined) parts.push(`Starts With: "${value.startsWith}"`);
                    if (value.endsWith !== undefined) parts.push(`Ends With: "${value.endsWith}"`);

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

export default LotFilters;
