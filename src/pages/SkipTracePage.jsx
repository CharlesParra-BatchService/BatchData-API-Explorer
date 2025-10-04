import React, { useState } from 'react';
import { Search, Phone, Mail, Loader2, AlertCircle, Code, Copy, Check, User } from 'lucide-react';

const SkipTracePage = ({ apiToken }) => {
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
  const [skipTraceData, setSkipTraceData] = useState(null);
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [requestPayload, setRequestPayload] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const API_URL = 'https://api.batchdata.com/api/v1/property/skip-trace';

  const statesList = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleSkipTrace = async (e) => {
    e.preventDefault();

    // Validation
    if (lookupType === 'address') {
      if (!street.trim() || !state.trim()) {
        setError('Please provide at least street and state');
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
    setSkipTraceData(null);

    const requestBody = {
      requests: [
        lookupType === 'address'
          ? {
              propertyAddress: {
                street: street.trim(),
                ...(city.trim() && { city: city.trim() }),
                state: state.trim(),
                ...(zip.trim() && { zip: zip.trim() })
              }
            }
          : {
              apn: apn.trim(),
              county: county.trim(),
              state: apnState.trim()
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

      // Extract skip trace from response - persons array is inside results
      if (data.results?.persons && data.results.persons.length > 0) {
        const person = data.results.persons[0];

        // Transform the API response to match our display format
        setSkipTraceData({
          match: true,
          owner: person.name,
          phones: person.phoneNumbers || [],
          emails: person.emails || [],
          propertyAddress: person.propertyAddress,
          mailingAddress: person.mailingAddress,
          bankruptcy: person.bankruptcy,
          death: person.death,
          dnc: person.dnc,
          litigator: person.litigator,
          property: person.property,
          meta: data.results.meta
        });
      } else if (data.results?.meta) {
        // No persons found but API call was successful
        setSkipTraceData({
          match: false,
          meta: data.results.meta
        });
      } else {
        throw new Error('No skip trace results found');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Skip trace error:', err);
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
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
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
            Skip Trace by Address
          </button>
          <button
            onClick={() => setLookupType('apn')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              lookupType === 'apn'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Skip Trace by APN
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

        <form onSubmit={handleSkipTrace}>
          {lookupType === 'address' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
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
                  City (optional)
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
                  State *
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
                  ZIP Code (optional)
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
                  APN (Assessor's Parcel Number) *
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
                  State *
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
                  County *
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
                Skip Tracing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Skip Trace Property
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

      {/* Skip Trace Results */}
      {skipTraceData && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-6">
            <User className="w-8 h-8 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800">Skip Trace Results</h2>
          </div>

          {/* Match Status */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">Match Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                skipTraceData.match ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {skipTraceData.match ? 'Matched' : 'No Match'}
              </span>
            </div>
          </div>

          {skipTraceData.match && (
            <>
              {/* Person Name */}
              {skipTraceData.owner && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Person Identified</h3>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <p className="text-xl font-semibold text-indigo-900">
                      {skipTraceData.owner.full || `${skipTraceData.owner.first || ''} ${skipTraceData.owner.last || ''}`.trim() || 'N/A'}
                    </p>
                    {skipTraceData.owner.first && skipTraceData.owner.last && (
                      <div className="mt-2 text-sm text-indigo-700">
                        <span>First: {skipTraceData.owner.first}</span>
                        <span className="mx-2">|</span>
                        <span>Last: {skipTraceData.owner.last}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TCPA Litigator Status */}
              {skipTraceData.litigator !== null && skipTraceData.litigator !== undefined && (
                <div className={`mb-6 p-4 rounded-lg border-2 ${
                  skipTraceData.litigator
                    ? 'bg-red-100 border-red-300'
                    : 'bg-green-100 border-green-300'
                }`}>
                  <p className={`font-semibold ${skipTraceData.litigator ? 'text-red-900' : 'text-green-900'}`}>
                    {skipTraceData.litigator ? '⚠️ WARNING: Known TCPA Litigator' : '✓ Not a Known TCPA Litigator'}
                  </p>
                  {skipTraceData.litigator && (
                    <p className="text-red-700 text-sm mt-1">Phone numbers are not included for known TCPA litigators.</p>
                  )}
                </div>
              )}

              {/* DNC Status */}
              {skipTraceData.dnc && skipTraceData.dnc.tcpa !== null && skipTraceData.dnc.tcpa !== undefined && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Do Not Call (DNC) Status</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">TCPA DNC Registry:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        skipTraceData.dnc.tcpa ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {skipTraceData.dnc.tcpa ? 'On DNC List' : 'Not on DNC List'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Phone Numbers */}
              {skipTraceData.phones && skipTraceData.phones.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Phone Numbers ({skipTraceData.phones.length})
                  </h3>
                  <div className="space-y-3">
                    {skipTraceData.phones.map((phone, index) => (
                      <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-lg font-semibold text-green-900">{phone.number || 'N/A'}</p>
                          {phone.dnc !== undefined && (
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              phone.dnc ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {phone.dnc ? 'DNC' : 'OK to Call'}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-700">
                          {phone.type !== null && phone.type !== undefined && (
                            <div><span className="font-medium">Type:</span> {phone.type}</div>
                          )}
                          {phone.carrier !== null && phone.carrier !== undefined && (
                            <div className="col-span-2"><span className="font-medium">Carrier:</span> {phone.carrier}</div>
                          )}
                          {phone.score !== null && phone.score !== undefined && (
                            <div><span className="font-medium">Score:</span> {phone.score}</div>
                          )}
                          {phone.tested !== null && phone.tested !== undefined && (
                            <div><span className="font-medium">Tested:</span> {phone.tested ? 'Yes' : 'No'}</div>
                          )}
                          {phone.reachable !== null && phone.reachable !== undefined && (
                            <div><span className="font-medium">Reachable:</span> {phone.reachable ? 'Yes' : 'No'}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Addresses */}
              {skipTraceData.emails && skipTraceData.emails.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Email Addresses ({skipTraceData.emails.length})
                  </h3>
                  <div className="space-y-2">
                    {skipTraceData.emails.map((email, index) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-lg font-semibold text-blue-900 break-all">{email.address || 'N/A'}</p>
                        {email.type !== null && email.type !== undefined && (
                          <p className="text-sm text-blue-700">Type: {email.type}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mailing Address */}
              {skipTraceData.mailingAddress && Object.keys(skipTraceData.mailingAddress).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Mailing Address</h3>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-gray-800 font-medium">
                      {[
                        skipTraceData.mailingAddress.street,
                        skipTraceData.mailingAddress.city,
                        skipTraceData.mailingAddress.state,
                        skipTraceData.mailingAddress.zip
                      ].filter(Boolean).join(', ') || 'N/A'}
                    </p>
                    {skipTraceData.mailingAddress.county !== null && skipTraceData.mailingAddress.county !== undefined && (
                      <p className="text-sm text-gray-600 mt-1">County: {skipTraceData.mailingAddress.county}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Property Address */}
              {skipTraceData.propertyAddress && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Property Address</h3>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <p className="text-gray-800 font-medium">
                      {[
                        skipTraceData.propertyAddress.street,
                        skipTraceData.propertyAddress.city,
                        skipTraceData.propertyAddress.state,
                        skipTraceData.propertyAddress.zip
                      ].filter(Boolean).join(', ')}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 text-sm text-gray-600">
                      {skipTraceData.propertyAddress.county !== null && skipTraceData.propertyAddress.county !== undefined && (
                        <div><span className="font-medium">County:</span> {skipTraceData.propertyAddress.county}</div>
                      )}
                      {skipTraceData.propertyAddress.zipPlus4 !== null && skipTraceData.propertyAddress.zipPlus4 !== undefined && (
                        <div><span className="font-medium">ZIP+4:</span> {skipTraceData.propertyAddress.zipPlus4}</div>
                      )}
                      {skipTraceData.propertyAddress.addressValidity !== null && skipTraceData.propertyAddress.addressValidity !== undefined && (
                        <div><span className="font-medium">Validity:</span> {skipTraceData.propertyAddress.addressValidity}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Property Owner (from property object) */}
              {skipTraceData.property?.owner && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Property Owner</h3>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    {skipTraceData.property.owner.name && (
                      <p className="text-lg font-semibold text-yellow-900 mb-2">
                        {skipTraceData.property.owner.name.full ||
                         `${skipTraceData.property.owner.name.first || ''} ${skipTraceData.property.owner.name.last || ''}`.trim() || 'N/A'}
                      </p>
                    )}
                    {skipTraceData.property.owner.mailingAddress && Object.keys(skipTraceData.property.owner.mailingAddress).length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-yellow-700 font-medium mb-1">Owner's Mailing Address:</p>
                        <p className="text-sm text-gray-700">
                          {[
                            skipTraceData.property.owner.mailingAddress.street,
                            skipTraceData.property.owner.mailingAddress.city,
                            skipTraceData.property.owner.mailingAddress.state,
                            skipTraceData.property.owner.mailingAddress.zip
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bankruptcy Status */}
              {skipTraceData.bankruptcy && Object.keys(skipTraceData.bankruptcy).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Bankruptcy Information</h3>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(skipTraceData.bankruptcy, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Death Record */}
              {skipTraceData.death && Object.keys(skipTraceData.death).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Death Record</h3>
                  <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(skipTraceData.death, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}

          {!skipTraceData.match && (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">No contact information was found for this property.</p>
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
          href="https://developer.batchdata.com/docs/batchdata/batchdata-v1/operations/create-a-property-skip-trace"
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

export default SkipTracePage;
