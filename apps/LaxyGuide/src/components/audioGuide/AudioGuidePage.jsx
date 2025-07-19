import React, { useEffect } from 'react';
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
  const { tourId, stepId, audioLang } = useParams();
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
    audioLanguageRefreshKey,
    setAudioLanguage,
    clearAudioGuide,
    pause
  } = useAudioGuide();

  // Extract audio language from URL or use default
  const { textLangCode, audioLangCode } = extractTextAndAudioLanguageFromPath(window.location.pathname);
  const urlAudioLanguage = getValidAudioLanguageCode(audioLang || audioLangCode);

  // Set audio language immediately on component mount if it's different
  React.useLayoutEffect(() => {
    if (urlAudioLanguage !== audioLanguage) {
      console.log('🔍 AudioGuidePage setting audio language immediately:', urlAudioLanguage);
      setAudioLanguage(urlAudioLanguage);
    }
  }, []); // Only run once on mount

  // Set audio language from URL
  React.useEffect(() => {
    if (urlAudioLanguage !== audioLanguage) {
      console.log('🔍 AudioGuidePage audio language change detected, clearing guide and setting new language:', urlAudioLanguage);
      // Stop current audio and clear guide state for clean reload
      pause();
      clearAudioGuide();
      setAudioLanguage(urlAudioLanguage);
    }
  }, [urlAudioLanguage, audioLanguage, setAudioLanguage, pause, clearAudioGuide]);

  // Debug logging for URL parameters and state
  console.log('🔍 AudioGuidePage Debug:');
  console.log('  tourId from URL:', tourId);
  console.log('  stepId from URL:', stepId);
  console.log('  language:', language);
  console.log('  currentGuide:', currentGuide);
  console.log('  currentStep:', currentStep);
  console.log('  steps length:', steps?.length);
  console.log('  isLoading:', isLoading);
  console.log('  error:', error);

  React.useEffect(() => {
    console.log('🔍 AudioGuidePage useEffect #1 triggered:');
    console.log('  tourId:', tourId);
    console.log('  isLoading:', isLoading);
    console.log('  currentGuide:', currentGuide);
    console.log('  currentGuide?.tourCode:', currentGuide?.tourCode);
    console.log('  currentGuide?.currentLanguage:', currentGuide?.currentLanguage);
    console.log('  currentGuide?.audioLanguage:', currentGuide?.audioLanguage);
    console.log('  language:', language);
    console.log('  urlAudioLanguage:', urlAudioLanguage);
    
    // Only load if we have a tourId but either:
    // 1. No guide loaded
    // 2. Wrong tour loaded  
    // 3. Wrong UI language
    // 4. Wrong audio language (this is the key fix)
    const needsToLoad = tourId && !isLoading && 
        (!currentGuide || 
         currentGuide.tourCode !== tourId || 
         currentGuide.currentLanguage !== language ||
         currentGuide.audioLanguage !== urlAudioLanguage);
         
    if (needsToLoad) {
      console.log('🔍 Loading audio guide with tourId:', tourId, 'language:', language, 'audioLanguage:', urlAudioLanguage);
      loadAudioGuide(tourId, language).catch(console.error);
    } else {
      console.log('🔍 Not loading audio guide. Reason:');
      console.log('  - No tourId:', !tourId);
      console.log('  - Is loading:', isLoading);
      console.log('  - Guide already loaded for this tour:', currentGuide?.tourCode === tourId);
      console.log('  - UI Language matches:', currentGuide?.currentLanguage === language);
      console.log('  - Audio Language matches:', currentGuide?.audioLanguage === urlAudioLanguage);
    }
  }, [tourId, currentGuide, isLoading, language, urlAudioLanguage, audioLanguageRefreshKey]); // Add refresh key dependency

  React.useEffect(() => {
    console.log('🔍 AudioGuidePage useEffect #2 triggered:');
    console.log('  stepId:', stepId);
    console.log('  steps:', steps);
    console.log('  currentStepIndex:', currentStepIndex);
    
    // If we have a stepId in the URL and steps are loaded, set the current step
    if (stepId && steps && steps.length > 0) {
      console.log('🔍 Looking for step with ID:', stepId);
      console.log('🔍 Available step IDs:', steps.map(step => step.id));
      
      const targetStepIndex = steps.findIndex(step => step.id.toString() === stepId.toString());
      console.log('🔍 Found step at index:', targetStepIndex);
      
      if (targetStepIndex !== -1) {
        // Always go to the step if found, regardless of current index
        // This ensures the correct step is loaded even if indices match
        console.log('🔍 Going to step index:', targetStepIndex);
        goToStep(targetStepIndex);
        
        // Track step view
        trackEvent('audio_step_view', {
          category: 'Audio Guide',
          label: `${tourId}-step-${stepId}`,
          tour_id: tourId,
          step_id: stepId,
          step_index: targetStepIndex,
          audio_language: urlAudioLanguage
        });
      }
    }
  }, [stepId, steps, currentStepIndex]); // Removed goToStep to prevent infinite loop

  // Refresh current step when audio language changes
  React.useEffect(() => {
    // Wait for tour data to be reloaded with new audio language, then refresh current step
    if (stepId && steps && steps.length > 0 && currentGuide && 
        currentGuide.audioLanguage === urlAudioLanguage) {
      console.log('🔍 AudioGuidePage checking if step needs refresh after tour reload:', {
        stepId,
        hasSteps: steps.length > 0,
        guideAudioLang: currentGuide.audioLanguage,
        urlAudioLang: urlAudioLanguage,
        currentStepId: currentStep?.id
      });
      
      // Find the target step again and go to it to refresh with new audio language
      const targetStepIndex = steps.findIndex(step => step.id.toString() === stepId.toString());
      if (targetStepIndex !== -1 && targetStepIndex !== currentStepIndex) {
        console.log('🔍 AudioGuidePage re-going to step after tour reload:', targetStepIndex);
        goToStep(targetStepIndex);
      }
    }
  }, [stepId, steps, currentGuide, urlAudioLanguage, currentStep, currentStepIndex, goToStep]);

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
