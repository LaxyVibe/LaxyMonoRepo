import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CardMedia, 
  CircularProgress, 
  Button, 
  IconButton,
  List,
  ListItem,
  ListItemText 
} from '@mui/material';
import { PlayArrow, AccessTime, ArrowBack } from '@mui/icons-material';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAudioGuide } from '../../context/AudioGuideContext.jsx';
import { extractTextAndAudioLanguageFromPath, getValidAudioLanguageCode } from '../../utils/languageUtils.js';
import { trackEvent, trackButtonClick, trackNavigation } from '../../utils/analytics.js';

// S3 Base URL configuration for tour content
const getS3BaseUrl = (legacyTourCode) => {
  return `https://s3.ap-northeast-1.amazonaws.com/laxy.travel.staging/tours/${legacyTourCode}/`;
};

// Common styles
const commonStyles = {
  container: {
    p: 2,
    maxWidth: 1280,
    mx: 'auto',
    pb: 10, // Add padding-bottom to prevent overlap with the fixed footer (if any)
    pt: 2 // Reduced top padding since header is simpler
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    mb: 2,
    py: 1,
  },
  backButton: {
    mr: 2,
    color: '#46B2BB',
    '&:hover': {
      backgroundColor: 'rgba(70, 178, 187, 0.1)',
    },
  },
  headerTitle: {
    fontWeight: 600,
    fontSize: '18px',
    color: '#333',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '24px',
    mb: 3,
    color: '#333',
    textAlign: 'center',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    py: 1.5, // Increased padding for better spacing
    px: 0,
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(70, 178, 187, 0.1)',
    },
  },
  stepNumberContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mr: 2,
    position: 'relative',
    minWidth: 32,
  },
  stepNumber: {
    color: '#46B2BB',
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    zIndex: 1,
  },
  verticalLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E0E0E0',
    mt: 1,
  },
  stepImage: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    mr: 2,
    objectFit: 'cover',
  },
  stepContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: 400,
    fontSize: '16px',
    color: '#212427',
    fontFamily: 'Commissioner, sans-serif',
    mb: 0.5,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '200px',
  },
  stepDuration: {
    fontSize: '14px',
    color: '#666',
  },
  playIcon: {
    color: '#46B2BB',
    fontSize: '25px',
    width: '25px',
    height: '25px',
    margin: 2
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
};

function StepList() {
  const { langCode, tourId, audioLang } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { tourData, steps, tourTitle, loadAudioGuide, isLoading, currentStep, audioLanguage, audioLanguageRefreshKey, setAudioLanguage } = useAudioGuide();
  
  const [error, setError] = useState(null);

  // Extract audio language from URL or use default
  const { audioLangCode } = extractTextAndAudioLanguageFromPath(window.location.pathname);
  const urlAudioLanguage = getValidAudioLanguageCode(audioLang || audioLangCode);

  // Set audio language immediately on component mount if it's different
  React.useLayoutEffect(() => {
    if (urlAudioLanguage !== audioLanguage) {
      console.log('🔍 StepList setting audio language immediately:', urlAudioLanguage);
      setAudioLanguage(urlAudioLanguage);
    }
  }, []); // Only run once on mount

  // Monitor audio language changes from URL
  useEffect(() => {
    if (urlAudioLanguage !== audioLanguage) {
      console.log('🔍 StepList updating audio language:', urlAudioLanguage);
      setAudioLanguage(urlAudioLanguage);
    }
  }, [urlAudioLanguage, audioLanguage, setAudioLanguage]);

  const loadTourData = useCallback(async () => {
    try {
      console.log('🔍 StepList loadTourData called with audioLanguage:', audioLanguage);
      // Pass the UI text language to loadAudioGuide, but audio language is already set in context
      // The AudioGuideContext will use the audioLanguage from context for step content extraction
      await loadAudioGuide(tourId, language);
    } catch (error) {
      console.error('Failed to load tour data:', error);
      setError('Failed to load tour steps');
    }
  }, [loadAudioGuide, tourId, language, audioLanguage, audioLanguageRefreshKey]); // Add refresh key dependency

  useEffect(() => {
    // Only load tour data when audio language is properly synced with URL
    const isAudioLanguageSynced = audioLanguage === urlAudioLanguage;
    const needsToLoad = !tourData || 
                       tourData.tourCode !== tourId ||
                       tourData.audioLanguage !== urlAudioLanguage; // Also check if guide was loaded with different audio language
    
    if (isAudioLanguageSynced && needsToLoad) {
      console.log('🔍 StepList loading tour data with synced audio language:', { 
        tourId, 
        language, 
        audioLanguage, 
        urlAudioLanguage,
        guideAudioLanguage: tourData?.audioLanguage,
        reason: !tourData ? 'no tour data' : 
                tourData.tourCode !== tourId ? 'tour changed' : 
                'audio language changed'
      });
      loadTourData();
      
      // Track step list view
      trackEvent('step_list_view', {
        category: 'Content',
        label: `${tourId}-steps`,
        tour_id: tourId,
        audio_language: urlAudioLanguage,
        text_language: language
      });
    } else {
      console.log('🔍 StepList waiting for sync or no need to load:', {
        isAudioLanguageSynced,
        needsToLoad,
        audioLanguage,
        urlAudioLanguage,
        guideAudioLanguage: tourData?.audioLanguage
      });
    }
  }, [tourId, language, audioLanguage, urlAudioLanguage, audioLanguageRefreshKey, loadTourData, tourData]);

  const handleStepClick = (step) => {
    // Track step click
    trackEvent('step_list_item_click', {
      category: 'Navigation',
      label: `${tourId}-step-${step.id}`,
      tour_id: tourId,
      step_id: step.id,
      audio_language: urlAudioLanguage
    });
    trackNavigation('Step List', 'Audio Guide Step', 'step_click');

    // Decide destination: content page if step has content, otherwise audio guide page
    const hasContent = (() => {
      const raw = step?.content;
      if (!raw) return false;
      if (typeof raw !== 'string') return !!raw; // treat non-string truthy as having content
      const text = raw
        .replace(/<[^>]*>/g, ' ') // strip HTML tags
        .replace(/&nbsp;/gi, ' ') // replace nbsp
        .trim();
      return text.length > 0;
    })();

    const base = `/${langCode}/tour/${tourId}/${urlAudioLanguage}/step/${step.id}`;
    navigate(hasContent ? `${base}/content` : base);
  };

  const handleGoBack = () => {
    trackButtonClick('Back to Tour', 'step-list');
    trackNavigation('Step List', 'Tour Cover', 'back_button');
    navigate(`/${langCode}/tour/${tourId}`);
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (isLoading || !tourData) {
    return (
      <Box sx={commonStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  const currentLang = langCode || language || tourData.currentLanguage || tourData.languages?.[0] || 'eng';
  const fallbackLang = tourData.languages?.[0] || 'eng';
  
  // Extract title with proper fallback logic and debugging
  let title = 'Tour Steps';
  
  console.log('StepList title extraction debug:', {
    tourTitle,
    tourTitleType: typeof tourTitle,
    tourDataGuideTitle: tourData.guide?.title,
    tourDataGuideTitleType: typeof tourData.guide?.title,
    currentLang,
    fallbackLang
  });
  
  if (tourTitle) {
    if (typeof tourTitle === 'string') {
      title = tourTitle;
    } else if (typeof tourTitle === 'object' && tourTitle !== null) {
      title = tourTitle[currentLang] || tourTitle[fallbackLang] || tourTitle[Object.keys(tourTitle)[0]] || 'Tour Steps';
    }
  } else if (tourData.guide?.title) {
    const guideTitle = tourData.guide.title;
    if (typeof guideTitle === 'string') {
      title = guideTitle;
    } else if (typeof guideTitle === 'object' && guideTitle !== null) {
      title = guideTitle[currentLang] || guideTitle[fallbackLang] || guideTitle[Object.keys(guideTitle)[0]] || 'Tour Steps';
    }
  }
  
  // Ensure title is always a string (final safety check)
  if (typeof title !== 'string') {
    console.warn('Title is not a string after extraction:', title);
    title = 'Tour Steps';
  }

  // S3 base URL for images
  const s3BaseUrl = getS3BaseUrl(tourId);

  return (
    <>
      <Box sx={commonStyles.container}>
        <Box sx={commonStyles.header}>
          <IconButton
            onClick={handleGoBack}
            sx={commonStyles.backButton}
          >
            <ArrowBack />
          </IconButton>
          <Typography sx={commonStyles.headerTitle}>
            Audio List
          </Typography>
        </Box>

        <Typography sx={commonStyles.title}>
          {title}
        </Typography>

        <List>
          {steps.map((step, index) => {
            // Get the image URL for this step
            // Handle both legacy string format and new object format for images
            const getImageUrl = () => {
              if (!step.images || step.images.length === 0) {
                return 'https://via.placeholder.com/60x60?text=Step';
              }
              
              const firstImage = step.images[0];
              
              // Check if it's the new object format with url property
              if (typeof firstImage === 'object' && firstImage.url) {
                return firstImage.url.startsWith('http') ? firstImage.url : `${s3BaseUrl}${firstImage.url}`;
              }
              
              // Legacy string format
              if (typeof firstImage === 'string') {
                return firstImage.startsWith('http') ? firstImage : `${s3BaseUrl}${firstImage}`;
              }
              
              return 'https://via.placeholder.com/60x60?text=Step';
            };
            
            const imageUrl = getImageUrl();

            // Ensure title and subtitle are strings, not objects
            const stepTitle = typeof step.title === 'object' 
              ? (step.title[currentLang] || step.title[fallbackLang] || step.title[Object.keys(step.title)[0]] || 'Untitled Step')
              : (step.title || 'Untitled Step');

            // Format step number with leading zero
            const stepNumber = String(step.order || index + 1).padStart(2, '0');

            // Check if this step is currently playing
            const isCurrentlyPlaying = currentStep && currentStep.id === step.id;

            return (
              <ListItem
                key={step.id}
                onClick={() => handleStepClick(step)}
                sx={{
                  ...commonStyles.listItem,
                  backgroundColor: isCurrentlyPlaying ? 'rgba(70, 178, 187, 0.1)' : 'transparent',
                }}
              >
                <Box sx={commonStyles.stepNumberContainer}>
                  <Box sx={{
                    ...commonStyles.stepNumber,
                    color: isCurrentlyPlaying ? '#46B2BB' : '#46B2BB'
                  }}>
                    {stepNumber}
                  </Box>
                  {index < steps.length - 1 && (
                    <Box sx={commonStyles.verticalLine} />
                  )}
                </Box>
                
                <CardMedia
                  component="img"
                  sx={commonStyles.stepImage}
                  image={imageUrl}
                  alt={stepTitle}
                />
                
                <ListItemText
                  primary={
                    <Typography sx={{
                      ...commonStyles.stepTitle,
                      color: isCurrentlyPlaying ? '#46B2BB' : '#212427'
                    }}>
                      {stepTitle}
                    </Typography>
                  }
                  secondary={
                    step.duration && (
                      <Typography sx={commonStyles.stepDuration}>
                        {step.duration}
                      </Typography>
                    )
                  }
                />
                
                <PlayArrow sx={commonStyles.playIcon} />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </>
  );
}

export default StepList;
