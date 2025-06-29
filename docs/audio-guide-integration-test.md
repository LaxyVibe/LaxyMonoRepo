# Audio Guide Integration Test Guide

## Overview
This guide documents the successful integration of the LegacyTourGuide audio functionality into the LaxyGuide app, enabling dynamic audio guide playback with proper routing and state management.

## What Was Implemented

### 1. Core Infrastructure
- **Tour ID Resolver** (`/src/utils/tourIdResolver.js`): Extracts dynamic tour IDs from POI `legacyTourCode` field
- **Legacy Data Adapter** (`/src/utils/legacyDataAdapter.js`): Transforms legacy tour structure to new POI → Guide → Steps format
- **Audio Guide Service** (`/src/utils/audioGuideService.js`): Handles S3 data loading and caching with dynamic tour IDs
- **SRT Parser** (`/src/utils/srtParser.js`): Parses subtitle files for audio synchronization

### 2. State Management
- **AudioGuideContext** (`/src/context/AudioGuideContext.jsx`): React context for managing audio guide state across components
- Provides: `loadAudioGuide`, `play`, `pause`, `seekTo`, `close`, current step info, and playback state

### 3. UI Components
- **AudioGuidePlayer** (`/src/components/audioGuide/AudioGuidePlayer.jsx`): Full-featured audio player with subtitle and image sync
- **MiniAudioPlayer** (`/src/components/audioGuide/MiniAudioPlayer.jsx`): Persistent mini player for app-wide playback
- **AudioGuidePage** (`/src/components/audioGuide/AudioGuidePage.jsx`): Full-screen audio guide experience

### 4. Integration Points
- **POIDetailGuide** updated with audio guide button for POIs with `legacyTourCode`
- **App.jsx** wrapped with AudioGuideProvider and includes MiniAudioPlayer
- **Routing** added for `/audio-guide/:tourId` route

## Key Features Implemented

### ✅ Dynamic Tour ID Resolution
- Replaces hardcoded `TOUR_ID` with dynamic extraction from POI data
- Uses `legacyTourCode` field from POI guide data (e.g., "JPN-OITA-TUR-001-0001")

### ✅ Data Structure Transformation
- Transforms legacy `tour → poiList → pois` to new `poi → guide → steps` structure
- Maintains compatibility with existing S3 data structure

### ✅ Language Support
- Maps LaxyGuide language codes (`en`, `ja`) to legacy codes (`eng`, `jpn`)
- Supports fallback to English if specific language not available

### ✅ Audio Playback Features
- HTML5 audio with subtitle synchronization
- Image sync with audio timeline
- Play/pause, seek, and step navigation
- Persistent mini player across app navigation

### ✅ Offline Capability
- IndexedDB caching for audio files and metadata
- Service worker integration for asset caching
- Fallback handling for network issues

## Testing the Integration

### 1. Basic POI Audio Guide Access
1. Navigate to LaxyGuide app: `http://localhost:3000`
2. Go to a POI detail page with `legacyTourCode`: `/en/poi/Kaimonji-Onsen`
3. Look for "Start Audio Guide" button
4. Click button to load and navigate to audio guide

### 2. Audio Guide Playback
1. Verify audio guide page loads: `/en/audio-guide/JPN-OITA-TUR-001-0001`
2. Test play/pause functionality
3. Test step navigation (previous/next)
4. Verify subtitle synchronization
5. Test image changes with audio timeline

### 3. Mini Player Functionality
1. Start audio guide from POI detail
2. Navigate back to main app
3. Verify mini player appears at bottom
4. Test mini player controls (play/pause, seek, close)
5. Test navigation between pages with audio playing

### 4. Error Handling
1. Test with invalid tour ID
2. Test with missing audio files
3. Test offline functionality
4. Verify graceful fallbacks

## Data Flow

```
POI Detail Page → legacyTourCode → Audio Guide Service → S3 Legacy Data → 
Data Adapter → AudioGuideContext → Audio Guide Components
```

### Example Data Transformation
**Input (Legacy S3 structure):**
```json
{
  "tour": {
    "id": "JPN-OITA-TUR-001-0001",
    "poiList": [
      {
        "pois": [
          {
            "id": "001",
            "title": "Introduction",
            "audioUrl": "001.mp3",
            "subtitleUrl": "001.srt",
            "imageUrl": "001.jpg"
          }
        ]
      }
    ]
  }
}
```

**Output (New POI structure):**
```json
{
  "poi": {
    "id": "JPN-OITA-TUR-001-0001",
    "title": "Kaimonji Onsen Audio Guide",
    "guide": {
      "steps": [
        {
          "id": "001",
          "title": "Introduction",
          "audioUrl": "001.mp3",
          "subtitleUrl": "001.srt",
          "imageUrl": "001.jpg"
        }
      ]
    }
  }
}
```

## Technical Architecture

### State Management Flow
1. **POI Detail**: User clicks "Start Audio Guide" button
2. **Service Layer**: Loads legacy S3 data using dynamic tour ID
3. **Data Adapter**: Transforms structure and caches in IndexedDB
4. **Context**: Manages audio guide state and playback
5. **Components**: Render audio player and controls
6. **Navigation**: Routes to full audio guide page

### Audio Synchronization
- Uses HTML5 `timeupdate` events for subtitle sync
- Image changes based on audio timeline
- SRT parser provides precise timing data
- Mini player maintains state across navigation

## Next Steps for Enhancement

### Immediate Improvements
1. **Error UI**: Better error messages and retry mechanisms
2. **Loading States**: Improved loading indicators
3. **Accessibility**: Keyboard navigation and screen reader support
4. **Performance**: Lazy loading and audio preloading optimization

### Future Features
1. **Download for Offline**: Allow users to download audio guides
2. **Playback Speed**: Variable playback speed controls
3. **Bookmarks**: Save progress and favorite steps
4. **Social Features**: Share audio guide progress
5. **Analytics**: Track user engagement and completion rates

## Migration Success Criteria ✅

1. **Dynamic Tour ID**: ✅ Replaced hardcoded TOUR_ID with dynamic resolution
2. **Data Structure**: ✅ Transformed legacy structure to new POI format  
3. **Audio Playback**: ✅ Full audio guide functionality in LaxyGuide
4. **State Management**: ✅ Persistent playback across navigation
5. **Routing**: ✅ Proper URL structure for audio guides
6. **Error Handling**: ✅ Graceful fallbacks and error states
7. **Mobile Support**: ✅ Responsive design and mobile controls

The migration is complete and ready for production deployment!
