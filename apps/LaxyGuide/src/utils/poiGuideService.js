/**
 * POI Guide Data Service
 * Simple service to load POI guide data from JSON files
 */

/**
 * Load POI guide data for a specific language
 * @param {string} language - Language code (en, ja, ko, zh-Hant, zh-Hans)
 * @returns {Promise<Object>} POI data object
 */
export const loadPOIGuideData = async (language) => {
  try {
    console.log(`Loading POI guide data for language: ${language}`);
    // Dynamic import approach
    const module = await import(`../mocks/poi-guides/${language}.json`);
    const data = module.default || module;
    console.log(`Loaded POI guide data:`, data);
    return data;
  } catch (error) {
    console.warn(`Failed to load POI guide data for language ${language}:`, error);
    // Fallback to English if language-specific data is not available
    if (language !== 'en') {
      try {
        const fallbackModule = await import(`../mocks/poi-guides/en.json`);
        const fallbackData = fallbackModule.default || fallbackModule;
        console.log(`Loaded fallback POI guide data:`, fallbackData);
        return fallbackData;
      } catch (fallbackError) {
        console.error('Failed to load fallback POI guide data:', fallbackError);
      }
    }
    return { data: [], meta: { pagination: { total: 0 } } };
  }
};

/**
 * Find a POI by slug in the loaded data
 * @param {Object} poiData - The POI data object
 * @param {string} poiSlug - The POI slug to search for
 * @returns {Object|null} The complete POI item object (including legacyTourCode) or null if not found
 */
export const findPOIBySlug = (poiData, poiSlug) => {
  if (!poiData?.data || !Array.isArray(poiData.data)) {
    return null;
  }
  
  // Case-insensitive slug matching
  const normalizedSlug = poiSlug.toLowerCase();
  const poiItem = poiData.data.find(item => 
    item.poi?.slug && item.poi.slug.toLowerCase() === normalizedSlug
  );
  return poiItem || null;
};

/**
 * Get POI details by slug and language
 * @param {string} poiSlug - The POI slug
 * @param {string} language - Language code
 * @returns {Promise<Object|null>} The POI object or null if not found
 */
export const getPOIDetails = async (poiSlug, language) => {
  const poiData = await loadPOIGuideData(language);
  return findPOIBySlug(poiData, poiSlug);
};
