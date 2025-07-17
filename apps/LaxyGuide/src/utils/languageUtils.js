/**
 * Language utilities for the LaxyGuide application
 */

// List of supported ISO language codes
export const SUPPORTED_LANGUAGES = [
  'en', // English
  'ja', // Japanese
  'ko', // Korean
  'zh-Hant', // Traditional Chinese
  'zh-Hans', // Simplified Chinese
];

// Default language to use when no language is specified
export const DEFAULT_LANGUAGE = 'en'; // Default language

/**
 * Detect user's browser language and return a supported language code
 * @returns {string} - Detected language code that is supported by the app
 */
export const detectBrowserLanguage = () => {
  // Get browser language
  const browserLang = navigator.language || navigator.userLanguage || '';
  
  // Check if it's a supported language
  if (isLanguageSupported(browserLang)) {
    return browserLang;
  }
  
  // Handle special cases for Chinese
  if (browserLang.startsWith('zh')) {
    // Check if it's Traditional Chinese (Taiwan, Hong Kong, Macau use Traditional)
    if (browserLang.includes('TW') || browserLang.includes('HK') || browserLang.includes('MO') || 
        browserLang.includes('Hant')) {
      return 'zh-Hant';
    }
    // Default to Simplified Chinese for other Chinese variants (including zh-Hans, zh-CN)
    return 'zh-Hans';
  }
  
  // Try just the language part without region code
  const langPart = browserLang.split('-')[0];
  if (isLanguageSupported(langPart)) {
    return langPart;
  }
  
  // Fall back to default
  return DEFAULT_LANGUAGE;
};

/**
 * Check if the provided language code is supported
 * @param {string} langCode - ISO language code to check
 * @returns {boolean} - Whether the language is supported
 */
export const isLanguageSupported = (langCode) => {
  if (!langCode) return false;
  
  // Check exact match first (for extended codes like zh-TW, zh-CN)
  if (SUPPORTED_LANGUAGES.includes(langCode)) {
    return true;
  }
  
  // For backward compatibility - handle legacy Chinese codes
  if (langCode === 'zh' || langCode === 'zh-CN') {
    return true; // Map to zh-Hans
  }
  
  if (langCode === 'zh-TW') {
    return true; // Map to zh-Hant
  }
  
  return false;
};

/**
 * Get a valid language code from the provided code
 * Returns the default language if the provided code is not supported
 * @param {string} langCode - ISO language code to validate
 * @returns {string} - Valid language code
 */
export const getValidLanguageCode = (langCode) => {
  if (!langCode) {
    return DEFAULT_LANGUAGE;
  }
  
  // Handle legacy Chinese codes
  if (langCode === 'zh' || langCode === 'zh-CN') {
    return 'zh-Hans'; // Map to Simplified Chinese
  }
  
  if (langCode === 'zh-TW') {
    return 'zh-Hant'; // Map to Traditional Chinese
  }
  
  if (isLanguageSupported(langCode)) {
    return langCode;
  }
  
  return DEFAULT_LANGUAGE;
};

/**
 * Extract language code from the URL path
 * @param {string} pathname - Current URL path
 * @returns {object} - Contains langCode and cleanedPathname (without language segment)
 */
export const extractLanguageFromPath = (pathname) => {
  // Remove leading slash if present
  const path = pathname.startsWith('/') ? pathname.substring(1) : pathname;
  
  // Split path by slashes
  const segments = path.split('/');
  
  // Check if the first segment is a language code
  const potentialLangCode = segments[0];
  
  // Handle both simple language codes and extended language codes (e.g., zh-TW, zh-CN)
  const isExtendedCode = potentialLangCode && potentialLangCode.includes('-');
  
  if (isExtendedCode) {
    // For extended language codes like zh-TW or zh-CN
    if (isLanguageSupported(potentialLangCode)) {
      const remainingPath = segments.slice(1).join('/');
      return {
        langCode: potentialLangCode,
        cleanedPathname: '/' + remainingPath
      };
    }
  } else if (isLanguageSupported(potentialLangCode)) {
    // For simple language codes
    const remainingPath = segments.slice(1).join('/');
    return {
      langCode: potentialLangCode,
      cleanedPathname: '/' + remainingPath
    };
  }
  
  // No language code found, return default
  return {
    langCode: DEFAULT_LANGUAGE,
    cleanedPathname: pathname
  };
};

/**
 * Extract both text and audio language codes from the URL path
 * Supports URLs like /:textLang/tour/:tourId/:audioLang/steps
 * @param {string} pathname - Current URL path
 * @returns {object} - Contains textLangCode, audioLangCode, and cleanedPathname
 */
export const extractTextAndAudioLanguageFromPath = (pathname) => {
  // Remove leading slash if present
  const path = pathname.startsWith('/') ? pathname.substring(1) : pathname;
  
  // Split path by slashes
  const segments = path.split('/');
  
  // Check if the first segment is a text language code
  const potentialTextLangCode = segments[0];
  let textLangCode = null;
  let audioLangCode = null;
  let cleanedPathname = pathname;
  
  if (isLanguageSupported(potentialTextLangCode)) {
    textLangCode = potentialTextLangCode;
    
    // Check for tour patterns that might include audio language
    // Pattern: /:textLang/tour/:tourId/:audioLang/steps
    // Pattern: /:textLang/tour/:tourId/:audioLang/step/:stepId
    if (segments.length >= 4 && segments[1] === 'tour') {
      const potentialAudioLangCode = segments[3];
      
      // Validate if it's an audio language (not 'steps' or 'step')
      if (potentialAudioLangCode !== 'steps' && potentialAudioLangCode !== 'step') {
        // Check if it's a valid audio language code (eng, jpn, kor, cmn)
        const validAudioLanguages = ['eng', 'jpn', 'kor', 'cmn'];
        if (validAudioLanguages.includes(potentialAudioLangCode)) {
          audioLangCode = potentialAudioLangCode;
          // Remove both text and audio language from path
          const remainingSegments = [segments[1], segments[2], ...segments.slice(4)];
          cleanedPathname = '/' + remainingSegments.join('/');
        } else {
          // No audio language, just remove text language
          const remainingSegments = segments.slice(1);
          cleanedPathname = '/' + remainingSegments.join('/');
        }
      } else {
        // No audio language, just remove text language
        const remainingSegments = segments.slice(1);
        cleanedPathname = '/' + remainingSegments.join('/');
      }
    } else {
      // Standard pattern without audio language
      const remainingSegments = segments.slice(1);
      cleanedPathname = '/' + remainingSegments.join('/');
    }
  }
  
  return {
    textLangCode: textLangCode || DEFAULT_LANGUAGE,
    audioLangCode: audioLangCode || null,
    cleanedPathname
  };
};

// List of supported audio language codes
export const SUPPORTED_AUDIO_LANGUAGES = ['eng', 'jpn', 'kor', 'cmn'];

/**
 * Check if the provided audio language code is supported
 * @param {string} audioLangCode - Audio language code to check
 * @returns {boolean} - Whether the audio language is supported
 */
export const isAudioLanguageSupported = (audioLangCode) => {
  return SUPPORTED_AUDIO_LANGUAGES.includes(audioLangCode);
};

/**
 * Get a valid audio language code from the provided code
 * Returns the default audio language if the provided code is not supported
 * @param {string} audioLangCode - Audio language code to validate
 * @returns {string} - Valid audio language code
 */
export const getValidAudioLanguageCode = (audioLangCode) => {
  if (!audioLangCode || !isAudioLanguageSupported(audioLangCode)) {
    return 'eng'; // Default to English audio
  }
  return audioLangCode;
};