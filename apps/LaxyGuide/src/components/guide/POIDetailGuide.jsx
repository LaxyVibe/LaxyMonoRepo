import React from 'react';
import { POIDetail } from '@laxy/components';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getPOIDetails } from '../../utils/poiGuideService.js';
import { getHubConfigByLanguage } from '../../mocks/guide-application-config/index.js';
import { CONTAINER_CONFIG } from '../../config/layout.js';

// Function to load POI data for LaxyGuide
const loadPOIData = async (poiSlug, language) => {
  console.log(`Loading POI details for slug: "${poiSlug}" in language: "${language}"`);
  const foundPOI = await getPOIDetails(poiSlug, language);
  console.log('Found POI:', foundPOI);
  return foundPOI;
};

const POIDetailGuide = () => {
  return (
    <POIDetail
      useLanguage={useLanguage}
      loadPOIData={loadPOIData}
      getConfig={getHubConfigByLanguage}
      pageLayouts={{ POIDetail: CONTAINER_CONFIG.wide }}
      trackNavigation={() => {}}
      trackContentInteraction={() => {}}
    />
  );
};

export default POIDetailGuide;
