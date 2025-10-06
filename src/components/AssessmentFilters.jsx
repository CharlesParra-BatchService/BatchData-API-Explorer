import React, { useCallback, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FilterField = React.memo(({ label, category, minValue, maxValue, onFieldChange }) => {
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

FilterField.displayName = 'FilterField';

const AssessmentFilters = ({ filters, onChange }) => {
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
          Assessment Filters
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
        <FilterField
          label="Assessment Year"
          category="assessmentYear"
          minValue={filters.assessmentYear?.min}
          maxValue={filters.assessmentYear?.max}
          onFieldChange={handleChange}
        />

        <FilterField
          label="Total Assessed Value"
          category="totalAssessedValue"
          minValue={filters.totalAssessedValue?.min}
          maxValue={filters.totalAssessedValue?.max}
          onFieldChange={handleChange}
        />

        <FilterField
          label="Assessed Improvement Value"
          category="assessedImprovementValue"
          minValue={filters.assessedImprovementValue?.min}
          maxValue={filters.assessedImprovementValue?.max}
          onFieldChange={handleChange}
        />

        <FilterField
          label="Assessed Land Value"
          category="assessedLandValue"
          minValue={filters.assessedLandValue?.min}
          maxValue={filters.assessedLandValue?.max}
          onFieldChange={handleChange}
        />

        <FilterField
          label="Market Value Year"
          category="marketValueYear"
          minValue={filters.marketValueYear?.min}
          maxValue={filters.marketValueYear?.max}
          onFieldChange={handleChange}
        />

        <FilterField
          label="Land Market Value"
          category="landMarketValue"
          minValue={filters.landMarketValue?.min}
          maxValue={filters.landMarketValue?.max}
          onFieldChange={handleChange}
        />

        <FilterField
          label="Improvement Market Value"
          category="improvementMarketValue"
          minValue={filters.improvementMarketValue?.min}
          maxValue={filters.improvementMarketValue?.max}
          onFieldChange={handleChange}
        />

        <FilterField
          label="Total Market Value"
          category="totalMarketValue"
          minValue={filters.totalMarketValue?.min}
          maxValue={filters.totalMarketValue?.max}
          onFieldChange={handleChange}
        />
          </div>

          {Object.keys(filters).length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Active Assessment Filters:</strong>
                <span className="block mt-1 space-y-1">
                  {Object.entries(filters).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const parts = [];
                    if (value.min !== undefined) parts.push(`Min: ${Number(value.min).toLocaleString()}`);
                    if (value.max !== undefined) parts.push(`Max: ${Number(value.max).toLocaleString()}`);
                    return (
                      <span key={key} className="block">
                        • {label}: {parts.join(', ')}
                      </span>
                    );
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

export default AssessmentFilters;
