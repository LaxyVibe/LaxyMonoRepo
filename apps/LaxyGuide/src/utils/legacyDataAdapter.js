/**
 * Legacy Data Adapter
 * Adapts legacy tour data structure to new LaxyGuide structure
 */
import { extractTourIdFromLegacyCode } from './tourIdResolver.js';

/**
 * Adapt legacy tour data to new structure
 * @param {Object} legacyData - Legacy tour data from S3
 * @param {Object} poiData - POI data from LaxyGuide
 * @returns {Object} Adapted data structure
 */
export const adaptLegacyTourData = (legacyData, poiData) => {
  const tourId = extractTourIdFromLegacyCode(poiData.legacyTourCode);
  
  return {
    poi: poiData.poi,
    guide: {
      id: tourId,
      title: legacyData.title || `Audio Guide for ${poiData.poi.label}`,
      description: legacyData.description,
      steps: legacyData.poiList ? legacyData.poiList.map(legacyPoi => ({
        id: legacyPoi.id,
        title: legacyPoi.title,
        description: legacyPoi.description,
        audio: legacyPoi.audio,
        subtitle: legacyPoi.subtitle,
        images: legacyPoi.image,
        duration: legacyPoi.duration,
        order: legacyPoi.order || 0
      })) : []
    }
  };
};

/**
 * Get step data for specific language
 * @param {Object} step - Step data
 * @param {string} language - Language code
 * @param {string} s3BaseUrl - S3 base URL
 * @returns {Object} Step data for language
 */
export const getStepDataForLanguage = (step, language, s3BaseUrl) => {
  // Map language codes (LaxyGuide uses en, ja, etc. vs legacy eng, jpn)
  const languageMap = {
    'en': 'eng',
    'ja': 'jpn',
    'ko': 'kor',
    'zh-Hant': 'cht',
    'zh-Hans': 'chs'
  };
  
  const legacyLangCode = languageMap[language] || language;
  
  return {
    id: step.id,
    title: step.title,
    description: step.description,
    audioUrl: step.audio?.[legacyLangCode] ? `${s3BaseUrl}${step.audio[legacyLangCode]}` : null,
    subtitleUrl: step.subtitle?.[legacyLangCode] ? `${s3BaseUrl}${step.subtitle[legacyLangCode]}` : null,
    images: (step.images?.[legacyLangCode] || []).map(img => ({
      url: `${s3BaseUrl}${img.url}`,
      startTimestamp: img.startTimestamp,
      endTimestamp: img.endTimestamp
    })),
    duration: step.duration,
    order: step.order
  };
};

/**
 * Validate legacy tour data structure
 * @param {Object} legacyData - Legacy data to validate
 * @returns {boolean} Whether data is valid
 */
export const validateLegacyTourData = (legacyData) => {
  return !!(
    legacyData &&
    typeof legacyData === 'object' &&
    Array.isArray(legacyData.poiList)
  );
};

/**
 * Get available languages from legacy data
 * @param {Object} legacyData - Legacy tour data
 * @returns {Array} Available language codes
 */
export const getAvailableLanguages = (legacyData) => {
  const languages = new Set();
  
  if (legacyData.poiList) {
    legacyData.poiList.forEach(poi => {
      if (poi.audio) {
        Object.keys(poi.audio).forEach(lang => languages.add(lang));
      }
    });
  }
  
  // Convert legacy language codes back to LaxyGuide format
  const reverseLanguageMap = {
    'eng': 'en',
    'jpn': 'ja',
    'kor': 'ko',
    'cht': 'zh-Hant',
    'chs': 'zh-Hans'
  };
  
  return Array.from(languages).map(lang => reverseLanguageMap[lang] || lang);
};
