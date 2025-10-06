import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TextFilterField = React.memo(({ label, category, value, operator, onFieldChange }) => {
  const [localValue, setLocalValue] = React.useState(value || '');
  const [localOperator, setLocalOperator] = React.useState(operator || 'contains');

  const handleValueChange = (e) => {
    const newValue = e.target.value.slice(0, 255); // Limit to 255 characters
    setLocalValue(newValue);
  };

  const handleOperatorChange = (e) => {
    setLocalOperator(e.target.value);
  };

  const handleApply = () => {
    if (localValue.trim()) {
      onFieldChange(category, localOperator, localValue.trim());
    } else {
      onFieldChange(category, null, undefined);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    setLocalOperator('contains');
    onFieldChange(category, null, undefined);
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        <select
          value={localOperator}
          onChange={handleOperatorChange}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="equals">Equals</option>
          <option value="contains">Contains</option>
          <option value="startsWith">Starts With</option>
          <option value="endsWith">Ends With</option>
        </select>
        <input
          type="text"
          placeholder="Enter subdivision name..."
          value={localValue}
          onChange={handleValueChange}
          maxLength={255}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
        </div>
        {localValue && (
          <div className="text-xs text-gray-500">
            {localValue.length}/255 characters
          </div>
        )}
      </div>
    </div>
  );
});

TextFilterField.displayName = 'TextFilterField';

const LegalFilters = ({ filters, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = useCallback((category, filterType, value) => {
    onChange(prevFilters => {
      const newFilters = { ...prevFilters };

      if (!newFilters[category]) {
        newFilters[category] = {};
      }

      // Clear all operators first
      delete newFilters[category].equals;
      delete newFilters[category].contains;
      delete newFilters[category].startsWith;
      delete newFilters[category].endsWith;

      if (filterType && value !== undefined && value !== '') {
        newFilters[category][filterType] = value;
      } else {
        // If no filter type or value, remove the category
        delete newFilters[category];
      }

      return newFilters;
    });
  }, [onChange]);

  const activeFilterCount = Object.keys(filters).length;

  // Get current subdivision name value and operator
  const subdivisionFilter = filters.subdivisionName || {};
  const currentValue = subdivisionFilter.equals || subdivisionFilter.contains ||
                       subdivisionFilter.startsWith || subdivisionFilter.endsWith || '';
  const currentOperator = subdivisionFilter.equals ? 'equals' :
                         subdivisionFilter.contains ? 'contains' :
                         subdivisionFilter.startsWith ? 'startsWith' :
                         subdivisionFilter.endsWith ? 'endsWith' : 'contains';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div
        className="flex items-center justify-between cursor-pointer mb-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Legal Filters</h3>
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
            <TextFilterField
              label="Subdivision Name"
              category="subdivisionName"
              value={currentValue}
              operator={currentOperator}
              onFieldChange={handleChange}
            />
          </div>

          {Object.keys(filters).length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Active Legal Filters:</strong>
                <span className="block mt-1 space-y-1">
                  {Object.entries(filters).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const parts = [];

                    // Determine the operator and value
                    if (value.equals !== undefined) {
                      parts.push(`Equals: "${value.equals}"`);
                    } else if (value.contains !== undefined) {
                      parts.push(`Contains: "${value.contains}"`);
                    } else if (value.startsWith !== undefined) {
                      parts.push(`Starts with: "${value.startsWith}"`);
                    } else if (value.endsWith !== undefined) {
                      parts.push(`Ends with: "${value.endsWith}"`);
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

export default LegalFilters;
