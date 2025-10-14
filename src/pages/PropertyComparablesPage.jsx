import React, { useState } from 'react';
import { Search, TrendingUp, Loader2, AlertCircle, Code, Copy, Check, ChevronLeft, ChevronRight, X, ExternalLink, Settings, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import PropertyClassificationFilters from '../components/PropertyClassificationFilters';

const PropertyComparablesPage = ({ apiToken }) => {
  // Subject address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Comparable options
  const [useDistance, setUseDistance] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState('miles');
  const [distanceValue, setDistanceValue] = useState('');

  const [useBedrooms, setUseBedrooms] = useState(false);
  const [minBedrooms, setMinBedrooms] = useState('');
  const [maxBedrooms, setMaxBedrooms] = useState('');

  const [useBathrooms, setUseBathrooms] = useState(false);
  const [minBathrooms, setMinBathrooms] = useState('');
  const [maxBathrooms, setMaxBathrooms] = useState('');

  const [useStories, setUseStories] = useState(false);
  const [minStories, setMinStories] = useState('');
  const [maxStories, setMaxStories] = useState('');

  const [useArea, setUseArea] = useState(false);
  const [minAreaPercent, setMinAreaPercent] = useState('');
  const [maxAreaPercent, setMaxAreaPercent] = useState('');

  const [useYearBuilt, setUseYearBuilt] = useState(false);
  const [minYearBuilt, setMinYearBuilt] = useState('');
  const [maxYearBuilt, setMaxYearBuilt] = useState('');

  const [useLotSize, setUseLotSize] = useState(false);
  const [minLotSizePercent, setMinLotSizePercent] = useState('');
  const [maxLotSizePercent, setMaxLotSizePercent] = useState('');

  const [aggComparablesMetrics, setAggComparablesMetrics] = useState(true);

  // Quick Filters
  const [andQuicklists, setAndQuicklists] = useState([]);
  const [orQuicklists, setOrQuicklists] = useState([]);
  const [quickFiltersExpanded, setQuickFiltersExpanded] = useState(false);

  // Property Classification Filters
  const [propertyClassificationFilters, setPropertyClassificationFilters] = useState({
    propertyTypeCategory: { inList: ['Residential'] }
  });

  // OR Criteria - Listing Status & Last Sale Date
  const [useOrCriteria, setUseOrCriteria] = useState(false);
  const [orListingStatuses, setOrListingStatuses] = useState([]);
  const [orMinSaleDate, setOrMinSaleDate] = useState('');
  const [orMaxSaleDate, setOrMaxSaleDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [requestPayload, setRequestPayload] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [aggMetrics, setAggMetrics] = useState(null);
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const API_URL = 'https://api.batchdata.com/api/v1/property/search';
  const PROPERTIES_PER_PAGE = 50;

  const statesList = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

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

  const toggleListingStatus = (status) => {
    setOrListingStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleSearch = async (page = 1) => {
    // Validation
    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      setError('Please fill in all address fields');
      return;
    }

    setLoading(true);
    setError('');
    setSelectedProperty(null);
    setAggMetrics(null);

    try {
      const skip = (page - 1) * PROPERTIES_PER_PAGE;

      const requestBody = {
        searchCriteria: {
          compAddress: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            zip: zip.trim()
          }
        },
        options: {
          skip: skip,
          take: PROPERTIES_PER_PAGE,
          aggComparablesMetrics: aggComparablesMetrics
        }
      };

      // Add Quick Filters (AND quicklists)
      if (andQuicklists.length > 0) {
        requestBody.searchCriteria.quickLists = andQuicklists;
      }

      // Add Quick Filters (OR quicklists)
      if (orQuicklists.length > 0) {
        requestBody.searchCriteria.orQuickLists = orQuicklists;
      }

      // Add Property Classification Filters (general)
      if (Object.keys(propertyClassificationFilters).length > 0) {
        const processedGeneralFilters = {};
        Object.entries(propertyClassificationFilters).forEach(([category, values]) => {
          processedGeneralFilters[category] = {};
          if (values.inList !== undefined) {
            processedGeneralFilters[category].inList = values.inList;
          }
        });
        requestBody.searchCriteria.general = processedGeneralFilters;
      }

      // Add OR Criteria (listing status and last sale date)
      if (useOrCriteria && (orListingStatuses.length > 0 || orMinSaleDate || orMaxSaleDate)) {
        const orArray = [];

        // Add listing status as separate object if selected
        if (orListingStatuses.length > 0) {
          orArray.push({
            listing: {
              status: {
                inList: orListingStatuses
              }
            }
          });
        }

        // Add last sold date as separate object if provided
        if (orMinSaleDate || orMaxSaleDate) {
          const dateFilter = {};
          if (orMinSaleDate) {
            dateFilter.minDate = orMinSaleDate;
          }
          if (orMaxSaleDate) {
            dateFilter.maxDate = orMaxSaleDate;
          }
          orArray.push({
            intel: {
              lastSoldDate: dateFilter
            }
          });
        }

        // Add to request body as array of separate criteria
        requestBody.searchCriteria.or = orArray;
      }

      // Add distance options if enabled
      if (useDistance && distanceValue) {
        requestBody.options.useDistance = true;
        const distance = Number(distanceValue);

        switch (distanceUnit) {
          case 'miles':
            requestBody.options.distanceMiles = distance;
            break;
          case 'yards':
            requestBody.options.distanceYards = distance;
            break;
          case 'feet':
            requestBody.options.distanceFeet = distance;
            break;
          case 'kilometers':
            requestBody.options.distanceKilometers = distance;
            break;
          case 'meters':
            requestBody.options.distanceMeters = distance;
            break;
        }
      }

      // Add bedroom options if enabled
      if (useBedrooms) {
        requestBody.options.useBedrooms = true;
        if (minBedrooms !== '') {
          requestBody.options.minBedrooms = Number(minBedrooms);
        }
        if (maxBedrooms !== '') {
          requestBody.options.maxBedrooms = Number(maxBedrooms);
        }
      }

      // Add bathroom options if enabled
      if (useBathrooms) {
        requestBody.options.useBathrooms = true;
        if (minBathrooms !== '') {
          requestBody.options.minBathrooms = Number(minBathrooms);
        }
        if (maxBathrooms !== '') {
          requestBody.options.maxBathrooms = Number(maxBathrooms);
        }
      }

      // Add stories options if enabled
      if (useStories) {
        requestBody.options.useStories = true;
        if (minStories !== '') {
          requestBody.options.minStories = Number(minStories);
        }
        if (maxStories !== '') {
          requestBody.options.maxStories = Number(maxStories);
        }
      }

      // Add area options if enabled
      if (useArea) {
        requestBody.options.useArea = true;
        if (minAreaPercent !== '') {
          requestBody.options.minAreaPercent = Number(minAreaPercent);
        }
        if (maxAreaPercent !== '') {
          requestBody.options.maxAreaPercent = Number(maxAreaPercent);
        }
      }

      // Add year built options if enabled
      if (useYearBuilt) {
        requestBody.options.useYearBuilt = true;
        if (minYearBuilt !== '') {
          requestBody.options.minYearBuilt = Number(minYearBuilt);
        }
        if (maxYearBuilt !== '') {
          requestBody.options.maxYearBuilt = Number(maxYearBuilt);
        }
      }

      // Add lot size options if enabled
      if (useLotSize) {
        requestBody.options.useLotSize = true;
        if (minLotSizePercent !== '') {
          requestBody.options.minLotSizePercent = Number(minLotSizePercent);
        }
        if (maxLotSizePercent !== '') {
          requestBody.options.maxLotSizePercent = Number(maxLotSizePercent);
        }
      }

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

      setProperties(data.results?.properties || []);
      setTotalCount(data.results?.meta?.results?.resultsFound || 0);
      setCurrentPage(page);

      // Extract aggregate metrics if present
      if (data.results?.meta?.results?.aggComparablesMetrics) {
        setAggMetrics(data.results.meta.results.aggComparablesMetrics);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Comparables lookup error:', err);
      setProperties([]);
      setTotalCount(0);
      setAggMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    handleSearch(newPage);
  };

  const totalPages = Math.ceil(totalCount / PROPERTIES_PER_PAGE);

  const copyToClipboard = async (text, setCopiedState) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatFullAddress = (property) => {
    const street = property.address?.street;
    const city = property.address?.city;
    const state = property.address?.state;
    const zip = property.address?.zip;

    return `${street}, ${city}, ${state} ${zip}`;
  };

  // Helper component to safely render any value
  const ValueDisplay = ({ value, isCurrency = false }) => {
    if (value === null || value === undefined || value === '') {
      return <span className="font-medium text-gray-800">N/A</span>;
    }
    if (typeof value === 'object') {
      return <pre className="text-xs font-medium text-gray-800 whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>;
    }
    if (typeof value === 'boolean') {
      return <span className="font-medium text-gray-800">{value ? 'Yes' : 'No'}</span>;
    }
    if (isCurrency && typeof value === 'number') {
      return <span className="font-medium text-gray-800">{formatCurrency(value)}</span>;
    }
    return <span className="font-medium text-gray-800">{String(value)}</span>;
  };

  const PropertyDetailModal = ({ property, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
            <h3 className="text-xl font-semibold text-gray-800">Property Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Address */}
            {property.address && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Address</h3>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-xl text-indigo-800 font-semibold">
                    {formatValue(property.address.street)}
                  </p>
                  <p className="text-lg text-indigo-700">
                    {formatValue(property.address.city)}, {formatValue(property.address.state)} {formatValue(property.address.zip)}
                  </p>
                  {property.address.county && (
                    <p className="text-sm text-indigo-600 mt-1">County: {property.address.county}</p>
                  )}
                </div>
              </div>
            )}

            {/* General */}
            {property.general && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(property.general).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <ValueDisplay value={value} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Building */}
            {property.building && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Building</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(property.building).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <ValueDisplay value={value} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lot */}
            {property.lot && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Lot</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(property.lot).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <ValueDisplay value={value} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valuation */}
            {property.valuation && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Valuation & Equity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(property.valuation).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <ValueDisplay value={value} isCurrency={typeof value === 'number'} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment */}
            {property.assessment && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(property.assessment).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <ValueDisplay value={value} isCurrency={typeof value === 'number'} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tax */}
            {property.tax && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Tax</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(property.tax).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <ValueDisplay value={value} isCurrency={typeof value === 'number'} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner */}
            {property.owner && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Owner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(property.owner).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <ValueDisplay value={value} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sale */}
            {property.sale && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Sale</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(property.sale).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <ValueDisplay value={value} isCurrency={key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal */}
            {property.legal && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Legal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(property.legal).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <ValueDisplay value={value} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IDs */}
            {property.ids && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">IDs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(property.ids).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <ValueDisplay value={value} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listing */}
            {(property.mls || property.listing) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Listing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(property.mls || property.listing).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <ValueDisplay value={value} isCurrency={key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demographics */}
            {property.demographics && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Demographics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(property.demographics).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <ValueDisplay value={value} isCurrency={key.toLowerCase().includes('income') || key.toLowerCase().includes('worth')} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 text-indigo-600 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-800">Property Comparables Search</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Enter a subject property address to find comparable properties in the area.
        </p>

        {/* Quick Test Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => {
              setStreet('622 W Palmaire Ave');
              setCity('Phoenix');
              setState('AZ');
              setZip('85021-8767');
            }}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            Quick Test: 622 W Palmaire Ave, Phoenix, AZ 85021-8767
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSearch(1); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g., 123 Main St"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Phoenix"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
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
                <option value="">Select state</option>
                {statesList.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                id="zip"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="e.g., 85001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Searching for comparables...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Find Comparables
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{error}</span>
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

      {/* OR Criteria - Listing Status & Last Sale Date */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="useOrCriteria"
            checked={useOrCriteria}
            onChange={(e) => setUseOrCriteria(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="useOrCriteria" className="ml-2 text-lg font-semibold text-gray-800">
            OR Criteria - Listing Status & Last Sale Date
          </label>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Filter comparables by listing status OR last sale date. Properties matching either criteria will be included.
        </p>

        {useOrCriteria && (
          <div className="space-y-6 pl-6 border-l-4 border-purple-200">
            {/* Listing Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Listing Status - {orListingStatuses.length} selected
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Active', 'Sold', 'Pending'].map(status => (
                  <button
                    key={status}
                    onClick={() => toggleListingStatus(status)}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      orListingStatuses.includes(status)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Last Sale Date */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Last Sale Date Range</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="orMinSaleDate" className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    id="orMinSaleDate"
                    value={orMinSaleDate}
                    onChange={(e) => setOrMinSaleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="orMaxSaleDate" className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    id="orMaxSaleDate"
                    value={orMaxSaleDate}
                    onChange={(e) => setOrMaxSaleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            {(orListingStatuses.length > 0 || orMinSaleDate || orMaxSaleDate) && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                <p className="text-sm text-purple-800">
                  <strong>Active OR Criteria:</strong>
                  {orListingStatuses.length > 0 && (
                    <span className="block mt-1">
                      Listing Status: {orListingStatuses.join(', ')}
                    </span>
                  )}
                  {(orMinSaleDate || orMaxSaleDate) && (
                    <span className="block mt-1">
                      Last Sale Date: {orMinSaleDate || 'Any'} to {orMaxSaleDate || 'Any'}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparable Options */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
        >
          <div className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Comparable Search Options
          </div>
          <span className="text-sm font-normal text-gray-500">
            {showOptions ? 'Hide' : 'Show'}
          </span>
        </button>

        {showOptions && (
          <div className="mt-6 space-y-6">
            {/* Distance Options */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="useDistance"
                  checked={useDistance}
                  onChange={(e) => setUseDistance(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="useDistance" className="ml-2 text-sm font-medium text-gray-700">
                  Filter by Distance
                </label>
              </div>

              {useDistance && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="distanceValue" className="block text-sm font-medium text-gray-700 mb-1">
                      Distance
                    </label>
                    <input
                      type="number"
                      id="distanceValue"
                      value={distanceValue}
                      onChange={(e) => setDistanceValue(e.target.value)}
                      placeholder="e.g., 5"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="distanceUnit" className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      id="distanceUnit"
                      value={distanceUnit}
                      onChange={(e) => setDistanceUnit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="miles">Miles</option>
                      <option value="yards">Yards</option>
                      <option value="feet">Feet</option>
                      <option value="kilometers">Kilometers</option>
                      <option value="meters">Meters</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Bedroom Options */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="useBedrooms"
                  checked={useBedrooms}
                  onChange={(e) => setUseBedrooms(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="useBedrooms" className="ml-2 text-sm font-medium text-gray-700">
                  Filter by Bedrooms (Delta from subject property)
                </label>
              </div>

              {useBedrooms && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minBedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Bedrooms (Delta)
                    </label>
                    <input
                      type="number"
                      id="minBedrooms"
                      value={minBedrooms}
                      onChange={(e) => setMinBedrooms(e.target.value)}
                      placeholder="e.g., -1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Negative values allow fewer bedrooms</p>
                  </div>
                  <div>
                    <label htmlFor="maxBedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Bedrooms (Delta)
                    </label>
                    <input
                      type="number"
                      id="maxBedrooms"
                      value={maxBedrooms}
                      onChange={(e) => setMaxBedrooms(e.target.value)}
                      placeholder="e.g., 2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Positive values allow more bedrooms</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bathroom Options */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="useBathrooms"
                  checked={useBathrooms}
                  onChange={(e) => setUseBathrooms(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="useBathrooms" className="ml-2 text-sm font-medium text-gray-700">
                  Filter by Bathrooms (Delta from subject property)
                </label>
              </div>

              {useBathrooms && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minBathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Bathrooms (Delta)
                    </label>
                    <input
                      type="number"
                      id="minBathrooms"
                      value={minBathrooms}
                      onChange={(e) => setMinBathrooms(e.target.value)}
                      placeholder="e.g., -0.5"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Negative values allow fewer bathrooms</p>
                  </div>
                  <div>
                    <label htmlFor="maxBathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Bathrooms (Delta)
                    </label>
                    <input
                      type="number"
                      id="maxBathrooms"
                      value={maxBathrooms}
                      onChange={(e) => setMaxBathrooms(e.target.value)}
                      placeholder="e.g., 1"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Positive values allow more bathrooms</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stories Options */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="useStories"
                  checked={useStories}
                  onChange={(e) => setUseStories(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="useStories" className="ml-2 text-sm font-medium text-gray-700">
                  Filter by Stories (Delta from subject property)
                </label>
              </div>

              {useStories && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minStories" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Stories (Delta)
                    </label>
                    <input
                      type="number"
                      id="minStories"
                      value={minStories}
                      onChange={(e) => setMinStories(e.target.value)}
                      placeholder="e.g., -1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Negative values allow fewer stories</p>
                  </div>
                  <div>
                    <label htmlFor="maxStories" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Stories (Delta)
                    </label>
                    <input
                      type="number"
                      id="maxStories"
                      value={maxStories}
                      onChange={(e) => setMaxStories(e.target.value)}
                      placeholder="e.g., 1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Positive values allow more stories</p>
                  </div>
                </div>
              )}
            </div>

            {/* Area Options */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="useArea"
                  checked={useArea}
                  onChange={(e) => setUseArea(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="useArea" className="ml-2 text-sm font-medium text-gray-700">
                  Filter by Living Area (Percent delta from subject property)
                </label>
              </div>

              {useArea && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minAreaPercent" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Area Percent (%)
                    </label>
                    <input
                      type="number"
                      id="minAreaPercent"
                      value={minAreaPercent}
                      onChange={(e) => setMinAreaPercent(e.target.value)}
                      placeholder="e.g., -20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Negative % allows smaller area (e.g., -20 = 20% smaller)</p>
                  </div>
                  <div>
                    <label htmlFor="maxAreaPercent" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Area Percent (%)
                    </label>
                    <input
                      type="number"
                      id="maxAreaPercent"
                      value={maxAreaPercent}
                      onChange={(e) => setMaxAreaPercent(e.target.value)}
                      placeholder="e.g., 20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Positive % allows larger area (e.g., 20 = 20% larger)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Year Built Options */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="useYearBuilt"
                  checked={useYearBuilt}
                  onChange={(e) => setUseYearBuilt(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="useYearBuilt" className="ml-2 text-sm font-medium text-gray-700">
                  Filter by Year Built (Delta from subject property)
                </label>
              </div>

              {useYearBuilt && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minYearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Year Built (Delta)
                    </label>
                    <input
                      type="number"
                      id="minYearBuilt"
                      value={minYearBuilt}
                      onChange={(e) => setMinYearBuilt(e.target.value)}
                      placeholder="e.g., -10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Negative values allow older properties</p>
                  </div>
                  <div>
                    <label htmlFor="maxYearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Year Built (Delta)
                    </label>
                    <input
                      type="number"
                      id="maxYearBuilt"
                      value={maxYearBuilt}
                      onChange={(e) => setMaxYearBuilt(e.target.value)}
                      placeholder="e.g., 5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Positive values allow newer properties</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lot Size Options */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="useLotSize"
                  checked={useLotSize}
                  onChange={(e) => setUseLotSize(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="useLotSize" className="ml-2 text-sm font-medium text-gray-700">
                  Filter by Lot Size (Percent delta from subject property)
                </label>
              </div>

              {useLotSize && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minLotSizePercent" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Lot Size Percent (%)
                    </label>
                    <input
                      type="number"
                      id="minLotSizePercent"
                      value={minLotSizePercent}
                      onChange={(e) => setMinLotSizePercent(e.target.value)}
                      placeholder="e.g., -30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Negative % allows smaller lots (e.g., -30 = 30% smaller)</p>
                  </div>
                  <div>
                    <label htmlFor="maxLotSizePercent" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Lot Size Percent (%)
                    </label>
                    <input
                      type="number"
                      id="maxLotSizePercent"
                      value={maxLotSizePercent}
                      onChange={(e) => setMaxLotSizePercent(e.target.value)}
                      placeholder="e.g., 30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Positive % allows larger lots (e.g., 30 = 30% larger)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Aggregate Metrics Option */}
            <div className="border-t pt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="aggComparablesMetrics"
                  checked={aggComparablesMetrics}
                  onChange={(e) => setAggComparablesMetrics(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="aggComparablesMetrics" className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Include Aggregate Metrics (Average Price, Price per Sqft, Estimated Value)
                </label>
              </div>
            </div>

            {/* Options Summary */}
            {(useDistance || useBedrooms || useBathrooms || useStories || useArea || useYearBuilt || useLotSize) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 font-medium mb-2">Active Filters:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  {useDistance && distanceValue && (
                    <li>• Distance: Within {distanceValue} {distanceUnit}</li>
                  )}
                  {useBedrooms && (
                    <li>
                      • Bedrooms: {minBedrooms !== '' ? `${minBedrooms >= 0 ? '+' : ''}${minBedrooms}` : 'any'} to {maxBedrooms !== '' ? `${maxBedrooms >= 0 ? '+' : ''}${maxBedrooms}` : 'any'} delta
                    </li>
                  )}
                  {useBathrooms && (
                    <li>
                      • Bathrooms: {minBathrooms !== '' ? `${minBathrooms >= 0 ? '+' : ''}${minBathrooms}` : 'any'} to {maxBathrooms !== '' ? `${maxBathrooms >= 0 ? '+' : ''}${maxBathrooms}` : 'any'} delta
                    </li>
                  )}
                  {useStories && (
                    <li>
                      • Stories: {minStories !== '' ? `${minStories >= 0 ? '+' : ''}${minStories}` : 'any'} to {maxStories !== '' ? `${maxStories >= 0 ? '+' : ''}${maxStories}` : 'any'} delta
                    </li>
                  )}
                  {useArea && (
                    <li>
                      • Living Area: {minAreaPercent !== '' ? `${minAreaPercent}%` : 'any'} to {maxAreaPercent !== '' ? `${maxAreaPercent}%` : 'any'}
                    </li>
                  )}
                  {useYearBuilt && (
                    <li>
                      • Year Built: {minYearBuilt !== '' ? `${minYearBuilt >= 0 ? '+' : ''}${minYearBuilt}` : 'any'} to {maxYearBuilt !== '' ? `${maxYearBuilt >= 0 ? '+' : ''}${maxYearBuilt}` : 'any'} years delta
                    </li>
                  )}
                  {useLotSize && (
                    <li>
                      • Lot Size: {minLotSizePercent !== '' ? `${minLotSizePercent}%` : 'any'} to {maxLotSizePercent !== '' ? `${maxLotSizePercent}%` : 'any'}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Aggregate Metrics Display */}
      {aggMetrics && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 mb-6 border border-green-200">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-800">Aggregate Comparables Metrics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aggMetrics.averagePrice !== undefined && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Average Price</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(aggMetrics.averagePrice)}</p>
              </div>
            )}
            {aggMetrics.averagePricePerSqft !== undefined && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Average Price per Sqft</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(aggMetrics.averagePricePerSqft)}</p>
              </div>
            )}
            {aggMetrics.estimatedValue !== undefined && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Estimated Value</p>
                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(aggMetrics.estimatedValue)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {properties.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Comparable Properties
            </h3>
            <span className="text-sm text-gray-600">
              {totalCount.toLocaleString()} comparable properties found
            </span>
          </div>

          {/* Property List */}
          <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property, index) => (
                  <tr
                    key={index}
                    onClick={() => setSelectedProperty(property)}
                    className="hover:bg-indigo-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        {formatFullAddress(property)}
                        <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * PROPERTIES_PER_PAGE) + 1} to {Math.min(currentPage * PROPERTIES_PER_PAGE, totalCount)} of {totalCount.toLocaleString()} properties
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {!loading && properties.length === 0 && totalCount === 0 && requestPayload && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Comparables Found</h3>
          <p className="text-gray-600">
            No comparable properties were found for this address. Try adjusting your filters or use a different property.
          </p>
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {/* JSON Viewer Toggle */}
      {(requestPayload || apiResponse) && (
        <div className="mb-6 mt-6">
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
          className="text-indigo-600 hover:text-indigo-800 underline text-sm inline-flex items-center"
        >
          View API Documentation
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default PropertyComparablesPage;
