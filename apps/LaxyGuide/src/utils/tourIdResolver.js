/**
 * Tour ID Resolver Service
 * Handles dynamic tour ID extraction from legacy tour codes
 */

/**
 * Extract tour ID from legacy tour code
 * @param {string} legacyTourCode - Legacy tour code like "JPN-OITA-TUR-001-0001"
 * @returns {string|null} Tour ID like "JPN-OITA-TUR-001"
 */
export const extractTourIdFromLegacyCode = (legacyTourCode) => {
  if (!legacyTourCode) return null;
  
  // Split the legacy code and take the first 3 parts for tour ID
  const parts = legacyTourCode.split('-');
  if (parts.length >= 3) {
    return parts.slice(0, 3).join('-');
  }
  
  return null;
};

/**
 * Build S3 base URL for tour assets
 * @param {string} tourId - Tour ID
 * @param {string} environment - Environment (dev, staging, prod)
 * @returns {string} S3 base URL
 */
export const buildS3BaseUrl = (tourId, environment = 'dev') => {
  const envPath = environment === 'prod' ? 'laxy.travel' : `laxy.travel.${environment}`;
  return `https://s3.ap-northeast-1.amazonaws.com/${envPath}/tours/${tourId}/`;
};

/**
 * Get tour configuration from POI guide data
 * @param {Object} poiGuideItem - POI guide item from LaxyGuide data
 * @returns {Object} Tour configuration
 */
export const getTourConfigFromPOI = (poiGuideItem) => {
  if (!poiGuideItem?.legacyTourCode) {
    return null;
  }
  
  const tourId = extractTourIdFromLegacyCode(poiGuideItem.legacyTourCode);
  if (!tourId) {
    return null;
  }
  
  return {
    tourId,
    s3BaseUrl: buildS3BaseUrl(tourId),
    poi: poiGuideItem.poi
  };
};

/**
 * Check if POI has audio guide support
 * @param {Object} poiGuideItem - POI guide item
 * @returns {boolean} Whether POI supports audio guide
 */
export const hasAudioGuideSupport = (poiGuideItem) => {
  return !!(poiGuideItem?.legacyTourCode);
};
