import React, { useState } from 'react';
import { Search, MapPin, Loader2, AlertCircle, Code, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import AssessmentFilters from '../components/AssessmentFilters';
import BuildingFilters from '../components/BuildingFilters';
import DemographicFilters from '../components/DemographicFilters';
import ForeclosureFilters from '../components/ForeclosureFilters';
import PropertyClassificationFilters from '../components/PropertyClassificationFilters';

const PropertySearchPage = ({ apiToken }) => {
  const [city, setCity] = useState('Phoenix');
  const [state, setState] = useState('AZ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [quicklistCounts, setQuicklistCounts] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [andQuicklists, setAndQuicklists] = useState([]);
  const [orQuicklists, setOrQuicklists] = useState([]);
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [requestPayload, setRequestPayload] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [additionalCriteria, setAdditionalCriteria] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [assessmentFilters, setAssessmentFilters] = useState({});
  const [buildingFilters, setBuildingFilters] = useState({});
  const [demographicFilters, setDemographicFilters] = useState({});
  const [foreclosureFilters, setForeclosureFilters] = useState({});
  const [propertyClassificationFilters, setPropertyClassificationFilters] = useState({
    propertyTypeCategory: { inList: ['Residential'] }
  });
  const [quickFiltersExpanded, setQuickFiltersExpanded] = useState(true);
  const [assessmentFiltersExpanded, setAssessmentFiltersExpanded] = useState(true);

  const API_URL = 'https://api.batchdata.com/api/v1/property/search';

  const availableQuicklists = [
    'absentee-owner', 'active-auction', 'active-listing', 'canceled-listing',
    'cash-buyer', 'corporate-owned', 'expired-listing', 'failed-listing',
    'fix-and-flip', 'free-and-clear', 'for-sale-by-owner', 'has-hoa',
    'has-hoa-fees', 'high-equity', 'inherited', 'involuntary-lien',
    'in-state-absentee-owner', 'listed-below-market-price', 'low-equity',
    'mailing-address-vacant', 'notice-of-default', 'notice-of-lis-pendens',
    'notice-of-sale', 'on-market', 'out-of-state-absentee-owner',
    'out-of-state-owner', 'owner-occupied', 'pending-listing', 'preforeclosure',
    'recently-sold', 'same-property-and-mailing-address', 'tax-default',
    'tired-landlord', 'unknown-equity', 'vacant', 'vacant-lot'
  ];

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!city.trim() || !state.trim()) {
      setError('Please enter both city and state');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setQuicklistCounts(null);
    setJsonError('');

    const searchQuery = `${city.trim()}, ${state.trim()}`;

    const requestBody = {
      searchCriteria: {
        query: searchQuery
      },
      options: {
        skip: 0,
        take: 0,
        quicklistCounts: true
      }
    };

    if (andQuicklists.length > 0) {
      requestBody.searchCriteria.quickLists = andQuicklists;
    }
    if (orQuicklists.length > 0) {
      requestBody.searchCriteria.orQuickLists = orQuicklists;
    }

    // Merge property classification filters (general)
    if (Object.keys(propertyClassificationFilters).length > 0) {
      const processedGeneralFilters = {};
      Object.entries(propertyClassificationFilters).forEach(([category, values]) => {
        processedGeneralFilters[category] = {};

        // Handle string fields (inList, etc.)
        if (values.inList !== undefined) {
          processedGeneralFilters[category].inList = values.inList;
        }
      });
      requestBody.searchCriteria.general = processedGeneralFilters;
    }

    // Merge building filters and convert numeric values to numbers
    if (Object.keys(buildingFilters).length > 0) {
      const processedBuildingFilters = {};
      Object.entries(buildingFilters).forEach(([category, values]) => {
        processedBuildingFilters[category] = {};

        // Handle numeric min/max fields
        if (values.min !== undefined) {
          processedBuildingFilters[category].min = Number(values.min);
        }
        if (values.max !== undefined) {
          processedBuildingFilters[category].max = Number(values.max);
        }

        // Handle string fields (inList, etc.)
        if (values.inList !== undefined) {
          processedBuildingFilters[category].inList = values.inList;
        }
      });
      requestBody.searchCriteria.building = processedBuildingFilters;
    }

    // Merge assessment filters and convert to numbers
    if (Object.keys(assessmentFilters).length > 0) {
      const numericAssessmentFilters = {};
      Object.entries(assessmentFilters).forEach(([category, values]) => {
        numericAssessmentFilters[category] = {};
        if (values.min !== undefined) {
          numericAssessmentFilters[category].min = Number(values.min);
        }
        if (values.max !== undefined) {
          numericAssessmentFilters[category].max = Number(values.max);
        }
      });
      requestBody.searchCriteria.assessment = numericAssessmentFilters;
    }

    // Merge demographic filters and convert numeric values to numbers
    if (Object.keys(demographicFilters).length > 0) {
      const processedDemographicFilters = {};
      Object.entries(demographicFilters).forEach(([category, values]) => {
        processedDemographicFilters[category] = {};

        // Handle numeric min/max fields
        if (values.min !== undefined) {
          processedDemographicFilters[category].min = Number(values.min);
        }
        if (values.max !== undefined) {
          processedDemographicFilters[category].max = Number(values.max);
        }

        // Handle string fields (inList, etc.)
        if (values.inList !== undefined) {
          processedDemographicFilters[category].inList = values.inList;
        }

        // Handle boolean fields (equals, etc.)
        if (values.equals !== undefined && typeof values.equals === 'boolean') {
          processedDemographicFilters[category].equals = values.equals;
        }
      });
      requestBody.searchCriteria.demographics = processedDemographicFilters;
    }

    // Merge foreclosure filters
    if (Object.keys(foreclosureFilters).length > 0) {
      const processedForeclosureFilters = {};
      Object.entries(foreclosureFilters).forEach(([category, values]) => {
        processedForeclosureFilters[category] = {};

        // Handle numeric min/max fields
        if (values.min !== undefined) {
          processedForeclosureFilters[category].min = Number(values.min);
        }
        if (values.max !== undefined) {
          processedForeclosureFilters[category].max = Number(values.max);
        }

        // Handle date fields (minDate/maxDate)
        if (values.minDate !== undefined) {
          processedForeclosureFilters[category].minDate = values.minDate;
        }
        if (values.maxDate !== undefined) {
          processedForeclosureFilters[category].maxDate = values.maxDate;
        }

        // Handle string fields (inList, etc.)
        if (values.inList !== undefined) {
          processedForeclosureFilters[category].inList = values.inList;
        }
      });
      requestBody.searchCriteria.foreclosure = processedForeclosureFilters;
    }

    // Parse and merge additional JSON criteria
    if (additionalCriteria.trim()) {
      try {
        const jsonToParse = additionalCriteria.trim().startsWith('{')
          ? additionalCriteria
          : `{${additionalCriteria}}`;
        const parsedCriteria = JSON.parse(jsonToParse);
        Object.assign(requestBody.searchCriteria, parsedCriteria);
      } catch (err) {
        setJsonError('Invalid JSON format in additional criteria');
        setLoading(false);
        return;
      }
    }

    try {
      console.log('Sending request:', requestBody);

      setRequestPayload(requestBody);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API Response:', data);

      setApiResponse(data);

      if (!response.ok) {
        const errorMessage = data.status?.message || data.message || `API request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      if (data.results?.meta?.results?.resultsFound !== undefined) {
        const propertyCount = data.results.meta.results.resultsFound;

        const searchResult = {
          city: city.trim(),
          state: state.trim().toUpperCase(),
          count: propertyCount,
          timestamp: new Date().toLocaleString()
        };

        setResult(searchResult);

        if (data.results?.quicklistCounts) {
          setQuicklistCounts(data.results.quicklistCounts);
        }

        setSearchHistory(prev => [searchResult, ...prev.slice(0, 4)]);
      } else {
        console.error('Unexpected response structure:', data);
        throw new Error('Unexpected response format from API. Check console for details.');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statesList = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatQuicklistName = (name) => {
    return name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const toggleAndQuicklist = (quicklist) => {
    setAndQuicklists(prev =>
      prev.includes(quicklist)
        ? prev.filter(q => q !== quicklist)
        : [...prev, quicklist]
    );
  };

  const toggleOrQuicklist = (quicklist) => {
    setOrQuicklists(prev =>
      prev.includes(quicklist)
        ? prev.filter(q => q !== quicklist)
        : [...prev, quicklist]
    );
  };

  const clearAllQuicklists = () => {
    setAndQuicklists([]);
    setOrQuicklists([]);
  };

  const copyToClipboard = async (text, setCopiedState) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Phoenix"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                <option value="">Select a state</option>
                {statesList.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="additionalCriteria" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Search Criteria (JSON)
            </label>
            <textarea
              id="additionalCriteria"
              value={additionalCriteria}
              onChange={(e) => setAdditionalCriteria(e.target.value)}
              placeholder='e.g., "building": {"yearBuilt": {"min": 2000}}'
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              rows="3"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter valid JSON object properties to add to searchCriteria (without outer curly braces)
            </p>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {jsonError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{jsonError}</span>
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setQuickFiltersExpanded(!quickFiltersExpanded)}
            className="flex items-center gap-2 text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
          >
            {quickFiltersExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            Quick Filters
            {(andQuicklists.length > 0 || orQuicklists.length > 0) && (
              <span className="text-sm font-normal text-indigo-600">
                ({andQuicklists.length + orQuicklists.length} active)
              </span>
            )}
          </button>
          {(andQuicklists.length > 0 || orQuicklists.length > 0) && (
            <button
              onClick={clearAllQuicklists}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Clear All
            </button>
          )}
        </div>

        {quickFiltersExpanded && (
          <>
            <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Must Match ALL (AND) - {andQuicklists.length} selected
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableQuicklists.map(quicklist => (
              <button
                key={quicklist}
                onClick={() => toggleAndQuicklist(quicklist)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  andQuicklists.includes(quicklist)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formatQuicklistName(quicklist)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Match ANY (OR) - {orQuicklists.length} selected
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableQuicklists.map(quicklist => (
              <button
                key={quicklist}
                onClick={() => toggleOrQuicklist(quicklist)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  orQuicklists.includes(quicklist)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formatQuicklistName(quicklist)}
              </button>
            ))}
          </div>
        </div>

            {(andQuicklists.length > 0 || orQuicklists.length > 0) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Active Filters:</strong>
                  {andQuicklists.length > 0 && (
                    <span className="block mt-1">
                      AND: {andQuicklists.map(formatQuicklistName).join(', ')}
                    </span>
                  )}
                  {orQuicklists.length > 0 && (
                    <span className="block mt-1">
                      OR: {orQuicklists.map(formatQuicklistName).join(', ')}
                    </span>
                  )}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Property Classification */}
      <PropertyClassificationFilters
        filters={propertyClassificationFilters}
        onChange={setPropertyClassificationFilters}
      />

      {/* Building Filters */}
      <BuildingFilters
        filters={buildingFilters}
        onChange={setBuildingFilters}
      />

      {/* Assessment Filters */}
      <AssessmentFilters
        filters={assessmentFilters}
        onChange={setAssessmentFilters}
      />

      {/* Demographic Filters */}
      <DemographicFilters
        filters={demographicFilters}
        onChange={setDemographicFilters}
      />

      {/* Foreclosure Filters */}
      <ForeclosureFilters
        filters={foreclosureFilters}
        onChange={setForeclosureFilters}
      />

      {/* Search Button */}
      <div className="mt-6 mb-6">
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-semibold shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-6 w-6" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-6 w-6" />
              Search Properties
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Search Results</h2>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="text-center">
              <p className="text-lg opacity-90 mb-2">
                {result.city}, {result.state}
              </p>
              <p className="text-5xl font-bold mb-2">
                {formatNumber(result.count)}
              </p>
              <p className="text-lg opacity-90">
                Properties Found
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">
            Search performed at {result.timestamp}
          </p>
        </div>
      )}

      {/* Quicklist Counts */}
      {quicklistCounts && quicklistCounts.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Property Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quicklistCounts.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-md border border-gray-200 hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {item.name.replace(/-/g, ' ')}
                  </span>
                  <span className="font-semibold text-indigo-600">
                    {formatNumber(item.count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Searches</h3>
          <div className="space-y-2">
            {searchHistory.map((search, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <span className="font-medium text-gray-700">
                    {search.city}, {search.state}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({search.timestamp})
                  </span>
                </div>
                <span className="font-semibold text-indigo-600">
                  {formatNumber(search.count)} properties
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JSON Viewer Toggle */}
      {(requestPayload || apiResponse) && (
        <div className="mb-6">
          <button
            onClick={() => setShowJsonViewer(!showJsonViewer)}
            className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 transition duration-200 flex items-center justify-center"
          >
            <Code className="mr-2 h-5 w-5" />
            {showJsonViewer ? 'Hide' : 'View'} Request & Response JSON
          </button>
        </div>
      )}

      {/* JSON Viewer */}
      {showJsonViewer && (requestPayload || apiResponse) && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">API Details</h2>

          {requestPayload && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-700">Request Payload</h3>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(requestPayload, null, 2), setCopiedRequest)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {copiedRequest ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(requestPayload, null, 2)}
              </pre>
            </div>
          )}

          {apiResponse && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-700">API Response</h3>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(apiResponse, null, 2), setCopiedResponse)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {copiedResponse ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-sm max-h-96">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* API Documentation Link */}
      <div className="mt-8 text-center">
        <a
          href="https://developer.batchdata.com/docs/batchdata/batchdata-v1/operations/create-a-property-search"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 underline text-sm"
        >
          View API Documentation
        </a>
      </div>
    </div>
  );
};

export default PropertySearchPage;
