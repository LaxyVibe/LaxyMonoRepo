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
  const [audioLanguage, setAudioLanguage] = useState('eng'); // Default to English audio
  
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
    
    const stepData = getStepDataForLanguage(step, currentGuide.currentLanguage, currentGuide.s3BaseUrl);
    console.log('🔍 Step data for language:', stepData);
    
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
  const loadAudioGuide = useCallback(async (tourCodeOrGuideData, language = 'en') => {
    try {
      console.log('🔍 AudioGuideContext loadAudioGuide called:');
      console.log('  tourCodeOrGuideData:', tourCodeOrGuideData);
      console.log('  language:', language);
      console.log('  currentGuide?.tourCode:', currentGuide?.tourCode);
      console.log('  currentGuide?.currentLanguage:', currentGuide?.currentLanguage);
      
      setIsLoading(true);
      setError(null); // Clear any previous errors
      
      // Check if we're already loading this exact tour in this language
      if (typeof tourCodeOrGuideData === 'string' && 
          currentGuide?.tourCode === tourCodeOrGuideData && 
          currentGuide?.currentLanguage === language) {
        console.log('🔍 Tour already loaded, skipping reload');
        setIsLoading(false);
        return;
      }
      
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
        
        console.log('🔍 Fetched data:');
        console.log('  indexData:', indexData);
        console.log('  contentData poiList length:', contentData.poiList?.length);
        console.log('  contentData poiList:', contentData.poiList);

        // Transform poiList to steps format that AudioGuide expects
        const steps = contentData.poiList?.map((poi, index) => {
          console.log(`🔍 Processing POI ${index}:`, poi);
          
          // Handle language-specific title and subtitle - use UI language for text
          // Check if poi.label is an object or a string
          let title = 'Untitled Step';
          if (typeof poi.label === 'object' && poi.label !== null) {
            title = poi.label[language] || poi.label['eng'] || poi.label['en'] || 
                    poi.label[Object.keys(poi.label)[0]] || 'Untitled Step';
          } else if (typeof poi.label === 'string') {
            title = poi.label;
          }
          
          console.log(`🔍 POI ${index} - Title extracted:`, title);
          
          // Handle subtitle similarly
          let subtitle = '';
          if (typeof poi.subtitle === 'object' && poi.subtitle !== null) {
            subtitle = poi.subtitle[language] || poi.subtitle['eng'] || poi.subtitle['en'] || 
                      poi.subtitle[Object.keys(poi.subtitle)[0]] || '';
          } else if (typeof poi.subtitle === 'string') {
            subtitle = poi.subtitle;
          }
          
          // Extract image data with timing information from audio language structure
          let images = [];
          if (poi.image) {
            const langImages = poi.image[audioLanguage] || poi.image['eng'] || poi.image[Object.keys(poi.image)[0]];
            console.log(`🖼️ POI ${index} - Raw image data for ${audioLanguage}:`, langImages);
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
            description: title, // Using title as description since it's not separate
            audio: poi.audio,
            subtitle: subtitle,
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
      
      console.log('🔍 Setting currentGuide with language:', language);
      const updatedGuideData = { ...guideData, currentLanguage: language };
      setCurrentGuide(updatedGuideData);
      
      if (guideData?.guide?.steps && guideData.guide.steps.length > 0) {
        console.log('🔍 Going to step 0, steps available:', guideData.guide.steps.length);
        // Manually set the first step since goToStep relies on currentGuide state which hasn't updated yet
        const firstStep = guideData.guide.steps[0];
        const stepData = getStepDataForLanguage(firstStep, language, guideData.s3BaseUrl);
        setCurrentStepIndex(0);
        setCurrentStep(stepData);
        loadStepAudio(stepData);
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
  }, [audioLanguage]); // Only depend on audioLanguage to prevent infinite loops

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
  const getStepDataForLanguage = (step, uiLanguage, s3BaseUrl) => {
    const languageMap = {
      'en': 'eng',
      'ja': 'jpn',
      'ko': 'kor',
      'zh-Hant': 'cht',
      'zh-Hans': 'chs'
    };
    
    const legacyLangCode = languageMap[audioLanguage] || audioLanguage;
    
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
    
    return {
      id: step.id,
      title: step.title,
      description: step.description,
      audioUrl: step.audio?.[legacyLangCode] ? `${s3BaseUrl}${step.audio[legacyLangCode]}` : null,
      subtitleUrl: step.subtitle?.[legacyLangCode] ? `${s3BaseUrl}${step.subtitle[legacyLangCode]}` : null,
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
