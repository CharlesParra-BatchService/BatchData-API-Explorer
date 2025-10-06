import React, { useCallback, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  DEMOGRAPHICS_TYPES,
  GENDER_TYPES,
  HOMEOWNER_RENTER_TYPES,
  EDUCATION_LEVELS,
  OCCUPATION_TYPES
} from '../constants/demographicCodes';

const NumericFilterField = React.memo(({ label, category, minValue, maxValue, onFieldChange }) => {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <div>
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
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
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
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
});

NumericFilterField.displayName = 'NumericFilterField';

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

const BooleanFilterField = React.memo(({ label, category, value, onFieldChange }) => {
  const handleChange = (e) => {
    const checked = e.target.checked;
    onFieldChange(category, 'equals', checked ? true : undefined);
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={value === true}
          onChange={handleChange}
          className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </label>
    </div>
  );
});

BooleanFilterField.displayName = 'BooleanFilterField';

const DemographicFilters = ({ filters, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = useCallback((category, field, value) => {
    onChange((prevFilters) => {
      const updatedFilters = {
        ...prevFilters,
        [category]: {
          ...prevFilters[category],
          [field]: value === '' ? undefined : value
        }
      };

      // Clean up undefined values from the category object
      if (updatedFilters[category]) {
        const cleanedCategory = Object.fromEntries(
          Object.entries(updatedFilters[category]).filter(([_, v]) => v !== undefined)
        );

        if (Object.keys(cleanedCategory).length === 0) {
          delete updatedFilters[category];
        } else {
          updatedFilters[category] = cleanedCategory;
        }
      }

      return updatedFilters;
    });
  }, [onChange]);

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          Demographic Filters
          {activeFilterCount > 0 && (
            <span className="text-sm font-normal text-indigo-600">
              ({activeFilterCount} active)
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={() => onChange({})}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <NumericFilterField
              label="Age"
              category="age"
              minValue={filters.age?.min}
              maxValue={filters.age?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Household Size"
              category="householdSize"
              minValue={filters.householdSize?.min}
              maxValue={filters.householdSize?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Income"
              category="income"
              minValue={filters.income?.min}
              maxValue={filters.income?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Net Worth"
              category="netWorth"
              minValue={filters.netWorth?.min}
              maxValue={filters.netWorth?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Discretionary Income"
              category="discretionaryIncome"
              minValue={filters.discretionaryIncome?.min}
              maxValue={filters.discretionaryIncome?.max}
              onFieldChange={handleChange}
            />

            <SelectFilterField
              label="Homeowner/Renter"
              category="homeownerRenter"
              values={filters.homeownerRenter?.inList}
              options={HOMEOWNER_RENTER_TYPES}
              onFieldChange={handleChange}
            />

            <BooleanFilterField
              label="Business Owner"
              category="businessOwner"
              value={filters.businessOwner?.equals}
              onFieldChange={handleChange}
            />

            <SelectFilterField
              label="Gender"
              category="gender"
              values={filters.gender?.inList}
              options={GENDER_TYPES}
              onFieldChange={handleChange}
            />

            <SelectFilterField
              label="Demographics"
              category="demographics"
              values={filters.demographics?.inList}
              options={DEMOGRAPHICS_TYPES}
              onFieldChange={handleChange}
            />
          </div>

          {Object.keys(filters).length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Active Demographic Filters:</strong>
                <span className="block mt-1 space-y-1">
                  {Object.entries(filters).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const parts = [];

                    // Handle numeric min/max filters
                    if (value.min !== undefined) parts.push(`Min: ${Number(value.min).toLocaleString()}`);
                    if (value.max !== undefined) parts.push(`Max: ${Number(value.max).toLocaleString()}`);

                    // Handle string filters (inList) - show count instead of codes
                    if (value.inList !== undefined && value.inList.length > 0) {
                      parts.push(`${value.inList.length} selected`);
                    }

                    // Handle boolean filters
                    if (value.equals !== undefined && typeof value.equals === 'boolean') {
                      parts.push(value.equals ? 'Yes' : 'No');
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
        </>
      )}
    </div>
  );
};

export default DemographicFilters;
