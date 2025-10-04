import React, { useState } from 'react';
import { Search, Home, Menu, X, Building2, Users, Key, List } from 'lucide-react';
import PropertySearchPage from './pages/PropertySearchPage';
import PropertyLookupPage from './pages/PropertyLookupPage';
import SkipTracePage from './pages/SkipTracePage';
import PropertyListPage from './pages/PropertyListPage';

const ApiExplorer = () => {
  const [currentPage, setCurrentPage] = useState('property-search');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiToken, setApiToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');

  const navigation = [
    { id: 'property-search', name: 'Property Count Search', icon: Search },
    { id: 'property-list', name: 'Property List', icon: List },
    { id: 'property-lookup', name: 'Property Lookup', icon: Building2 },
    { id: 'skip-trace', name: 'Skip Trace', icon: Users }
  ];

  const handleSetToken = (e) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      setApiToken(tokenInput.trim());
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'property-search':
        return <PropertySearchPage apiToken={apiToken} />;
      case 'property-list':
        return <PropertyListPage apiToken={apiToken} />;
      case 'property-lookup':
        return <PropertyLookupPage apiToken={apiToken} />;
      case 'skip-trace':
        return <SkipTracePage apiToken={apiToken} />;
      default:
        return <PropertySearchPage apiToken={apiToken} />;
    }
  };

  // Show API key prompt if not set
  if (!apiToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <Key className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            BatchData API Explorer
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Enter your BatchData API access key to continue
          </p>
          <form onSubmit={handleSetToken}>
            <div className="mb-4">
              <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700 mb-2">
                API Access Key
              </label>
              <input
                type="password"
                id="apiToken"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-200 font-medium"
            >
              Continue
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Your API key is stored in session memory only and will not persist after page refresh.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Google-style Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Home className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-800">
                BatchData API Explorer
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === item.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-2 border-t border-gray-200">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors ${
                      currentPage === item.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        <p>Powered by BatchData API</p>
        <p className="mt-1">Real estate property data for the United States</p>
      </footer>
    </div>
  );
};

export default ApiExplorer;
