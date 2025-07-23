/**
 * Audio language utilities for getting dynamic audio language configurations
 */

import { getHubConfigByLanguage } from '../mocks/guide-application-config/index.js';

/**
 * Get audio languages from the API configuration
 * @param {string} langCode - Current language code for getting the config
 * @returns {Array} Array of audio language objects with code and label
 */
export const getAudioLanguagesFromConfig = (langCode = 'en') => {
  const guideConfig = getHubConfigByLanguage(langCode);
  
  // Get audio languages from universalConfig
  const audioLanguages = guideConfig?.data?.universalConfig?.audioLanguages || [];
  
  // Transform to the format expected by the components
  return audioLanguages.map(lang => ({
    code: lang.value,
    label: lang.label
  }));
};

/**
 * Get available audio languages filtered by what's supported by the tour
 * @param {string} langCode - Current language code for getting the config
 * @param {Array} availableLanguages - Array of available language codes from tour data
 * @returns {Array} Array of filtered audio language objects
 */
export const getFilteredAudioLanguages = (langCode = 'en', availableLanguages = []) => {
  const allAudioLanguages = getAudioLanguagesFromConfig(langCode);
  
  // If no available languages provided, return all
  if (!availableLanguages || availableLanguages.length === 0) {
    return allAudioLanguages;
  }
  
  // Filter to only include languages that are available in the tour
  return allAudioLanguages.filter(lang => availableLanguages.includes(lang.code));
};

/**
 * Fallback audio languages (used as backup if API data is not available)
 */
export const FALLBACK_AUDIO_LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'jpn', label: '日本語' },
  { code: 'kor', label: '한국어' },
  { code: 'cmn', label: '國語' }
];
