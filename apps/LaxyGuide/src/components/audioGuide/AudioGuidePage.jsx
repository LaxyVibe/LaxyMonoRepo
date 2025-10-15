import React, { useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAudioGuide } from '../../context/AudioGuideContext.jsx';
import AudioGuidePlayer from './AudioGuidePlayer.jsx';
import { extractTextAndAudioLanguageFromPath, getValidAudioLanguageCode } from '../../utils/languageUtils.js';
import { trackEvent, trackNavigation, trackButtonClick } from '../../utils/analytics.js';

/**
 * Full-screen audio guide page component
 * Displays the complete audio guide player interface
 */
export default function AudioGuidePage() {
  const { tourId, stepId, audioLang, poiSlug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { 
    currentStep, 
    currentStepIndex,
    currentGuide,
    tourTitle, 
    steps, 
    isLoading, 
    error,
    loadAudioGuide,
    goToStep,
    audioLanguage,
    setAudioLanguage,
    clearAudioGuide,
    pause
  } = useAudioGuide();

  // Ref to track last processed config to avoid redundant work
  const lastLoadedConfigRef = useRef(null);

  // Extract audio language from URL or use default
  const { textLangCode, audioLangCode } = extractTextAndAudioLanguageFromPath(window.location.pathname);
  const urlAudioLanguage = getValidAudioLanguageCode(audioLang || audioLangCode);

  // Memoize the configuration that determines if we need to load/reload
  const currentConfig = useMemo(() => ({
    tourId,
    language,
    audioLanguage: urlAudioLanguage,
    stepId
  }), [tourId, language, urlAudioLanguage, stepId]);

  // Single effect to handle all initialization and config changes
  useEffect(() => {
    const configKey = `${currentConfig.tourId}-${currentConfig.language}-${currentConfig.audioLanguage}`;
    const lastConfigKey = lastLoadedConfigRef.current;
    
    console.log('🔍 AudioGuidePage effect triggered:', {
      currentConfig,
      configKey,
      lastConfigKey,
      isLoading,
      hasGuide: !!currentGuide,
      guideMatches: currentGuide?.tourCode === currentConfig.tourId &&
                   currentGuide?.currentLanguage === currentConfig.language &&
                   currentGuide?.audioLanguage === currentConfig.audioLanguage
    });

    // Skip if no tour ID
    if (!currentConfig.tourId) {
      return;
    }

    // Skip if already loading
    if (isLoading) {
      return;
    }

    // If we've already processed this config, still ensure we navigate to the right step
    if (configKey === lastConfigKey) {
      console.log('🔍 Already processed this config, ensure step navigation');
      if (
        currentGuide &&
        currentGuide.tourCode === currentConfig.tourId &&
        currentGuide.currentLanguage === currentConfig.language &&
        currentGuide.audioLanguage === currentConfig.audioLanguage &&
        currentConfig.stepId && steps && steps.length > 0
      ) {
        const targetStepIndex = steps.findIndex(
          (step) => step.id.toString() === currentConfig.stepId.toString()
        );
        if (targetStepIndex !== -1 && targetStepIndex !== currentStepIndex) {
          console.log('🔍 Navigating to step (processed config):', targetStepIndex);
          goToStep(targetStepIndex);
          trackEvent('audio_step_view', {
            category: 'Audio Guide',
            label: `${currentConfig.tourId}-step-${currentConfig.stepId}`,
            tour_id: currentConfig.tourId,
            step_id: currentConfig.stepId,
            step_index: targetStepIndex,
            audio_language: currentConfig.audioLanguage,
          });
        }
      }
      return;
    }

    // Set audio language synchronously before loading
    if (urlAudioLanguage !== audioLanguage) {
      console.log('🔍 Setting audio language to:', urlAudioLanguage);
      setAudioLanguage(urlAudioLanguage);
    }

    // Check if current guide matches the required configuration
    const guideMatches = currentGuide &&
      currentGuide.tourCode === currentConfig.tourId &&
      currentGuide.currentLanguage === currentConfig.language &&
      currentGuide.audioLanguage === currentConfig.audioLanguage;

    // Load guide if config changed or guide doesn't match
    if (!guideMatches) {
      console.log('🔍 Config changed or guide mismatch, loading audio guide:', currentConfig);

      // Clear current guide and load new one
      if (currentGuide) {
        pause();
        clearAudioGuide();
      }

      lastLoadedConfigRef.current = configKey;
      
      // Don't auto-load first step if we have a specific step ID in the URL
      const autoLoadFirstStep = !currentConfig.stepId;
      console.log('🔍 autoLoadFirstStep:', autoLoadFirstStep, 'stepId:', currentConfig.stepId);
      
      loadAudioGuide(currentConfig.tourId, currentConfig.language, currentConfig.audioLanguage, autoLoadFirstStep).catch(console.error);
    } else {
      // Guide matches current config; mark as processed and handle step navigation
      lastLoadedConfigRef.current = configKey;

      if (currentConfig.stepId && steps && steps.length > 0) {
        const targetStepIndex = steps.findIndex(
          (step) => step.id.toString() === currentConfig.stepId.toString()
        );
        console.log('🔍 Step navigation (guide matched):', {
          stepId: currentConfig.stepId,
          targetStepIndex,
          currentStepIndex,
          stepsLength: steps.length,
        });
        if (targetStepIndex !== -1 && targetStepIndex !== currentStepIndex) {
          goToStep(targetStepIndex);
          trackEvent('audio_step_view', {
            category: 'Audio Guide',
            label: `${currentConfig.tourId}-step-${currentConfig.stepId}`,
            tour_id: currentConfig.tourId,
            step_id: currentConfig.stepId,
            step_index: targetStepIndex,
            audio_language: currentConfig.audioLanguage,
          });
        }
      }
    }
  }, [
    currentConfig,
    currentGuide,
    isLoading,
    steps,
    currentStepIndex,
    urlAudioLanguage,
    audioLanguage,
    setAudioLanguage,
    loadAudioGuide,
    goToStep,
    pause,
    clearAudioGuide
  ]);


  const handleBackClick = () => {
    trackButtonClick('Back', 'audio-guide-page');
    trackNavigation('Audio Guide', 'Previous Page', 'back_button');
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, bgcolor: '#000000', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: '#ffffff' }}>
          Loading audio guide...
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, bgcolor: '#000000', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '50vh', justifyContent: 'center' }}>
          <Box sx={{ mb: 2, fontSize: 48 }}>🎧</Box>
          <Box sx={{ textAlign: 'center', color: '#ffffff' }}>
            {error}
          </Box>
          <IconButton 
            onClick={handleBackClick}
            sx={{ 
              mt: 2,
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
            }}
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Container>
    );
  }

  if (!currentStep || !steps || steps.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4, bgcolor: '#000000', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '50vh', justifyContent: 'center' }}>
          <Box sx={{ mb: 2, fontSize: 48 }}>🎧</Box>
          <Box sx={{ textAlign: 'center', color: '#ffffff' }}>
            No audio guide loaded
          </Box>
          <IconButton 
            onClick={handleBackClick}
            sx={{ 
              mt: 2,
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
            }}
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'background.default',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with back button */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 20, 
        backgroundColor: '#000000',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        px: 2,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <IconButton 
          onClick={handleBackClick}
          sx={{ 
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
          }}
          aria-label="Go back to tour details"
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#ffffff',
            fontWeight: 600,
            textAlign: 'center',
            flex: 1,
            mx: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {tourTitle || 'Audio Guide'}
        </Typography>
        
        {/* Spacer to balance the layout */}
        <Box sx={{ width: 48 }} />
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AudioGuidePlayer />
      </Box>
    </Box>
  );
}
