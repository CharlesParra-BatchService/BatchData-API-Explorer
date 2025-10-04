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
- **Filter by quicklists** - Apply property criteria filters:
  - **AND filters** - Properties must match ALL selected criteria
  - **OR filters** - Properties match ANY of the selected criteria
  - Support for 35+ property types including:
    - Owner-occupied properties
    - Vacant properties
    - Active MLS listings
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
- Search for properties by city and state
- Click on any property to view detailed information in a modal
- Navigate through large datasets with Previous/Next pagination controls
- View comprehensive property details including:
  - Address, general info, building, and lot details
  - Valuation, assessment, and tax information
  - Owner and sale information
  - Legal details and property IDs
  - MLS/Listing data (if available)
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

### General Features
- Responsive design with Tailwind CSS
- Clean, user-friendly interface
- Mobile-friendly navigation with hamburger menu

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
│   │   ├── PropertySearchPage.jsx    # Property Count Search feature
│   │   ├── PropertyListPage.jsx      # Property List feature
│   │   ├── PropertyLookupPage.jsx    # Property Lookup feature
│   │   └── SkipTracePage.jsx         # Skip Trace feature
│   ├── main.jsx                       # App entry point
│   └── ApiExplorer.jsx                # Main app with navigation & API key prompt
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
