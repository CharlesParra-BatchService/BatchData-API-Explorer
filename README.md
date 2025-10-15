# BatchData API Explorer

A React application that demonstrates various BatchData API endpoints for real estate property data in the United States. The app features a Google-style navigation interface with multiple pages for different API features.

## Architecture

The application uses a **Google-style navigation** pattern with:
- Sticky header with navigation tabs
- Client-side routing (state-based page switching)
- Modular page structure for easy expansion
- Responsive design for mobile and desktop

## Current Features

### 1. Property Count Search
- Search for properties by city and state
- Display total property count for the location
- Applies skip=0 and take=0 request options to only return property counts
- **Filter by quicklists** - Apply property criteria filters:
  - **AND filters** - Properties must match ALL selected criteria
  - **OR filters** - Properties match ANY of the selected criteria
  - Support for 35+ property types including:
    - Owner-occupied properties
    - Vacant properties
    - Active listings
    - Out-of-state owners
    - Absentee owners
    - High equity properties
    - Preforeclosure properties
    - And many more categories
- **View quicklist counts** - See property breakdowns by all available categories
- **JSON Viewer** - View and copy request payload and API response
  - Toggle to show/hide JSON data
  - Syntax-highlighted JSON display
  - One-click copy to clipboard for both request and response
- Default search preset to Phoenix, AZ for quick testing
- View recent search history (last 5 searches)

### 2. Property List
- Browse paginated property results (50 properties per page)
- Applies skip and take request options to implement paginated results
- Search for properties by city and state
- Click on any property to view detailed information in a modal
- Navigate through large datasets withx Previous/Next pagination controls
- View comprehensive property details including:
  - Address, general info, building, and lot details
  - Valuation, assessment, and tax information
  - Owner and sale information
  - Legal details and property IDs
  - Listing data (if available)
  - Demographics information
- **JSON Viewer** - View and copy request payload and API response
  - Toggle to show/hide JSON data
  - One-click copy to clipboard

### 3. Property Lookup
- Lookup individual property details using either:
  - **Address** (street, city, state, ZIP)
  - **APN** (Assessor's Parcel Number with state and county)
- View comprehensive property information including:
  - Address details
  - General information (property type, year built, bedrooms, bathrooms)
  - Size information (living area, lot size, stories)
  - Valuation (market value, assessed value, tax amount)
  - Owner information
  - Last sale details
  - Property identifiers (APN, county)
- **JSON Viewer** - View and copy request payload and API response
  - Toggle to show/hide JSON data
  - One-click copy to clipboard

### 4. Skip Trace
- Find contact information for property owners using either:
  - **Address** (street, city, state, ZIP)
  - **APN** (Assessor's Parcel Number with state and county)
- View comprehensive contact details including:
  - **Phone numbers** with carrier info and DNC (Do Not Call) status
  - **Email addresses**
  - Owner name and type
  - Property address confirmation
- Match status indicator
- **JSON Viewer** - View and copy request payload and API response
  - Toggle to show/hide JSON data
  - One-click copy to clipboard

### 5. Property Comparables Search
- Find comparable properties based on a subject property address
- Enter subject property address (street, city, state, ZIP)
- Browse paginated results (50 properties per page)
- **Quick Filters** - Apply property criteria filters:
  - **AND filters** - Properties must match ALL selected criteria
  - **OR filters** - Properties match ANY of the selected criteria
  - Support for 35+ property types (vacant, high-equity, active-listing, etc.)
- **Property Classification Filters** - Filter by property type categories:
  - Property Type Category (Residential, Commercial, Land, etc.)
  - Defaults to "Residential" properties
- **OR Criteria** - Filter by listing status OR last sale date:
  - **Listing Status** - Active, Sold, or Pending (select multiple)
  - **Last Sale Date Range** - Filter by when property was last sold
  - Properties matching either criteria will be included
- **Comparable Search Options** - Refine comparable matches with delta-based filters:
  - **Distance** - Maximum distance from subject property (miles, yards, feet, kilometers, meters)
  - **Bedrooms** - Delta from subject property (e.g., -1 to +2 bedrooms)
  - **Bathrooms** - Delta from subject property (e.g., -0.5 to +1 bathrooms)
  - **Stories** - Delta from subject property (e.g., -1 to +1 stories)
  - **Living Area** - Percentage delta from subject property (e.g., -20% to +20%)
  - **Year Built** - Delta from subject property (e.g., -10 to +5 years)
  - **Lot Size** - Percentage delta from subject property (e.g., -30% to +30%)
- **Aggregate Metrics** - View summary statistics for comparable properties:
  - Average Price across all comparables
  - Average Price per Square Foot
  - Estimated Value for the subject property
- Click on any property to view detailed information in a modal
- Navigate through results with Previous/Next pagination controls
- **JSON Viewer** - View and copy request payload and API response
  - Toggle to show/hide JSON data
  - One-click copy to clipboard

### General Features
- Responsive design with Tailwind CSS
- Clean, user-friendly interface
- Mobile-friendly navigation with hamburger menu

## Data Formatting

The application applies intelligent formatting to property data fields based on their names and types:

### Number Formatting
All numeric values (except years and currency) are formatted with comma separators for readability:
- **Example**: `1234567` displays as `1,234,567`
- **Applies to**: Square footage, counts, scores, confidence values, etc.

### Currency Formatting
Fields containing monetary values are formatted as US currency:
- **Example**: `250000` displays as `$250,000`
- **Currency fields include**: Fields with names containing:
  - `value`, `price`, `amount`, `cost`, `fee`, `tax`, `assessment`, `equity`, `balance`, `payment`

### Non-Currency Numeric Fields
The following fields are formatted with commas but NOT as currency:
- **Area/Size fields**: Any field containing `squarefeet`, `area`, or `size`
  - Examples: `totalBuildingAreaSquareFeet`, `livingAreaSquareFeet`, `lotSizeSquareFeet`
  - Display: `1,234` (not `$1,234`)
- **Statistical fields**: Fields containing `score`, `confidence`, `deviation`, `percent`, `rate`, or `ratio`
  - Examples: `confidenceScore`, `standardDeviation`
  - Display: `1,234` (not `$1,234`)

### Year Fields
Fields representing years are displayed as plain numbers without formatting:
- **Example**: `2020` displays as `2020` (not `2,020`)
- **Year fields include**: Any field containing `year` in the name
  - Examples: `effectiveYearBuilt`, `marketValueYear`, `taxYear`

### Date Formatting
All property-related API requests use `dateFormat: "iso-date"` to return dates without time components:
- **Example**: `2024-05-13` instead of `2024-05-13T00:00:00.000Z`

### Image URLs
Image URL fields are completely excluded from display for privacy and cleanliness:
- **Hidden fields**: Any field with `url` in the name
- **Visible fields**: `imageCount` and other non-URL image metadata

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Navigate to the project directory:
```bash
cd BatchData-API-Explorer
```

2. Install dependencies:
```bash
npm install
```

## API Key Configuration

When you first run the application, you will be prompted to enter your BatchData API access key.

**Important**:
- The API key is stored in session memory only
- It will NOT persist after page refresh
- You will need to re-enter the key each time you reload the application
- The key is never saved to disk or localStorage for security

To get your API key, visit the [BatchData Developer Portal](https://developer.batchdata.com/).

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will open in your browser at `http://localhost:5173`

On first load, you will see an API key entry screen. Enter your BatchData API key to continue.

## Building for Production

To create a production build:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## Usage

### Navigation
- Use the navigation tabs in the header to switch between different API features
- On mobile, tap the menu icon to access navigation
- Currently available:
  - **Property Count Search**
  - **Property List**
  - **Property Lookup**
  - **Skip Trace**
  - **Property Comparables**

### Property Count Search
1. The app defaults to "Phoenix, AZ" for quick testing
2. Enter a different city name or select a different state if desired
3. **Optional: Apply quicklist filters**
   - Click buttons in the **"Must Match ALL (AND)"** section to require properties to match all selected criteria
   - Click buttons in the **"Match ANY (OR)"** section to find properties matching any of the selected criteria
   - Selected filters are highlighted (blue for AND, purple for OR)
   - Use "Clear All" to remove all filters
4. Click "Search Properties"
5. View the results:
   - **Total property count** for the location (with applied filters)
   - **Property categories breakdown** showing counts for various property types and characteristics
   - **Active filters summary** showing which criteria are currently applied
6. **Optional: View API details**
   - Click "View Request & Response JSON" to see the raw API data
   - Copy request payload or response to clipboard with one click
   - Useful for debugging and understanding the API structure
7. Click "View API Documentation" at the bottom to see full API docs

### Property List
1. The app defaults to "Phoenix, AZ" for quick testing
2. Enter a different city name or select a different state if desired
3. Click "Search Properties"
4. View the results:
   - **Property table** with addresses (50 properties per page)
   - **Pagination controls** showing current page and total count
   - Click any property row to open detailed modal view
5. **Navigate between pages**:
   - Use Previous/Next buttons to browse through results
   - Page indicator shows current page and total pages
6. **View property details**:
   - Click any property to open detailed modal
   - View all available property information organized by category
   - Close modal to return to the list
7. **Optional: View API details**
   - Click "View Request & Response JSON" to see the raw API data
   - Copy request payload or response to clipboard with one click
8. Click "View API Documentation" at the bottom to see full API docs

### Property Lookup
1. Choose lookup method:
   - **Lookup by Address** - Search using full address
   - **Lookup by APN** - Search using Assessor's Parcel Number
2. **Quick Test**: Click the green "Quick Test" button to auto-fill with a sample address (622 W Palmaire Ave, Phoenix, AZ)
3. Or fill in the required fields manually:
   - **Address**: Street, City, State, ZIP
   - **APN**: APN number, State, County
4. Click "Lookup Property"
5. View detailed property information displayed in organized sections
6. **Optional: View API details**
   - Click "View Request & Response JSON" to see the raw API data
   - Copy request payload or response to clipboard with one click
7. Click "View API Documentation" at the bottom to see full API docs

### Skip Trace
1. Choose skip trace method:
   - **Skip Trace by Address** - Find contact info using property address
   - **Skip Trace by APN** - Find contact info using Assessor's Parcel Number
2. **Quick Test**: Click the green "Quick Test" button to auto-fill with a sample address (622 W Palmaire Ave, Phoenix, AZ)
3. Or fill in the required fields manually:
   - **Address**: Street (required), State (required), City and ZIP (optional)
   - **APN**: APN number, State, County (all required)
4. Click "Skip Trace Property"
5. View contact information results:
   - Match status (matched or no match)
   - Person identified
   - TCPA litigator status
   - DNC (Do Not Call) status
   - Phone numbers with carrier, DNC status, score, and reachability
   - Email addresses
   - Mailing address
   - Property address and owner details
   - Bankruptcy and death records (if available)
6. **Optional: View API details**
   - Click "View Request & Response JSON" to see the raw API data
   - Copy request payload or response to clipboard with one click
7. Click "View API Documentation" at the bottom to see full API docs

### Property Comparables Search
1. **Quick Test**: Click the green "Quick Test" button to auto-fill with a sample subject address (622 W Palmaire Ave, Phoenix, AZ)
2. Or fill in the subject property address manually:
   - Street Address (required)
   - City (required)
   - State (required)
   - ZIP Code (required)
3. **Optional: Apply Quick Filters**
   - Expand the "Quick Filters" section
   - Click buttons in the **"Must Match ALL (AND)"** section to require properties to match all selected criteria
   - Click buttons in the **"Match ANY (OR)"** section to find properties matching any of the selected criteria
   - Selected filters are highlighted (blue for AND, purple for OR)
   - Use "Clear All" to remove all filters
4. **Optional: Configure Property Classification**
   - Expand the "Property Classification" section
   - Select property type categories to filter by (default: Residential)
5. **Optional: Enable OR Criteria (Listing Status & Last Sale Date)**
   - Check "OR Criteria - Listing Status & Last Sale Date" to enable
   - Select one or more listing statuses (Active, Sold, Pending)
   - Optionally set a last sale date range (from date and/or to date)
   - Properties matching either the listing status OR the sale date range will be included
6. **Optional: Configure Comparable Search Options**
   - Expand the "Comparable Search Options" section
   - Enable and configure any of the following filters:
     - **Distance**: Set maximum distance from subject property
     - **Bedrooms**: Set min/max bedroom delta (e.g., -1 to +2)
     - **Bathrooms**: Set min/max bathroom delta (e.g., -0.5 to +1)
     - **Stories**: Set min/max story delta (e.g., -1 to +1)
     - **Living Area**: Set min/max percentage delta (e.g., -20% to +20%)
     - **Year Built**: Set min/max year delta (e.g., -10 to +5 years)
     - **Lot Size**: Set min/max lot size percentage delta (e.g., -30% to +30%)
   - Check "Include Aggregate Metrics" to see summary statistics
7. Click "Find Comparables"
8. View the results:
   - **Aggregate Metrics** (if requested) showing average price, price per sqft, and estimated value
   - **Property table** with comparable addresses (50 properties per page)
   - **Pagination controls** showing current page and total count
   - Click any property row to open detailed modal view
9. **Navigate between pages**:
   - Use Previous/Next buttons to browse through results
   - Page indicator shows current page and total pages
10. **View property details**:
    - Click any property to open detailed modal
    - View all available property information organized by category
    - Close modal to return to the list
11. **Optional: View API details**
    - Click "View Request & Response JSON" to see the raw API data
    - Copy request payload or response to clipboard with one click
12. Click "View API Documentation" at the bottom to see full API docs

## Technology Stack

- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)
- BatchData API

## API Information

### Property Search API
- Endpoint: `https://api.batchdata.com/api/v1/property/search`
- The app uses `take: 0` to only retrieve counts (minimizes billing)
- `quicklistCounts: true` option is enabled to retrieve category breakdowns
- **Search criteria options**:
  - `searchCriteria.quickLists` - Array of quicklists that must ALL match (AND logic)
  - `searchCriteria.orQuickLists` - Array of quicklists where ANY can match (OR logic)
  - Supports negation with "not-" prefix (e.g., "not-owner-occupied")

### Property Lookup API
- Endpoint: `https://api.batchdata.com/api/v1/property/lookup/all-attributes`
- Retrieves detailed property information for a single property
- Supports lookup by:
  - **Address**: Requires street, city, state, zip
  - **APN**: Requires apn, state, county

### Skip Trace API
- Endpoint: `https://api.batchdata.com/api/v1/property/skip-trace`
- Returns contact information (emails & phone numbers) for property owners
- Supports skip trace by:
  - **Address**: Requires street and state (city and zip optional)
  - **APN**: Requires apn, county, and state
- Billing: Each matched result counts as a billable request

### Property Comparables API
- Endpoint: `https://api.batchdata.com/api/v1/property/search`
- Returns comparable properties based on a subject property address
- **Request structure**:
  - `searchCriteria.compAddress` - Subject property address (street, city, state, zip)
  - `searchCriteria.quickLists` - Array of quicklists that must ALL match (AND logic)
  - `searchCriteria.orQuickLists` - Array of quicklists where ANY can match (OR logic)
  - `searchCriteria.general` - Property classification filters (e.g., propertyTypeCategory)
  - `searchCriteria.or` - Array of OR criteria objects (separate objects for listing status and last sold date)
    - Example: `[{"listing":{"status":{"inList":["Active","Pending"]}}},{"intel":{"lastSoldDate":{"minDate":"2023-04-27","maxDate":"2024-04-27"}}}]`
  - `options.skip` and `options.take` - Pagination controls
  - `options.aggComparablesMetrics` - Boolean to include aggregate metrics
- **Comparable options** (all in `options` object):
  - `useDistance` with distance value in various units (distanceMiles, distanceYards, distanceFeet, distanceKilometers, distanceMeters)
  - `useBedrooms` with `minBedrooms` and `maxBedrooms` (delta values)
  - `useBathrooms` with `minBathrooms` and `maxBathrooms` (delta values)
  - `useStories` with `minStories` and `maxStories` (delta values)
  - `useArea` with `minAreaPercent` and `maxAreaPercent` (percentage delta)
  - `useYearBuilt` with `minYearBuilt` and `maxYearBuilt` (year delta)
  - `useLotSize` with `minLotSizePercent` and `maxLotSizePercent` (percentage delta)
- **Response structure**:
  - `results.properties` - Array of comparable property objects
  - `results.meta.results.resultsFound` - Total count of comparables
  - `results.meta.results.aggComparablesMetrics` - Aggregate statistics (averagePrice, averagePricePerSqft, estimatedValue)

## How Quicklist Filtering Works

### AND Filtering (quickLists)
When you select multiple criteria in the "Must Match ALL" section, properties must satisfy **all** selected criteria.

Example: Selecting "vacant" AND "high-equity" returns only properties that are both vacant and have high equity.

### OR Filtering (orQuickLists)
When you select multiple criteria in the "Match ANY" section, properties satisfy **any** of the selected criteria.

Example: Selecting "active-listing" OR "pending-listing" returns properties that have either an active or pending listing status.

### Combining AND + OR
You can use both types of filters together. Properties must match ALL the AND criteria AND at least one of the OR criteria.

Example:
- AND: "vacant", "high-equity"
- OR: "out-of-state-owner", "absentee-owner"

Returns: Vacant properties with high equity that are owned by either out-of-state or absentee owners.

## Project Structure

```
BatchData-API-Explorer/
├── src/
│   ├── pages/
│   │   ├── PropertySearchPage.jsx       # Property Count Search feature
│   │   ├── PropertyListPage.jsx         # Property List feature
│   │   ├── PropertyLookupPage.jsx       # Property Lookup feature
│   │   ├── SkipTracePage.jsx            # Skip Trace feature
│   │   └── PropertyComparablesPage.jsx  # Property Comparables feature
│   ├── components/
│   │   ├── AssessmentFilters.jsx
│   │   ├── BuildingFilters.jsx
│   │   ├── DemographicFilters.jsx
│   │   ├── ForeclosureFilters.jsx
│   │   ├── PropertyClassificationFilters.jsx
│   │   ├── IntelFilters.jsx
│   │   ├── InvoluntaryLienFilters.jsx
│   │   ├── LegalFilters.jsx
│   │   ├── ListingFilters.jsx
│   │   ├── LotFilters.jsx
│   │   ├── OpenLienFilters.jsx
│   │   ├── OwnerFilters.jsx
│   │   ├── PermitFilters.jsx
│   │   └── SaleFilters.jsx
│   ├── main.jsx                         # App entry point
│   └── ApiExplorer.jsx                  # Main app with navigation & API key prompt
├── index.html
├── package.json
└── README.md
```

## Adding New API Features

To add a new BatchData API endpoint demonstration:

1. Create a new page component in `src/pages/` (e.g., `NewFeaturePage.jsx`)
2. Make sure the page component accepts `apiToken` as a prop:
   ```javascript
   const NewFeaturePage = ({ apiToken }) => { ... }
   ```
3. Add navigation item to the `navigation` array in `ApiExplorer.jsx`:
   ```javascript
   { id: 'new-feature', name: 'New Feature', icon: YourIcon }
   ```
4. Add the page to the `renderPage()` switch statement with the apiToken prop:
   ```javascript
   case 'new-feature':
     return <NewFeaturePage apiToken={apiToken} />;
   ```
5. Use the apiToken in your API calls:
   ```javascript
   headers: {
     'Authorization': `Bearer ${apiToken}`
   }
   ```

## Security Notes

- The API key is **never stored in the source code**
- The key is stored only in React state (session memory)
- The key does **not persist** after page refresh
- The key is **never saved** to localStorage or any persistent storage
- Users must re-enter the key each time they reload the application
- The app uses client-side state-based routing (no external router library needed)
