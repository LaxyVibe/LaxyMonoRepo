/**
 * Audio Guide Context
 * Manages global audio guide state across the application
 */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AudioGuideContext = createContext();

export function AudioGuideProvider({ children }) {
  // Current audio guide state
  const [currentGuide, setCurrentGuide] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Audio language state (separate from UI language)
  const [audioLanguage, setAudioLanguageState] = useState('eng'); // Default to English audio
  
  // Wrapper function to update audio language
  const setAudioLanguage = useCallback((newAudioLanguage) => {
    console.log('🔍 Setting audio language:', newAudioLanguage);
    setAudioLanguageState(newAudioLanguage);
  }, []);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Audio element ref
  const audioRef = useRef(null);
  const previousStepIdRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Handle audio events
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // Auto-advance to next step if available
    if (currentGuide?.guide?.steps && currentStepIndex < currentGuide.guide.steps.length - 1) {
      goToNextStep();
    }
  };

  const handleError = (error) => {
    console.error('Audio playback error:', error);
    setIsPlaying(false);
    setIsLoading(false);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  // Load new step audio
  const loadStepAudio = (stepData) => {
    if (!stepData?.audioUrl || !audioRef.current) return;

    const stepId = stepData.id;
    
    // If this is a new step, load the audio
    if (previousStepIdRef.current !== stepId) {
      audioRef.current.src = stepData.audioUrl;
      audioRef.current.load();
      
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      
      previousStepIdRef.current = stepId;
    }
  };

  // Audio control functions
  const play = async () => {
    if (audioRef.current && currentStep?.audioUrl) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipForward = (seconds = 15) => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + seconds, duration);
      seekTo(newTime);
    }
  };

  const skipBackward = (seconds = 15) => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - seconds, 0);
      seekTo(newTime);
    }
  };

  // Step navigation
  const goToStep = (stepIndex) => {
    console.log('🔍 goToStep called:');
    console.log('  stepIndex:', stepIndex);
    console.log('  currentGuide?.guide?.steps length:', currentGuide?.guide?.steps?.length);
    console.log('  currentGuide?.guide?.steps:', currentGuide?.guide?.steps);
    
    if (!currentGuide?.guide?.steps || stepIndex < 0 || stepIndex >= currentGuide.guide.steps.length) {
      console.log('🔍 goToStep early return - invalid conditions');
      return;
    }

    const step = currentGuide.guide.steps[stepIndex];
    console.log('🔍 Selected step:', step);
    
    // Use the UI language for step data, but audio language is already set in context
    // getStepDataForLanguage will use audioLanguage from context for audio content
    const stepData = getStepDataForLanguage(step, currentGuide.currentLanguage, currentGuide.s3BaseUrl, currentGuide.audioLanguage);
    console.log('🔍 Step data for UI language with audio language context:', stepData);
    
    setCurrentStepIndex(stepIndex);
    setCurrentStep(stepData);
    loadStepAudio(stepData);
  };

  const goToNextStep = () => {
    goToStep(currentStepIndex + 1);
  };

  const goToPreviousStep = () => {
    goToStep(currentStepIndex - 1);
  };

  // Load audio guide
  const loadAudioGuide = useCallback(async (tourCodeOrGuideData, language = 'en', targetAudioLanguage = null, autoLoadFirstStep = true) => {
    try {
      // Use the passed target audio language or fall back to current state
      const effectiveAudioLanguage = targetAudioLanguage || audioLanguage;
      
      console.log('🔍 AudioGuideContext loadAudioGuide called:');
      console.log('  tourCodeOrGuideData:', tourCodeOrGuideData);
      console.log('  language:', language);
      console.log('  targetAudioLanguage:', targetAudioLanguage);
      console.log('  effectiveAudioLanguage:', effectiveAudioLanguage);
      console.log('  autoLoadFirstStep:', autoLoadFirstStep);
      
      setIsLoading(true);
      setError(null); // Clear any previous errors
      
      let guideData;
      
      // If the first parameter is a string, treat it as a tour code and fetch from S3
      if (typeof tourCodeOrGuideData === 'string') {
        const tourCode = tourCodeOrGuideData;
        const s3BaseUrl = `https://s3.ap-northeast-1.amazonaws.com/laxy.travel.staging/tours/${tourCode}/`;
        
        console.log('🔍 Fetching tour data from S3:');
        console.log('  tourCode:', tourCode);
        console.log('  s3BaseUrl:', s3BaseUrl);
        console.log('  index.json URL:', `${s3BaseUrl}index.json`);
        console.log('  content.json URL:', `${s3BaseUrl}content.json`);
        
        // Fetch both index.json and content.json files like LegacyTourGuide does
        const [indexResponse, contentResponse] = await Promise.all([
          fetch(`${s3BaseUrl}index.json`),
          fetch(`${s3BaseUrl}content.json`)
        ]);
        
        console.log('🔍 Fetch responses:');
        console.log('  index.json ok:', indexResponse.ok, 'status:', indexResponse.status);
        console.log('  content.json ok:', contentResponse.ok, 'status:', contentResponse.status);
        
        if (!indexResponse.ok) {
          throw new Error(`Failed to fetch index.json: ${indexResponse.status} ${indexResponse.statusText}`);
        }
        
        if (!contentResponse.ok) {
          throw new Error(`Failed to fetch content.json: ${contentResponse.status} ${contentResponse.statusText}`);
        }
        
        const [indexData, contentData] = await Promise.all([
          indexResponse.json(),
          contentResponse.json()
        ]);

        // Merge Strapi narrations (new API) into legacy content.json (poiList) so view layer remains unchanged
        // Mapping: narration.legacyStepCode -> poi.id, add field poi.content
        try {
          // Content should follow the UI/TEXT language of the current view
          // Map UI languages -> Strapi locales
          const uiToStrapiLocale = {
            en: 'en',
            ja: 'ja',
            ko: 'ko',
            'zh-Hans': 'zh-Hans',
            'zh-Hant': 'zh-Hant'
          };
          const strapiLocale = uiToStrapiLocale[language] || 'en';
          const STRAPI_BASE = 'https://laxy-studio-strapi-c1d6d20cbc41.herokuapp.com';
          const buildUrl = (loc) => `${STRAPI_BASE}/api/poi-guides/?populate=narrations&locale=${encodeURIComponent(loc)}&filters[legacyTourCode][$eq]=${encodeURIComponent(tourCode)}`;
          const buildNarrationsUrl = (loc) => `${STRAPI_BASE}/api/narrations?locale=${encodeURIComponent(loc)}&filters[poiGuide][legacyTourCode][$eq]=${encodeURIComponent(tourCode)}&pagination[pageSize]=500`;
          let narrationsLocaleTried = strapiLocale;
          let narrationsUrl = buildUrl(narrationsLocaleTried);
          console.log('🔗 Fetching Strapi narrations:', narrationsUrl);
          let narrationsRes = await fetch(narrationsUrl);
          if (narrationsRes.ok) {
            let narrationsJson = await narrationsRes.json();
            // Extract narrations from either a flattened array or standard Strapi v4 shape
            const extractNarrations = (json) => {
              // 1) Flattened: data[0].narrations -> [{ legacyStepCode, content }]
              const flat = json?.data?.[0]?.narrations;
              if (Array.isArray(flat)) return flat;
              // 2) Standard v4: data[0].attributes.narrations.data -> [{ attributes: { legacyStepCode, content } }]
              const standard = json?.data?.[0]?.attributes?.narrations?.data;
              if (Array.isArray(standard)) {
                return standard.map(n => ({
                  legacyStepCode: n?.attributes?.legacyStepCode,
                  content: n?.attributes?.content
                })).filter(n => n.legacyStepCode);
              }
              return [];
            };
            let narrations = extractNarrations(narrationsJson);
            // If none found via populated guide, try querying narrations collection directly
            if ((!Array.isArray(narrations) || narrations.length === 0)) {
              const directUrl = buildNarrationsUrl(strapiLocale);
              console.log('🔎 No narrations from guide payload, trying direct narrations API:', directUrl);
              const directRes = await fetch(directUrl);
              if (directRes.ok) {
                const directJson = await directRes.json();
                const directList = Array.isArray(directJson?.data) ? directJson.data : [];
                narrations = directList.map(n => ({
                  legacyStepCode: n?.attributes?.legacyStepCode,
                  content: n?.attributes?.content
                })).filter(n => n.legacyStepCode);
              }
            }
            // No fallback to other languages; if locale has no narrations, leave content empty
            if ((!Array.isArray(narrations) || narrations.length === 0)) {
              console.log('ℹ️ No narrations found for locale; skipping content fallback.');
            }
            console.log('🧩 Strapi narrations count:', narrations.length);
            if (Array.isArray(contentData?.poiList) && narrations.length > 0) {
              const mapByStep = new Map();
              narrations.forEach(n => {
                if (n?.legacyStepCode) mapByStep.set(n.legacyStepCode, n);
              });
              contentData.poiList = contentData.poiList.map(poi => {
                const match = mapByStep.get(poi?.id);
                if (match && match.content != null) {
                  return { ...poi, content: match.content };
                }
                return poi;
              });
            }
          } else {
            console.warn('⚠️ Failed to fetch Strapi narrations:', narrationsRes.status, narrationsRes.statusText);
          }
        } catch (mergeErr) {
          console.warn('⚠️ Skipping narrations merge due to error:', mergeErr);
        }
        
        console.log('🔍 Fetched data:');
        console.log('  indexData:', indexData);
        console.log('  contentData poiList length:', contentData.poiList?.length);
        console.log('  contentData poiList:', contentData.poiList);

        // Transform poiList to steps format that AudioGuide expects
        const steps = contentData.poiList?.map((poi, index) => {
          console.log(`🔍 Processing POI ${index}:`, poi);
          
          // Handle language-specific title and subtitle - use AUDIO language for consistency with audio content
          // Since step content is organized by audio language, titles should also match the audio language
          // Check if poi.label is an object or a string
          let title = 'Untitled Step';
          if (typeof poi.label === 'object' && poi.label !== null) {
            // Try audio language first, then fallbacks
            title = poi.label[effectiveAudioLanguage] || poi.label['eng'] || poi.label['en'] || 
                    poi.label[Object.keys(poi.label)[0]] || 'Untitled Step';
          } else if (typeof poi.label === 'string') {
            title = poi.label;
          }
          
          console.log(`🔍 POI ${index} - Title extracted for audioLanguage '${effectiveAudioLanguage}':`, title);
          
          // Extract image data with timing information from audio language structure
          let images = [];
          if (poi.image) {
            const langImages = poi.image[effectiveAudioLanguage] || poi.image['eng'] || poi.image[Object.keys(poi.image)[0]];
            console.log(`🖼️ POI ${index} - Raw image data for ${effectiveAudioLanguage}:`, langImages);
            if (langImages && Array.isArray(langImages)) {
              images = langImages.map(img => ({
                url: img.url || img,
                startTimestamp: img.startTimestamp || 0,
                endTimestamp: img.endTimestamp || 0
              }));
              console.log(`🖼️ POI ${index} - Processed images:`, images);
            }
          }
          
          const step = {
            id: poi.id,
            title: title,
            // Keep using title for description for now; content is merged into poi.content (if present)
            description: title,
            content: poi.content || null,
            audio: poi.audio, // Keep the full audio object with all languages
            subtitle: poi.subtitle, // Keep the full subtitle object with all languages
            images: images,
            order: index + 1,
            duration: null // Duration not provided in this data structure
          };
          
          console.log(`🔍 POI ${index} - Final step:`, step);
          return step;
        }) || [];
        
        console.log('🔍 All transformed steps:', steps);
        console.log('🔍 Steps count:', steps.length);

        // Combine the data with transformed steps
        const combinedTourData = { 
          ...indexData, 
          poiList: contentData.poiList,
          steps: steps
        };
        
        guideData = {
          guide: combinedTourData,
          s3BaseUrl: s3BaseUrl,
          tourCode: tourCode
        };
        
        console.log('🔍 Final guideData:', guideData);
      } else {
        // Otherwise, treat it as already-loaded guide data
        guideData = tourCodeOrGuideData;
      }
      
      console.log('🔍 Setting currentGuide with UI language:', language, 'and audioLanguage:', effectiveAudioLanguage);
      const updatedGuideData = { 
        ...guideData, 
        currentLanguage: language,
        audioLanguage: effectiveAudioLanguage // Track which audio language was used for step content
      };
      setCurrentGuide(updatedGuideData);
      
      if (guideData?.guide?.steps && guideData.guide.steps.length > 0) {
        if (autoLoadFirstStep) {
          console.log('🔍 Auto-loading step 0, steps available:', guideData.guide.steps.length);
          // Manually set the first step since goToStep relies on currentGuide state which hasn't updated yet
          const firstStep = guideData.guide.steps[0];
          const stepData = getStepDataForLanguage(firstStep, language, guideData.s3BaseUrl, effectiveAudioLanguage);
          setCurrentStepIndex(0);
          setCurrentStep(stepData);
          loadStepAudio(stepData);
        } else {
          console.log('🔍 Guide loaded, but not auto-loading first step. Steps available:', guideData.guide.steps.length);
          // Just set the index and step to null, let the page handle step navigation
          setCurrentStepIndex(-1);
          setCurrentStep(null);
        }
      } else {
        console.log('🔍 No steps available, setting currentStep to null');
        setCurrentStep(null);
        setCurrentStepIndex(0);
      }
      
      console.log('🔍 Loading complete, setting isLoading to false');
      setIsLoading(false);
    } catch (error) {
      console.error('🔍 Error loading audio guide:', error);
      setIsLoading(false);
      setError(error.message || 'Failed to load audio guide');
      throw error; // Re-throw so calling code can handle it
    }
  }, [audioLanguage]); // Simplified dependencies

  // Clear audio guide
  const clearAudioGuide = () => {
    pause();
    setCurrentGuide(null);
    setCurrentStep(null);
    setCurrentStepIndex(0);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    previousStepIdRef.current = null;
  };

  // Helper function (import this from legacyDataAdapter)
  const getStepDataForLanguage = (step, uiLanguage, s3BaseUrl, targetAudioLanguage = null) => {
    const effectiveAudioLanguage = targetAudioLanguage || audioLanguage;
    
    const languageMap = {
      'en': 'eng',
      'ja': 'jpn',
      'ko': 'kor',
      'zh-Hant': 'cht',
      'zh-Hans': 'chs'
    };
    
    const legacyLangCode = languageMap[effectiveAudioLanguage] || effectiveAudioLanguage;
    
    console.log('🎭 getStepDataForLanguage called:');
    console.log('  step:', step);
    console.log('  uiLanguage:', uiLanguage);
    console.log('  effectiveAudioLanguage:', effectiveAudioLanguage);
    console.log('  legacyLangCode:', legacyLangCode);
    console.log('  step.subtitle:', step.subtitle);
    console.log('  step.subtitle?.[legacyLangCode]:', step.subtitle?.[legacyLangCode]);
    
    console.log('🖼️ getStepDataForLanguage - step images:', step.images);
    
    const processedImages = (step.images || []).map(img => {
      // If it's already a processed object with timing
      if (typeof img === 'object' && img.url) {
        return {
          url: img.url.startsWith('http') ? img.url : `${s3BaseUrl}${img.url}`,
          startTimestamp: img.startTimestamp || 0,
          endTimestamp: img.endTimestamp || 0
        };
      }
      // If it's just a URL string
      return {
        url: typeof img === 'string' && img.startsWith('http') ? img : `${s3BaseUrl}${img}`,
        startTimestamp: 0,
        endTimestamp: 0
      };
    });
    
    console.log('🖼️ getStepDataForLanguage - processed images:', processedImages);
    
    const audioUrl = step.audio?.[legacyLangCode] ? `${s3BaseUrl}${step.audio[legacyLangCode]}` : null;
    const subtitleUrl = step.subtitle?.[legacyLangCode] ? `${s3BaseUrl}${step.subtitle[legacyLangCode]}` : null;
    
    console.log('🎭 URL construction:');
    console.log('  audioUrl:', audioUrl);
    console.log('  subtitleUrl:', subtitleUrl);
    
    return {
      id: step.id,
      title: step.title,
      description: step.description,
      content: step.content || null,
      audioUrl: audioUrl,
      subtitleUrl: subtitleUrl,
      images: processedImages,
      duration: step.duration,
      order: step.order
    };
  };

  const contextValue = {
    // State
    currentGuide,
    currentStep,
    currentStepIndex,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error,
    audioLanguage,
    tourData: currentGuide, // Alias for compatibility
    steps: currentGuide?.guide?.steps || [], // Direct access to steps
    tourTitle: (() => {
      const title = currentGuide?.guide?.title;
      if (!title) return '';
      if (typeof title === 'string') return title;
      if (typeof title === 'object' && title !== null) {
        const lang = currentGuide?.currentLanguage || 'en';
        const extractedTitle = title[lang] || title['eng'] || title['en'] || title[Object.keys(title)[0]] || '';
        // Ensure we always return a string
        return typeof extractedTitle === 'string' ? extractedTitle : '';
      }
      return '';
    })(), // Extract language-specific title
    
    // Actions
    loadAudioGuide,
    clearAudioGuide,
    play,
    pause,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    setCurrentStep, // Export setCurrentStep for direct step navigation
    setAudioLanguage, // Export audio language setter
    
    // Computed
    hasNextStep: currentGuide?.guide?.steps && currentStepIndex < currentGuide.guide.steps.length - 1,
    hasPreviousStep: currentStepIndex > 0,
    totalSteps: currentGuide?.guide?.steps?.length || 0,
    progress: duration > 0 ? (currentTime / duration) * 100 : 0
  };

  return (
    <AudioGuideContext.Provider value={contextValue}>
      {children}
    </AudioGuideContext.Provider>
  );
}

export function useAudioGuide() {
  const context = useContext(AudioGuideContext);
  if (!context) {
    throw new Error('useAudioGuide must be used within an AudioGuideProvider');
  }
  return context;
}
