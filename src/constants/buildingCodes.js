// Building filter dropdown options extracted from Code Mapping.html
// Note: Using label as the value since the API expects the description text, not the code

export const BASEMENT_TYPES = [
  { value: 'Basement (not specified)', label: 'Basement (not specified)' },
  { value: 'Daylight, Partial', label: 'Daylight, Partial' },
  { value: 'Daylight/Walkout', label: 'Daylight/Walkout' },
  { value: 'Full Basement', label: 'Full Basement' },
  { value: 'Improved Basement (Finished)', label: 'Improved Basement (Finished)' },
  { value: 'No Basement', label: 'No Basement' },
  { value: 'Partial Basement', label: 'Partial Basement' },
  { value: 'Unfinished Basement', label: 'Unfinished Basement' },
  { value: 'Daylight, Full', label: 'Daylight, Full' }
];

export const BUILDING_CONDITIONS = [
  { value: 'Excellent', label: 'Excellent' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Good', label: 'Good' },
  { value: 'Poor', label: 'Poor' },
  { value: 'Unsound', label: 'Unsound' },
  { value: 'Average', label: 'Average' }
];

export const BUILDING_QUALITY = [
  { value: 'S', label: 'S' },
  { value: 'AA', label: 'AA' },
  { value: 'A+', label: 'A+' },
  { value: 'A', label: 'A' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B', label: 'B' },
  { value: 'B-', label: 'B-' },
  { value: 'C+', label: 'C+' },
  { value: 'C', label: 'C' },
  { value: 'C-', label: 'C-' },
  { value: 'D+', label: 'D+' },
  { value: 'D', label: 'D' },
  { value: 'D-', label: 'D-' },
  { value: 'E+', label: 'E+' },
  { value: 'E', label: 'E' },
  { value: 'E-', label: 'E-' },
  { value: 'F+', label: 'F+' },
  { value: 'F', label: 'F' },
  { value: 'F-', label: 'F-' }
];

export const POOL_TYPES = [
  { value: 'Above-Ground Pool', label: 'Above-Ground Pool' },
  { value: 'Community Pool or Spa', label: 'Community Pool or Spa' },
  { value: 'Enclosed', label: 'Enclosed' },
  { value: 'Heated Pool', label: 'Heated Pool' },
  { value: 'Indoor Pool', label: 'Indoor Pool' },
  { value: 'Pool & Spa', label: 'Pool & Spa' },
  { value: 'Pool - Yes', label: 'Pool - Yes' },
  { value: 'Solar Heated', label: 'Solar Heated' },
  { value: 'Spa or Hot Tub (only)', label: 'Spa or Hot Tub (only)' },
  { value: 'Vinyl In-Ground Pool', label: 'Vinyl In-Ground Pool' }
];

export const GARAGE_TYPES = [
  { value: 'Attached Garage', label: 'Attached Garage' },
  { value: 'Built-in', label: 'Built-in' },
  { value: 'Carport', label: 'Carport' },
  { value: 'Covered', label: 'Covered' },
  { value: 'Detached Garage', label: 'Detached Garage' },
  { value: 'Finished', label: 'Finished' },
  { value: 'Finished Attached', label: 'Finished Attached' },
  { value: 'Finished Detached', label: 'Finished Detached' },
  { value: 'Garage', label: 'Garage' },
  { value: 'Heated', label: 'Heated' },
  { value: 'None', label: 'None' },
  { value: 'Parking Structure', label: 'Parking Structure' },
  { value: 'Pole', label: 'Pole' },
  { value: 'Tuckunder', label: 'Tuckunder' },
  { value: 'Underground/Basement', label: 'Underground/Basement' },
  { value: 'Unfinished Attached', label: 'Unfinished Attached' },
  { value: 'Unfinished Detached', label: 'Unfinished Detached' }
];

export const CONSTRUCTION_TYPES = [
  { value: 'Other', label: 'Other' },
  { value: 'Frame', label: 'Frame' },
  { value: 'Wood', label: 'Wood' },
  { value: 'Metal', label: 'Metal' },
  { value: 'Steel', label: 'Steel' },
  { value: 'Concrete', label: 'Concrete' },
  { value: 'Masonry', label: 'Masonry' },
  { value: 'Concrete Block', label: 'Concrete Block' },
  { value: 'Brick', label: 'Brick' },
  { value: 'Stone', label: 'Stone' },
  { value: 'Manufactured', label: 'Manufactured' },
  { value: 'Tilt-Up', label: 'Tilt-Up' }
];

export const ROOF_COVER = [
  { value: 'Aluminum', label: 'Aluminum' },
  { value: 'Wood', label: 'Wood' },
  { value: 'Wood Shake/ Shingles', label: 'Wood Shake/ Shingles' },
  { value: 'Asbestos', label: 'Asbestos' },
  { value: 'Asphalt', label: 'Asphalt' },
  { value: 'Built-Up', label: 'Built-Up' },
  { value: 'Composition Shingle', label: 'Composition Shingle' },
  { value: 'Concrete', label: 'Concrete' },
  { value: 'Fiberglass', label: 'Fiberglass' },
  { value: 'Metal', label: 'Metal' },
  { value: 'Roll Composition', label: 'Roll Composition' },
  { value: 'Shingle (Not Wood)', label: 'Shingle (Not Wood)' },
  { value: 'Slate', label: 'Slate' },
  { value: 'Steel', label: 'Steel' },
  { value: 'Tar & Gravel', label: 'Tar & Gravel' },
  { value: 'Tile', label: 'Tile' }
];

export const BUILDING_STYLE = [
  { value: 'A-Frame', label: 'A-Frame' },
  { value: 'Patio Home', label: 'Patio Home' },
  { value: 'Ranch/Rambler', label: 'Ranch/Rambler' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Split Foyer', label: 'Split Foyer' },
  { value: 'Split Level', label: 'Split Level' },
  { value: 'Tiny House', label: 'Tiny House' },
  { value: 'TownHouse', label: 'TownHouse' },
  { value: 'Traditional', label: 'Traditional' },
  { value: 'Tudor', label: 'Tudor' },
  { value: 'Victorian', label: 'Victorian' },
  { value: 'Bi-Level', label: 'Bi-Level' },
  { value: 'Bungalow', label: 'Bungalow' },
  { value: 'Cape Cod', label: 'Cape Cod' },
  { value: 'Cluster', label: 'Cluster' },
  { value: 'Colonial', label: 'Colonial' },
  { value: 'Condominium', label: 'Condominium' },
  { value: 'Contemporary', label: 'Contemporary' },
  { value: 'Cottage', label: 'Cottage' },
  { value: 'Custom', label: 'Custom' },
  { value: 'Dome', label: 'Dome' },
  { value: 'Duplex', label: 'Duplex' },
  { value: 'Georgian', label: 'Georgian' },
  { value: 'Log Cabin/Rustic', label: 'Log Cabin/Rustic' },
  { value: 'Mediterranean', label: 'Mediterranean' },
  { value: 'Mobile Home', label: 'Mobile Home' },
  { value: 'Mobile/Manufactured', label: 'Mobile/Manufactured' },
  { value: 'Modern', label: 'Modern' }
];
