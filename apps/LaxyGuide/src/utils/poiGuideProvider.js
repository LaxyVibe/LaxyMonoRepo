/**
 * POI Guide Data Provider
 * Direct imports of POI guide JSON files
 */

// Note: These imports might cause TypeScript issues in some configurations
// If so, we'll need to adjust the approach

/**
 * Load POI guide data for a specific language using fetch
 * @param {string} language - Language code (en, ja, ko, zh-Hant, zh-Hans)
 * @returns {Promise<Object>} POI data object
 */
export const loadPOIGuideData = async (language) => {
  try {
    console.log(`Loading POI guide data for language: ${language}`);
    
    // Use fetch to load the JSON file from the public directory or mock files
    const response = await fetch(`/src/mocks/poi-guides/${language}.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Loaded POI guide data:`, data);
    return data;
  } catch (error) {
    console.warn(`Failed to load POI guide data for language ${language}:`, error);
    
    // Fallback to English if language-specific data is not available
    if (language !== 'en') {
      try {
        const response = await fetch(`/src/mocks/poi-guides/en.json`);
        if (response.ok) {
          const fallbackData = await response.json();
          console.log(`Loaded fallback POI guide data:`, fallbackData);
          return fallbackData;
        }
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
 * @returns {Object|null} The POI object or null if not found
 */
export const findPOIBySlug = (poiData, poiSlug) => {
  if (!poiData?.data || !Array.isArray(poiData.data)) {
    console.log('No POI data or data is not an array:', poiData);
    return null;
  }
  
  console.log(`Searching for POI with slug: "${poiSlug}"`);
  console.log('Available POIs:', poiData.data.map(item => ({ 
    slug: item.poi?.slug, 
    label: item.poi?.label 
  })));
  
  // Case-insensitive slug matching
  const normalizedSlug = poiSlug.toLowerCase();
  const poiItem = poiData.data.find(item => 
    item.poi?.slug && item.poi.slug.toLowerCase() === normalizedSlug
  );
  
  console.log('Found POI item:', poiItem);
  return poiItem?.poi || null;
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
