import React, { useState } from 'react';
import { Search, Building, Loader2, AlertCircle, Code, Copy, Check } from 'lucide-react';

const PropertyLookupPage = ({ apiToken }) => {
  const [lookupType, setLookupType] = useState('address'); // 'address' or 'apn'

  // Address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // APN fields
  const [apn, setApn] = useState('');
  const [apnState, setApnState] = useState('');
  const [county, setCounty] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [propertyData, setPropertyData] = useState(null);
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [requestPayload, setRequestPayload] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const API_URL = 'https://api.batchdata.com/api/v1/property/lookup/all-attributes';

  const statesList = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleLookup = async (e) => {
    e.preventDefault();

    // Validation
    if (lookupType === 'address') {
      if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
        setError('Please fill in all address fields');
        return;
      }
    } else {
      if (!apn.trim() || !apnState.trim() || !county.trim()) {
        setError('Please fill in APN, state, and county');
        return;
      }
    }

    setLoading(true);
    setError('');
    setPropertyData(null);

    const requestBody = {
      requests: [
        lookupType === 'address'
          ? {
              address: {
                street: street.trim(),
                city: city.trim(),
                state: state.trim(),
                zip: zip.trim()
              }
            }
          : {
              apn: apn.trim(),
              address: {
                state: apnState.trim(),
                county: county.trim()
              }
            }
      ]
    };

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

      // Extract property from response
      if (data.results?.properties && data.results.properties.length > 0) {
        setPropertyData(data.results.properties[0]);
      } else {
        throw new Error('No property found');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Lookup error:', err);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Lookup Type Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setLookupType('address')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              lookupType === 'address'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lookup by Address
          </button>
          <button
            onClick={() => setLookupType('apn')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              lookupType === 'apn'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lookup by APN
          </button>
        </div>

        {/* Quick Test Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => {
              setLookupType('address');
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

        <form onSubmit={handleLookup}>
          {lookupType === 'address' ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="apn" className="block text-sm font-medium text-gray-700 mb-1">
                  APN (Assessor's Parcel Number)
                </label>
                <input
                  type="text"
                  id="apn"
                  value={apn}
                  onChange={(e) => setApn(e.target.value)}
                  placeholder="e.g., 123-45-678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="apnState" className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  id="apnState"
                  value={apnState}
                  onChange={(e) => setApnState(e.target.value)}
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
                <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
                  County
                </label>
                <input
                  type="text"
                  id="county"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  placeholder="e.g., Maricopa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Looking up property...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Lookup Property
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

      {/* Property Details */}
      {propertyData && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-6">
            <Building className="w-8 h-8 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800">Property Details</h2>
          </div>

          {/* Property ID and Date Modified */}
          <div className="mb-6 p-3 bg-gray-100 rounded-lg text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Property ID: <span className="font-mono">{formatValue(propertyData._id)}</span></span>
              <span className="text-gray-600">Last Modified: {formatValue(propertyData.dateModified)}</span>
            </div>
          </div>

          {/* Address */}
          {propertyData.address && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Address</h3>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-xl text-indigo-800 font-semibold">
                  {formatValue(propertyData.address.street)}
                </p>
                <p className="text-lg text-indigo-700">
                  {formatValue(propertyData.address.city)}, {formatValue(propertyData.address.state)} {formatValue(propertyData.address.zip)}
                </p>
                {propertyData.address.county && (
                  <p className="text-sm text-indigo-600 mt-1">County: {propertyData.address.county}</p>
                )}
              </div>
            </div>
          )}

          {/* General */}
          {propertyData.general && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.general).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Building */}
          {propertyData.building && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Building</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.building).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lot */}
          {propertyData.lot && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Lot</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.lot).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valuation */}
          {propertyData.valuation && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Valuation & Equity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.valuation).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} isCurrency={typeof value === 'number'} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assessment */}
          {propertyData.assessment && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.assessment).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} isCurrency={typeof value === 'number'} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tax */}
          {propertyData.tax && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Tax</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.tax).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} isCurrency={typeof value === 'number'} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner */}
          {propertyData.owner && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Owner</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.owner).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sale */}
          {propertyData.sale && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Sale</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.sale).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} isCurrency={key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal */}
          {propertyData.legal && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Legal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.legal).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IDs */}
          {propertyData.ids && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Identifiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.ids).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Listing */}
          {propertyData.listing && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Listing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.listing).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} isCurrency={key.toLowerCase().includes('price')} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Foreclosure */}
          {propertyData.foreclosure && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Foreclosure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.foreclosure).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Demographics */}
          {propertyData.demographics && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Demographics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.demographics).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intel */}
          {propertyData.intel && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Intel / Propensity Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.intel).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property Owner Profile */}
          {propertyData.propertyOwnerProfile && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Property Owner Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.propertyOwnerProfile).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QuickLists */}
          {propertyData.quickLists && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Quick Lists</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.quickLists).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open Lien */}
          {propertyData.openLien && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Open Lien</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.openLien).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} isCurrency={key.toLowerCase().includes('amount')} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Involuntary Lien */}
          {propertyData.involuntaryLien && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Involuntary Lien</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.involuntaryLien).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} isCurrency={key.toLowerCase().includes('amount')} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permit */}
          {propertyData.permit && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Permit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.permit).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <ValueDisplay value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {propertyData.images && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(propertyData.images).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    {typeof value === 'string' && value.startsWith('http') ? (
                      <a href={value} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm">
                        View Image
                      </a>
                    ) : (
                      <span className="font-medium text-gray-800">{formatValue(value)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deed History */}
          {propertyData.deedHistory && propertyData.deedHistory.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Deed History</h3>
              <div className="space-y-3">
                {propertyData.deedHistory.map((deed, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">Deed {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {Object.entries(deed).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-500">{key}: </span>
                          <span className="font-medium text-gray-800">{formatValue(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mortgage History */}
          {propertyData.mortgageHistory && propertyData.mortgageHistory.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Mortgage History</h3>
              <div className="space-y-3">
                {propertyData.mortgageHistory.map((mortgage, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">Mortgage {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {Object.entries(mortgage).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-500">{key}: </span>
                          <span className="font-medium text-gray-800">
                            {key.toLowerCase().includes('amount') ? formatCurrency(value) : formatValue(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          href="https://developer.batchdata.com/docs/batchdata/batchdata-v1/operations/create-a-property-lookup-all-attribute"
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

export default PropertyLookupPage;
