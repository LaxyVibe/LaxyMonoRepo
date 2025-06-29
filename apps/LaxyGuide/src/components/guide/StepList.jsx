import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardMedia, CircularProgress, Button } from '@mui/material';
import { PlayArrow, AccessTime } from '@mui/icons-material';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAudioGuide } from '../../context/AudioGuideContext.jsx';

// S3 Base URL configuration for tour content
const getS3BaseUrl = (legacyTourCode) => {
  return `https://s3.ap-northeast-1.amazonaws.com/laxy.travel.staging/tours/${legacyTourCode}/`;
};

// Common styles
const commonStyles = {
  container: {
    maxWidth: 1280,
    mx: 'auto',
    p: 2,
    pb: 10, // Add padding-bottom for fixed header
  },
  header: {
    textAlign: 'center',
    mb: 3,
  },
  stepCard: {
    mb: 2,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  },
  stepContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  stepImage: {
    width: 80,
    height: 80,
    borderRadius: 2,
  },
  stepText: {
    flex: 1,
  },
  stepNumber: {
    backgroundColor: '#46B2BB',
    color: 'white',
    borderRadius: '50%',
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 'bold',
  },
  playIcon: {
    color: '#46B2BB',
    fontSize: '2rem',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
};

function StepList() {
  const { langCode, tourId } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { tourData, steps, tourTitle, loadAudioGuide, isLoading } = useAudioGuide();
  
  const [error, setError] = useState(null);

  const loadTourData = useCallback(async () => {
    try {
      await loadAudioGuide(tourId, language);
    } catch (error) {
      console.error('Failed to load tour data:', error);
      setError('Failed to load tour steps');
    }
  }, [loadAudioGuide, tourId, language]);

  useEffect(() => {
    // Only load if we don't have tourData or if the tourId has changed
    if (!tourData || tourData.tourCode !== tourId) {
      loadTourData();
    }
  }, [tourId, language, loadTourData, tourData]);

  const handleStepClick = (step) => {
    navigate(`/${langCode}/tour/${tourId}/step/${step.id}`);
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
    <Box sx={commonStyles.container}>
      <Box sx={commonStyles.header}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {steps.length} steps • Tap to start listening
        </Typography>
      </Box>

      {steps.map((step, index) => {
        // Get the image URL for this step
        // Handle both legacy string format and new object format for images
        const getImageUrl = () => {
          if (!step.images || step.images.length === 0) {
            return 'https://via.placeholder.com/80x80?text=Step';
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
          
          return 'https://via.placeholder.com/80x80?text=Step';
        };
        
        const imageUrl = getImageUrl();

        // Ensure title and subtitle are strings, not objects
        const stepTitle = typeof step.title === 'object' 
          ? (step.title[currentLang] || step.title[fallbackLang] || step.title[Object.keys(step.title)[0]] || 'Untitled Step')
          : (step.title || 'Untitled Step');
        
        const stepSubtitle = typeof step.subtitle === 'object'
          ? (step.subtitle[currentLang] || step.subtitle[fallbackLang] || step.subtitle[Object.keys(step.subtitle)[0]] || '')
          : (step.subtitle || step.description || '');

        return (
          <Card 
            key={step.id} 
            sx={commonStyles.stepCard}
            onClick={() => handleStepClick(step)}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={commonStyles.stepContent}>
                <Box sx={commonStyles.stepNumber}>
                  {step.order || index + 1}
                </Box>
                
                <CardMedia
                  component="img"
                  sx={commonStyles.stepImage}
                  image={imageUrl}
                  alt={stepTitle}
                />
                
                <Box sx={commonStyles.stepText}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {stepTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {stepSubtitle}
                  </Typography>
                  {step.duration && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTime sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {step.duration}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <PlayArrow sx={commonStyles.playIcon} />
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

export default StepList;
