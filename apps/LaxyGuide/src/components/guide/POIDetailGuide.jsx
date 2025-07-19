import React, { useEffect } from 'react';
import { POIDetail } from '@laxy/components';
import { Box, Button } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getPOIDetails } from '../../utils/poiGuideService.js';
import { getHubConfigByLanguage } from '../../mocks/guide-application-config/index.js';
import { CONTAINER_CONFIG } from '../../config/layout.js';
import { useAudioGuide } from '../../context/AudioGuideContext.jsx';
import { trackNavigation, trackContentInteraction, trackPOIView, trackButtonClick } from '../../utils/analytics.js';

// Function to load POI data for LaxyGuide
const loadPOIData = async (poiSlug, language) => {
  console.log(`Loading POI details for slug: "${poiSlug}" in language: "${language}"`);
  const poiItem = await getPOIDetails(poiSlug, language);
  console.log('Found POI item:', poiItem);
  
  // Return the nested poi object for compatibility with POIDetail component,
  // but add the legacyTourCode to it
  if (poiItem?.poi) {
    return {
      ...poiItem.poi,
      legacyTourCode: poiItem.legacyTourCode
    };
  }
  
  return poiItem;
};

const POIDetailGuide = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { loadAudioGuide, isLoading } = useAudioGuide();
  const { poiSlug } = useParams();

  useEffect(() => {
    // Track POI view on component mount
    if (poiSlug) {
      trackPOIView(poiSlug, 'poi', language);
    }
  }, [poiSlug, language]);

  const handleAudioGuideClick = async (poi) => {
    if (!poi.legacyTourCode) {
      console.warn('No legacy tour code found for POI:', poi);
      return;
    }

    try {
      // Track button click event
      trackButtonClick('Start Audio Guide', `poi-${poi.legacyTourCode}`);
      
      // Load the audio guide data with UI language
      await loadAudioGuide(poi.legacyTourCode, language);
      
      // Navigate to the full audio guide page
      navigate(`/${language}/audio-guide/${poi.legacyTourCode}`);
      
      // Track navigation event
      trackNavigation('POI Detail', 'Audio Guide', 'button');
    } catch (error) {
      console.error('Failed to load audio guide:', error);
      // TODO: Show error message to user
    }
  };

  // Analytics tracking functions
  const handleTrackNavigation = (from, to, method = 'click') => {
    trackNavigation(from, to, method);
  };

  const handleTrackContentInteraction = (action, contentType, contentId) => {
    trackContentInteraction(action, contentType, contentId);
  };

  // Custom render function for additional sections in POI detail
  const renderAudioGuideSection = (poi) => {
    if (!poi.legacyTourCode) return null;

    return (
      <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayCircleOutlineIcon />}
          onClick={() => handleAudioGuideClick(poi)}
          disabled={isLoading}
          fullWidth
          sx={{
            py: 1.5,
            fontWeight: 600,
            fontSize: '1rem',
            textTransform: 'none'
          }}
        >
          {isLoading ? 'Loading Audio Guide...' : 'Start Audio Guide'}
        </Button>
      </Box>
    );
  };

  return (
    <POIDetail
      useLanguage={useLanguage}
      loadPOIData={loadPOIData}
      getConfig={getHubConfigByLanguage}
      pageLayouts={{ POIDetail: CONTAINER_CONFIG.wide }}
      trackNavigation={handleTrackNavigation}
      trackContentInteraction={handleTrackContentInteraction}
      renderCustomSections={renderAudioGuideSection}
    />
  );
};

export default POIDetailGuide;
