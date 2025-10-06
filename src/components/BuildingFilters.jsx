import React, { useCallback, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  BASEMENT_TYPES,
  BUILDING_CONDITIONS,
  BUILDING_QUALITY,
  POOL_TYPES,
  GARAGE_TYPES,
  CONSTRUCTION_TYPES,
  ROOF_COVER,
  BUILDING_STYLE
} from '../constants/buildingCodes';

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

const BuildingFilters = ({ filters, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
          Building Filters
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
              label="Year Built"
              category="yearBuilt"
              minValue={filters.yearBuilt?.min}
              maxValue={filters.yearBuilt?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Bedroom Count"
              category="bedroomCount"
              minValue={filters.bedroomCount?.min}
              maxValue={filters.bedroomCount?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Bathroom Count"
              category="bathroomCount"
              minValue={filters.bathroomCount?.min}
              maxValue={filters.bathroomCount?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Total Building Area (Sq Ft)"
              category="totalBuildingAreaSquareFeet"
              minValue={filters.totalBuildingAreaSquareFeet?.min}
              maxValue={filters.totalBuildingAreaSquareFeet?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Story Count"
              category="storyCount"
              minValue={filters.storyCount?.min}
              maxValue={filters.storyCount?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Room Count"
              category="roomCount"
              minValue={filters.roomCount?.min}
              maxValue={filters.roomCount?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Unit Count"
              category="unitCount"
              minValue={filters.unitCount?.min}
              maxValue={filters.unitCount?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Garage Parking Spaces"
              category="garageParkingSpaceCount"
              minValue={filters.garageParkingSpaceCount?.min}
              maxValue={filters.garageParkingSpaceCount?.max}
              onFieldChange={handleChange}
            />

            <NumericFilterField
              label="Building Count"
              category="buildingCount"
              minValue={filters.buildingCount?.min}
              maxValue={filters.buildingCount?.max}
              onFieldChange={handleChange}
            />

            <SelectFilterField
              label="Basement Type"
              category="basementType"
              values={filters.basementType?.inList}
              options={BASEMENT_TYPES}
              onFieldChange={handleChange}
            />

            <SelectFilterField
              label="Building Condition"
              category="buildingCondition"
              values={filters.buildingCondition?.inList}
              options={BUILDING_CONDITIONS}
              onFieldChange={handleChange}
            />

            <SelectFilterField
              label="Building Quality"
              category="buildingQuality"
              values={filters.buildingQuality?.inList}
              options={BUILDING_QUALITY}
              onFieldChange={handleChange}
            />

            <SelectFilterField
              label="Pool"
              category="pool"
              values={filters.pool?.inList}
              options={POOL_TYPES}
              onFieldChange={handleChange}
            />

            <SelectFilterField
              label="Garage Type"
              category="garage"
              values={filters.garage?.inList}
              options={GARAGE_TYPES}
              onFieldChange={handleChange}
            />

            <SelectFilterField
              label="Construction Type"
              category="constructionType"
              values={filters.constructionType?.inList}
              options={CONSTRUCTION_TYPES}
              onFieldChange={handleChange}
            />

            <SelectFilterField
              label="Roof Cover"
              category="roofCover"
              values={filters.roofCover?.inList}
              options={ROOF_COVER}
              onFieldChange={handleChange}
            />

            <SelectFilterField
              label="Building Style"
              category="style"
              values={filters.style?.inList}
              options={BUILDING_STYLE}
              onFieldChange={handleChange}
            />
          </div>

          {Object.keys(filters).length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Active Building Filters:</strong>
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

export default BuildingFilters;
