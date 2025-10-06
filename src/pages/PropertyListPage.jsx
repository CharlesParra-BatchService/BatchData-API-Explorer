import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, X, ExternalLink, Code, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import AssessmentFilters from '../components/AssessmentFilters';
import BuildingFilters from '../components/BuildingFilters';
import DemographicFilters from '../components/DemographicFilters';
import ForeclosureFilters from '../components/ForeclosureFilters';
import PropertyClassificationFilters from '../components/PropertyClassificationFilters';
import IntelFilters from '../components/IntelFilters';
import InvoluntaryLienFilters from '../components/InvoluntaryLienFilters';
import LegalFilters from '../components/LegalFilters';
import ListingFilters from '../components/ListingFilters';
import LotFilters from '../components/LotFilters';
import OpenLienFilters from '../components/OpenLienFilters';
import OwnerFilters from '../components/OwnerFilters';
import PermitFilters from '../components/PermitFilters';
import SaleFilters from '../components/SaleFilters';

const PropertyListPage = ({ apiToken }) => {
  const [formData, setFormData] = useState({
    city: 'Phoenix',
    state: 'AZ'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
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
  const [intelFilters, setIntelFilters] = useState({});
  const [involuntaryLienFilters, setInvoluntaryLienFilters] = useState({});
  const [legalFilters, setLegalFilters] = useState({});
  const [listingFilters, setListingFilters] = useState({});
  const [lotFilters, setLotFilters] = useState({});
  const [openLienFilters, setOpenLienFilters] = useState({});
  const [ownerFilters, setOwnerFilters] = useState({});
  const [permitFilters, setPermitFilters] = useState({});
  const [saleFilters, setSaleFilters] = useState({});
  const [andQuicklists, setAndQuicklists] = useState([]);
  const [orQuicklists, setOrQuicklists] = useState([]);
  const [quickFiltersExpanded, setQuickFiltersExpanded] = useState(false);

  const PROPERTIES_PER_PAGE = 50;

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

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
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

  const copyToClipboard = async (text, setCopied) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSearch = async (page = 1) => {
    setLoading(true);
    setError('');
    setSelectedProperty(null);
    setJsonError('');

    try {
      const skip = (page - 1) * PROPERTIES_PER_PAGE;

      const requestBody = {
        searchCriteria: {
          query: `${formData.city}, ${formData.state}`
        },
        skip: skip,
        take: PROPERTIES_PER_PAGE
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
          if (values.inList !== undefined) {
            processedGeneralFilters[category].inList = values.inList;
          }
        });
        requestBody.searchCriteria.general = processedGeneralFilters;
      }

      // Merge building filters
      if (Object.keys(buildingFilters).length > 0) {
        const processedBuildingFilters = {};
        Object.entries(buildingFilters).forEach(([category, values]) => {
          processedBuildingFilters[category] = {};
          if (values.min !== undefined) {
            processedBuildingFilters[category].min = Number(values.min);
          }
          if (values.max !== undefined) {
            processedBuildingFilters[category].max = Number(values.max);
          }
          if (values.inList !== undefined) {
            processedBuildingFilters[category].inList = values.inList;
          }
        });
        requestBody.searchCriteria.building = processedBuildingFilters;
      }

      // Merge assessment filters
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

      // Merge demographic filters
      if (Object.keys(demographicFilters).length > 0) {
        const processedDemographicFilters = {};
        Object.entries(demographicFilters).forEach(([category, values]) => {
          processedDemographicFilters[category] = {};
          if (values.min !== undefined) {
            processedDemographicFilters[category].min = Number(values.min);
          }
          if (values.max !== undefined) {
            processedDemographicFilters[category].max = Number(values.max);
          }
          if (values.inList !== undefined) {
            processedDemographicFilters[category].inList = values.inList;
          }
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
          if (values.min !== undefined) {
            processedForeclosureFilters[category].min = Number(values.min);
          }
          if (values.max !== undefined) {
            processedForeclosureFilters[category].max = Number(values.max);
          }
          if (values.minDate !== undefined) {
            processedForeclosureFilters[category].minDate = values.minDate;
          }
          if (values.maxDate !== undefined) {
            processedForeclosureFilters[category].maxDate = values.maxDate;
          }
          if (values.inList !== undefined) {
            processedForeclosureFilters[category].inList = values.inList;
          }
        });
        requestBody.searchCriteria.foreclosure = processedForeclosureFilters;
      }

      // Merge intel filters
      if (Object.keys(intelFilters).length > 0) {
        const processedIntelFilters = {};
        Object.entries(intelFilters).forEach(([category, values]) => {
          processedIntelFilters[category] = {};
          if (values.min !== undefined) {
            processedIntelFilters[category].min = Number(values.min);
          }
          if (values.max !== undefined) {
            processedIntelFilters[category].max = Number(values.max);
          }
          if (values.minDate !== undefined) {
            processedIntelFilters[category].minDate = values.minDate;
          }
          if (values.maxDate !== undefined) {
            processedIntelFilters[category].maxDate = values.maxDate;
          }
        });
        requestBody.searchCriteria.intel = processedIntelFilters;
      }

      // Merge involuntary lien filters
      if (Object.keys(involuntaryLienFilters).length > 0) {
        const processedInvoluntaryLienFilters = {};
        Object.entries(involuntaryLienFilters).forEach(([category, values]) => {
          processedInvoluntaryLienFilters[category] = {};
          if (values.min !== undefined) {
            processedInvoluntaryLienFilters[category].min = Number(values.min);
          }
          if (values.max !== undefined) {
            processedInvoluntaryLienFilters[category].max = Number(values.max);
          }
          if (values.minDate !== undefined) {
            processedInvoluntaryLienFilters[category].minDate = values.minDate;
          }
          if (values.maxDate !== undefined) {
            processedInvoluntaryLienFilters[category].maxDate = values.maxDate;
          }
          if (values.inList !== undefined) {
            processedInvoluntaryLienFilters[category].inList = values.inList;
          }
        });
        requestBody.searchCriteria.involuntaryLien = processedInvoluntaryLienFilters;
      }

      // Merge legal filters
      if (Object.keys(legalFilters).length > 0) {
        const processedLegalFilters = {};
        Object.entries(legalFilters).forEach(([category, values]) => {
          processedLegalFilters[category] = {};
          if (values.equals !== undefined) {
            processedLegalFilters[category].equals = values.equals;
          }
          if (values.contains !== undefined) {
            processedLegalFilters[category].contains = values.contains;
          }
          if (values.startsWith !== undefined) {
            processedLegalFilters[category].startsWith = values.startsWith;
          }
          if (values.endsWith !== undefined) {
            processedLegalFilters[category].endsWith = values.endsWith;
          }
        });
        requestBody.searchCriteria.legal = processedLegalFilters;
      }

      // Merge listing filters
      if (Object.keys(listingFilters).length > 0) {
        const processedListingFilters = {};
        Object.entries(listingFilters).forEach(([category, values]) => {
          processedListingFilters[category] = {};
          if (values.min !== undefined) {
            processedListingFilters[category].min = Number(values.min);
          }
          if (values.max !== undefined) {
            processedListingFilters[category].max = Number(values.max);
          }
          if (values.minDate !== undefined) {
            processedListingFilters[category].minDate = values.minDate;
          }
          if (values.maxDate !== undefined) {
            processedListingFilters[category].maxDate = values.maxDate;
          }
          if (values.contains !== undefined) {
            processedListingFilters[category].contains = values.contains;
          }
          if (values.inList !== undefined) {
            processedListingFilters[category].inList = values.inList;
          }
        });
        requestBody.searchCriteria.listing = processedListingFilters;
      }

      // Merge lot filters
      if (Object.keys(lotFilters).length > 0) {
        const processedLotFilters = {};
        Object.entries(lotFilters).forEach(([category, values]) => {
          processedLotFilters[category] = {};
          if (values.min !== undefined) {
            processedLotFilters[category].min = Number(values.min);
          }
          if (values.max !== undefined) {
            processedLotFilters[category].max = Number(values.max);
          }
          if (values.equals !== undefined) {
            processedLotFilters[category].equals = values.equals;
          }
          if (values.contains !== undefined) {
            processedLotFilters[category].contains = values.contains;
          }
          if (values.startsWith !== undefined) {
            processedLotFilters[category].startsWith = values.startsWith;
          }
          if (values.endsWith !== undefined) {
            processedLotFilters[category].endsWith = values.endsWith;
          }
        });
        requestBody.searchCriteria.lot = processedLotFilters;
      }

      // Merge open lien filters
      if (Object.keys(openLienFilters).length > 0) {
        const processedOpenLienFilters = {};
        Object.entries(openLienFilters).forEach(([category, values]) => {
          processedOpenLienFilters[category] = {};
          if (values.min !== undefined) {
            processedOpenLienFilters[category].min = Number(values.min);
          }
          if (values.max !== undefined) {
            processedOpenLienFilters[category].max = Number(values.max);
          }
          if (values.minDate !== undefined) {
            processedOpenLienFilters[category].minDate = values.minDate;
          }
          if (values.maxDate !== undefined) {
            processedOpenLienFilters[category].maxDate = values.maxDate;
          }
          if (values.equals !== undefined) {
            processedOpenLienFilters[category].equals = values.equals;
          }
          if (values.contains !== undefined) {
            processedOpenLienFilters[category].contains = values.contains;
          }
          if (values.startsWith !== undefined) {
            processedOpenLienFilters[category].startsWith = values.startsWith;
          }
          if (values.endsWith !== undefined) {
            processedOpenLienFilters[category].endsWith = values.endsWith;
          }
        });
        requestBody.searchCriteria.openLien = processedOpenLienFilters;
      }

      // Merge owner filters
      if (Object.keys(ownerFilters).length > 0) {
        const processedOwnerFilters = {};
        Object.entries(ownerFilters).forEach(([category, values]) => {
          processedOwnerFilters[category] = {};
          if (values.min !== undefined) {
            processedOwnerFilters[category].min = Number(values.min);
          }
          if (values.max !== undefined) {
            processedOwnerFilters[category].max = Number(values.max);
          }
          if (values.minDate !== undefined) {
            processedOwnerFilters[category].minDate = values.minDate;
          }
          if (values.maxDate !== undefined) {
            processedOwnerFilters[category].maxDate = values.maxDate;
          }
          if (values.equals !== undefined && typeof values.equals === 'boolean') {
            processedOwnerFilters[category].equals = values.equals;
          }
          if (values.equals !== undefined && typeof values.equals === 'string') {
            processedOwnerFilters[category].equals = values.equals;
          }
          if (values.contains !== undefined) {
            processedOwnerFilters[category].contains = values.contains;
          }
          if (values.startsWith !== undefined) {
            processedOwnerFilters[category].startsWith = values.startsWith;
          }
          if (values.endsWith !== undefined) {
            processedOwnerFilters[category].endsWith = values.endsWith;
          }
        });
        requestBody.searchCriteria.owner = processedOwnerFilters;
      }

      // Merge permit filters
      if (Object.keys(permitFilters).length > 0) {
        const processedPermitFilters = {};
        Object.entries(permitFilters).forEach(([category, values]) => {
          processedPermitFilters[category] = {};
          if (values.min !== undefined) {
            processedPermitFilters[category].min = Number(values.min);
          }
          if (values.max !== undefined) {
            processedPermitFilters[category].max = Number(values.max);
          }
          if (values.minDate !== undefined) {
            processedPermitFilters[category].minDate = values.minDate;
          }
          if (values.maxDate !== undefined) {
            processedPermitFilters[category].maxDate = values.maxDate;
          }
          if (values.equals !== undefined) {
            processedPermitFilters[category].equals = values.equals;
          }
          if (values.contains !== undefined) {
            processedPermitFilters[category].contains = values.contains;
          }
          if (values.startsWith !== undefined) {
            processedPermitFilters[category].startsWith = values.startsWith;
          }
          if (values.endsWith !== undefined) {
            processedPermitFilters[category].endsWith = values.endsWith;
          }
        });
        requestBody.searchCriteria.permit = processedPermitFilters;
      }

      // Merge sale filters
      if (Object.keys(saleFilters).length > 0) {
        const processedSaleFilters = {};
        Object.entries(saleFilters).forEach(([category, values]) => {
          processedSaleFilters[category] = {};
          if (values.min !== undefined) {
            processedSaleFilters[category].min = Number(values.min);
          }
          if (values.max !== undefined) {
            processedSaleFilters[category].max = Number(values.max);
          }
          if (values.minDate !== undefined) {
            processedSaleFilters[category].minDate = values.minDate;
          }
          if (values.maxDate !== undefined) {
            processedSaleFilters[category].maxDate = values.maxDate;
          }
          if (values.equals !== undefined) {
            processedSaleFilters[category].equals = values.equals;
          }
          if (values.contains !== undefined) {
            processedSaleFilters[category].contains = values.contains;
          }
          if (values.startsWith !== undefined) {
            processedSaleFilters[category].startsWith = values.startsWith;
          }
          if (values.endsWith !== undefined) {
            processedSaleFilters[category].endsWith = values.endsWith;
          }
        });
        requestBody.searchCriteria.sale = processedSaleFilters;
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

      setRequestPayload(requestBody);

      const response = await fetch('https://api.batchdata.com/api/v1/property/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      setApiResponse(data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch properties');
      }

      setProperties(data.results?.properties || []);
      setTotalCount(data.results?.meta?.results?.resultsFound || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
      setProperties([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    handleSearch(newPage);
  };

  const totalPages = Math.ceil(totalCount / PROPERTIES_PER_PAGE);

  const formatFullAddress = (property) => {
    const street = property.address?.street;
    const city = property.address?.city;
    const state = property.address?.state;
    const zip = property.address?.zip;

    return `${street}, ${city}, ${state} ${zip}`;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Property List Explorer</h2>

        {/* Search Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => handleSearch(1)}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition duration-200 flex items-center justify-center"
              >
                <Search className="w-5 h-5 mr-2" />
                {loading ? 'Searching...' : 'Search Properties'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {jsonError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-2">
              {jsonError}
            </div>
          )}
        </div>
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

      {/* Intel Filters */}
      <IntelFilters
        filters={intelFilters}
        onChange={setIntelFilters}
      />

      {/* Involuntary Lien Filters */}
      <InvoluntaryLienFilters
        filters={involuntaryLienFilters}
        onChange={setInvoluntaryLienFilters}
      />

      {/* Legal Filters */}
      <LegalFilters
        filters={legalFilters}
        onChange={setLegalFilters}
      />

      {/* Listing Filters */}
      <ListingFilters
        filters={listingFilters}
        onChange={setListingFilters}
      />

      {/* Lot Filters */}
      <LotFilters
        filters={lotFilters}
        onChange={setLotFilters}
      />

      {/* Open Lien Filters */}
      <OpenLienFilters
        filters={openLienFilters}
        onChange={setOpenLienFilters}
      />

      {/* Owner Filters */}
      <OwnerFilters
        filters={ownerFilters}
        onChange={setOwnerFilters}
      />

      {/* Permit Filters */}
      <PermitFilters
        filters={permitFilters}
        onChange={setPermitFilters}
      />

      {/* Sale Filters */}
      <SaleFilters
        filters={saleFilters}
        onChange={setSaleFilters}
      />

      {/* Additional JSON Criteria */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Search Criteria (JSON)
        </label>
        <textarea
          value={additionalCriteria}
          onChange={(e) => setAdditionalCriteria(e.target.value)}
          placeholder='e.g., "building": {"yearBuilt": {"min": 2000}}'
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          rows="3"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter valid JSON object properties to add to searchCriteria (without outer curly braces)
        </p>
      </div>

      {/* Results */}
      {properties.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Property Results
            </h3>
            <span className="text-sm text-gray-600">
              {totalCount.toLocaleString()} total properties found
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

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
              <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* API Documentation Link */}
      <div className="mt-6 text-center">
        <a
          href="https://developer.batchdata.com/docs/batchdata/batchdata-v1/operations/create-a-property-search"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center"
        >
          View API Documentation
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default PropertyListPage;
