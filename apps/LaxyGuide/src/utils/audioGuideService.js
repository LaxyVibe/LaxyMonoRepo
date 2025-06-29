/**
 * Audio Guide Service
 * Manages audio guide data loading and caching
 */
import { getTourConfigFromPOI, buildS3BaseUrl } from './tourIdResolver.js';
import { adaptLegacyTourData, validateLegacyTourData } from './legacyDataAdapter.js';

/**
 * Load legacy tour data from S3
 * @param {string} tourId - Tour ID
 * @param {string} environment - Environment (dev, staging, prod)
 * @returns {Promise<Object>} Legacy tour data
 */
export const loadLegacyTourData = async (tourId, environment = 'dev') => {
  const s3BaseUrl = buildS3BaseUrl(tourId, environment);
  
  try {
    // Load both index.json and content.json
    const [indexRes, contentRes] = await Promise.all([
      fetch(`${s3BaseUrl}index.json`),
      fetch(`${s3BaseUrl}content.json`)
    ]);
    
    if (!indexRes.ok || !contentRes.ok) {
      throw new Error(`Failed to fetch tour data for ${tourId}`);
    }
    
    const [indexData, contentData] = await Promise.all([
      indexRes.json(),
      contentRes.json()
    ]);
    
    // Combine the data
    const combinedData = {
      ...indexData,
      poiList: contentData.poiList
    };
    
    if (!validateLegacyTourData(combinedData)) {
      throw new Error('Invalid legacy tour data structure');
    }
    
    return combinedData;
  } catch (error) {
    console.error(`Error loading legacy tour data for ${tourId}:`, error);
    throw error;
  }
};

/**
 * Get audio guide data for a POI
 * @param {Object} poiGuideItem - POI guide item from LaxyGuide
 * @param {string} language - Language code
 * @returns {Promise<Object|null>} Audio guide data or null if not available
 */
export const getAudioGuideForPOI = async (poiGuideItem, language = 'en') => {
  if (!poiGuideItem?.legacyTourCode) {
    return null;
  }
  
  try {
    const tourConfig = getTourConfigFromPOI(poiGuideItem);
    if (!tourConfig) {
      return null;
    }
    
    const legacyData = await loadLegacyTourData(tourConfig.tourId);
    const adaptedData = adaptLegacyTourData(legacyData, poiGuideItem);
    
    return {
      ...adaptedData,
      s3BaseUrl: tourConfig.s3BaseUrl,
      currentLanguage: language
    };
  } catch (error) {
    console.error('Error loading audio guide:', error);
    return null;
  }
};

/**
 * Check if POI has audio guide available
 * @param {Object} poiGuideItem - POI guide item
 * @returns {Promise<boolean>} Whether audio guide is available
 */
export const hasAudioGuide = async (poiGuideItem) => {
  if (!poiGuideItem?.legacyTourCode) {
    return false;
  }
  
  try {
    const tourConfig = getTourConfigFromPOI(poiGuideItem);
    if (!tourConfig) {
      return false;
    }
    
    // Try to fetch the index.json to check if tour exists
    const response = await fetch(`${tourConfig.s3BaseUrl}index.json`, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Preload audio guide assets for offline use
 * @param {Object} audioGuideData - Audio guide data
 * @param {string} language - Language code
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<boolean>} Success status
 */
export const preloadAudioGuideAssets = async (audioGuideData, language, onProgress) => {
  if (!audioGuideData?.guide?.steps) {
    return false;
  }
  
  const assets = [];
  const { steps } = audioGuideData.guide;
  const { s3BaseUrl } = audioGuideData;
  
  // Collect all assets for the language
  steps.forEach(step => {
    const stepData = getStepDataForLanguage(step, language, s3BaseUrl);
    if (stepData.audioUrl) assets.push(stepData.audioUrl);
    if (stepData.subtitleUrl) assets.push(stepData.subtitleUrl);
    stepData.images.forEach(img => assets.push(img.url));
  });
  
  let loaded = 0;
  const total = assets.length;
  
  try {
    const loadPromises = assets.map(async (url) => {
      const response = await fetch(url);
      if (response.ok) {
        await response.blob(); // Cache the blob
        loaded++;
        if (onProgress) {
          onProgress(Math.round((loaded / total) * 100));
        }
      }
    });
    
    await Promise.all(loadPromises);
    return true;
  } catch (error) {
    console.error('Error preloading assets:', error);
    return false;
  }
};
