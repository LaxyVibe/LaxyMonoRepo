import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAudioGuide } from '../../context/AudioGuideContext.jsx';
import AudioGuidePlayer from './AudioGuidePlayer.jsx';

/**
 * Full-screen audio guide page component
 * Displays the complete audio guide player interface
 */
export default function AudioGuidePage() {
  const { tourId, stepId } = useParams();
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
    goToStep
  } = useAudioGuide();

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
    console.log('  language:', language);
    
    // Only load if we have a tourId but either no guide loaded or wrong tour loaded
    if (tourId && !isLoading && 
        (!currentGuide || currentGuide.tourCode !== tourId || currentGuide.currentLanguage !== language)) {
      console.log('🔍 Loading audio guide with tourId:', tourId, 'language:', language);
      loadAudioGuide(tourId, language).catch(console.error);
    } else {
      console.log('🔍 Not loading audio guide. Reason:');
      console.log('  - No tourId:', !tourId);
      console.log('  - Is loading:', isLoading);
      console.log('  - Guide already loaded for this tour:', currentGuide?.tourCode === tourId);
      console.log('  - Language matches:', currentGuide?.currentLanguage === language);
    }
  }, [tourId, currentGuide, isLoading, language]); // Check currentGuide.tourCode for proper comparison

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
      }
    }
  }, [stepId, steps, currentStepIndex]); // Removed goToStep to prevent infinite loop

  const handleBackClick = () => {
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        px: 2,
        py: 1.5,
        display: 'flex',
        alignItems: 'center'
      }}>
        <IconButton 
          onClick={handleBackClick}
          sx={{ 
            mr: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' }
          }}
          aria-label="Go back to tour details"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          Back to tour details
        </Typography>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AudioGuidePlayer />
      </Box>
    </Box>
  );
}
