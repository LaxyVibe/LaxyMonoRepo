# Shared POI Detail Components Migration

## Overview
This document outlines the migration of POIDetail components from individual apps to a shared component in the LaxyComponents package.

## What Was Done

### 1. Created Shared Components
- Created `packages/LaxyComponents/src/components/POIDetail/POIDetail.jsx` - Main shared POI detail component
- Created `packages/LaxyComponents/src/components/POIDetail/POIHeader.jsx` - Shared POI header component
- Created `packages/LaxyComponents/src/components/POIDetail/index.js` - Export file for the components

### 2. Made Components Configurable
The shared `POIDetail` component accepts props to make it work with both applications:

- `useLanguage` - Hook for language context
- `loadPOIData` - Function to load POI data (app-specific)
- `loadNativeLanguagePOI` - Function to load native language POI data (optional, LaxyHub only)
- `loadPOIRecommendations` - Function to load POI recommendations (optional, LaxyHub only)
- `getSuiteData` - Function to get suite data (optional, LaxyHub only)
- `getConfig` - Function to get configuration data
- `pageLayouts` - Layout configuration
- `contentPadding` - Content padding configuration (optional)
- `trackNavigation` - Analytics tracking function (optional)
- `trackContentInteraction` - Analytics tracking function (optional)
- `onAddressClick` - Custom handler for address click (optional)
- `routeParams` - Additional route parameters (optional)

### 3. Created App-Specific Wrappers
- Created `apps/LaxyHub/src/components/hub/POIDetailHub.js` - LaxyHub wrapper that provides LaxyHub-specific data loading functions
- Created `apps/LaxyGuide/src/components/guide/POIDetailGuide.jsx` - LaxyGuide wrapper that provides LaxyGuide-specific data loading functions

### 4. Updated Dependencies
- Added `@laxy/components` dependency to both apps' package.json files
- Updated LaxyComponents package.json with proper dependencies (react-router-dom, @mui/icons-material)

### 5. Updated App Routes
- Updated `apps/LaxyHub/src/App.jsx` to use `POIDetailHub` instead of `POIDetail`
- Updated `apps/LaxyGuide/src/App.jsx` to use `POIDetailGuide` instead of `POIDetail`

### 6. Package Configuration
- Updated `packages/LaxyComponents/package.json` with correct package name `@laxy/components`
- Added necessary dependencies and peer dependencies
- Updated main components index file to export POIDetail components

## Key Benefits

### 1. Code Reuse
- Single source of truth for POI detail UI logic
- Eliminates code duplication between apps
- Easier to maintain and update

### 2. Consistent UI
- Both apps now use the same POI detail component
- Ensures consistent user experience
- Shared styling and behavior

### 3. Maintainability
- Bug fixes and feature updates only need to be made in one place
- Easier to add new POI detail features across both apps
- Better code organization

### 4. Flexibility
- Apps can still provide their own data loading logic
- Each app maintains its specific business logic
- Shared component remains highly configurable

## File Structure After Migration

```
packages/LaxyComponents/src/components/
├── POIDetail/
│   ├── index.js
│   ├── POIDetail.jsx      # Shared main component
│   └── POIHeader.jsx      # Shared header component
└── index.js               # Updated to export POI components

apps/LaxyHub/src/components/hub/
└── POIDetailHub.js        # LaxyHub-specific wrapper

apps/LaxyGuide/src/components/guide/
└── POIDetailGuide.jsx     # LaxyGuide-specific wrapper
```

## Backup Location
Original POI detail files have been backed up to:
```
backups/original-poi-details/
├── LaxyHub-POIDetail.js
├── LaxyHub-POIHeader.js
├── LaxyGuide-POIDetail.jsx
└── LaxyGuide-POIHeader.jsx
```

## Testing Status
- ✅ LaxyGuide app starts successfully with shared components
- ✅ LaxyHub app starts successfully with shared components
- ✅ No compilation errors
- ✅ Both apps maintain their specific functionality while sharing the UI components

## Next Steps
1. Test POI detail pages in both apps to ensure all functionality works correctly
2. Consider migrating other shared components following the same pattern
3. Add proper TypeScript support if needed
4. Add unit tests for the shared components
