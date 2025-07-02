/**
 * Language mapping utilities for LaxyComponents
 * Maps between text language codes (used in URLs) and audio language codes (used in audio guides)
 */

// Text language to audio language mapping
export const TEXT_TO_AUDIO_LANGUAGE_MAP = {
  'en': 'eng',
  'ja': 'jpn', 
  'ko': 'kor',
  'zh-Hant': 'cmn',
  'zh-Hans': 'cmn'
};

// Audio language to text language mapping (reverse mapping)
export const AUDIO_TO_TEXT_LANGUAGE_MAP = {
  'eng': 'en',
  'jpn': 'ja',
  'kor': 'ko', 
  'cmn': 'zh-Hant' // Default to traditional Chinese for cmn
};

/**
 * Maps text language code to audio language code
 * @param {string} textLanguage - Text language code (en, ja, ko, zh-Hant, zh-Hans)
 * @returns {string} Audio language code (eng, jpn, kor, cmn)
 */
export const mapTextToAudioLanguage = (textLanguage) => {
  return TEXT_TO_AUDIO_LANGUAGE_MAP[textLanguage] || 'eng';
};

/**
 * Maps audio language code to text language code
 * @param {string} audioLanguage - Audio language code (eng, jpn, kor, cmn)
 * @returns {string} Text language code (en, ja, ko, zh-Hant, zh-Hans)
 */
export const mapAudioToTextLanguage = (audioLanguage) => {
  return AUDIO_TO_TEXT_LANGUAGE_MAP[audioLanguage] || 'en';
};

/**
 * Get current languages based on URL langCode
 * @param {string} langCode - Language code from URL
 * @returns {Object} Object containing currentTextLanguage and currentAudioLanguage
 */
export const getCurrentLanguages = (langCode) => {
  const currentTextLanguage = langCode || 'en';
  const currentAudioLanguage = mapTextToAudioLanguage(currentTextLanguage);
  
  return {
    currentTextLanguage,
    currentAudioLanguage
  };
};

/**
 * Validate if a text language code is supported
 * @param {string} textLanguage - Text language code to validate
 * @returns {boolean} True if supported, false otherwise
 */
export const isValidTextLanguage = (textLanguage) => {
  return Object.keys(TEXT_TO_AUDIO_LANGUAGE_MAP).includes(textLanguage);
};

/**
 * Validate if an audio language code is supported
 * @param {string} audioLanguage - Audio language code to validate
 * @returns {boolean} True if supported, false otherwise
 */
export const isValidAudioLanguage = (audioLanguage) => {
  return Object.keys(AUDIO_TO_TEXT_LANGUAGE_MAP).includes(audioLanguage);
};

/**
 * Get all supported text language codes
 * @returns {string[]} Array of supported text language codes
 */
export const getSupportedTextLanguages = () => {
  return Object.keys(TEXT_TO_AUDIO_LANGUAGE_MAP);
};

/**
 * Get all supported audio language codes
 * @returns {string[]} Array of supported audio language codes
 */
export const getSupportedAudioLanguages = () => {
  return Object.keys(AUDIO_TO_TEXT_LANGUAGE_MAP);
};
