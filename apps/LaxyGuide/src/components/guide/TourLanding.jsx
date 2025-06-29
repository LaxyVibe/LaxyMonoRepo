import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Snackbar } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getPOIDetails } from '../../utils/poiGuideService.js';
import { useAudioGuide } from '../../context/AudioGuideContext.jsx';
import AudioLanguageSelector from '../audioGuide/AudioLanguageSelector.jsx';

// S3 Base URL configuration for tour content
const getS3BaseUrl = (legacyTourCode) => {
  return `https://s3.ap-northeast-1.amazonaws.com/laxy.travel.staging/tours/${legacyTourCode}/`;
};

// Common styles
const commonStyles = {
  container: {
    minHeight: '100vh',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    textAlign: 'center',
    color: 'white',
    zIndex: 2,
    px: 2,
    pb: 2,
  },
  title: {
    textAlign: 'center',
    textTransform: 'uppercase',
    mb: 2,
  },
  subtitle: {
    mb: 4,
  },
  button: {
    borderRadius: '50px',
    px: 4,
    py: 1,
    textTransform: 'none',
    fontSize: '1rem',
  },
  audioButton: {
    backgroundColor: '#FFFFFF',
    color: '#805858',
    borderColor: 'white',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: 'white',
    },
  },
  startButton: {
    backgroundColor: '#46B2BB',
    color: '#F5F5F5',
    '&:hover': {
      backgroundColor: '#3a9199',
    },
  },
  snackbar: {
    '& .MuiSnackbarContent-root': {
      backgroundColor: '#4dd0e1',
      color: 'white',
    },
  },
};

function TourLanding() {
  const { langCode, poiSlug } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { loadAudioGuide, isLoading, audioLanguage } = useAudioGuide();
  
  const [poiData, setPoiData] = useState(null);
  const [tourData, setTourData] = useState(null);
  const [error, setError] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [audioLanguageDialogOpen, setAudioLanguageDialogOpen] = useState(false);

  useEffect(() => {
    loadTourLandingData();
  }, [poiSlug, language]);

  const loadTourLandingData = async () => {
    try {
      // Load POI data to get the legacyTourCode
      const poiItem = await getPOIDetails(poiSlug, language);
      if (!poiItem) {
        setError('POI not found');
        return;
      }
      
      setPoiData(poiItem);
      
      if (!poiItem.legacyTourCode) {
        setError('Legacy tour code not found for this POI');
        return;
      }

      // Fetch tour data from S3
      const s3BaseUrl = getS3BaseUrl(poiItem.legacyTourCode);
      const indexRes = await fetch(`${s3BaseUrl}index.json`);
      
      if (!indexRes.ok) {
        throw new Error('Failed to fetch tour data from S3');
      }
      
      const tourIndex = await indexRes.json();
      setTourData(tourIndex);
      
    } catch (err) {
      console.error('Error loading tour landing data:', err);
      setError(`Error loading tour data: ${err.message}`);
    }
  };

  const handleStartTour = async () => {
    if (!poiData?.legacyTourCode) return;

    // Navigate to the tour details page
    navigate(`/${langCode}/tour/${poiData.legacyTourCode}/details`);
  };

  const handleAudioSetting = () => {
    setAudioLanguageDialogOpen(true);
  };

  const handleAudioLanguageDialogClose = () => {
    setAudioLanguageDialogOpen(false);
  };

  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastOpen(false);
  };

  const handleBackToPOI = () => {
    navigate(`/${langCode}/poi/${poiSlug}`);
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant="outlined" onClick={handleBackToPOI}>
          View POI Details Instead
        </Button>
      </Box>
    );
  }

  if (!poiData || !tourData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2">Loading tour...</Typography>
      </Box>
    );
  }

  // Get the current language or fallback
  const currentLang = langCode || language || tourData.currentLanguage || tourData.languages?.[0] || 'eng';
  const fallbackLang = tourData.languages?.[0] || 'eng';
  
  // Get available audio languages from tour data
  const availableAudioLanguages = tourData.languages || ['eng'];
  
  // Get localized content
  const title = tourData.title?.[currentLang] || tourData.title?.[fallbackLang] || poiData.poi?.label || 'Unnamed Tour';
  const venue = tourData.venue?.[currentLang] || tourData.venue?.[fallbackLang] || poiData.poi?.address || 'Venue not specified';
  
  // Construct image URL
  const s3BaseUrl = getS3BaseUrl(poiData.legacyTourCode);
  const imageUrl = tourData.image?.[currentLang]
    ? `${s3BaseUrl}${tourData.image[currentLang]}`
    : tourData.image?.[fallbackLang]
    ? `${s3BaseUrl}${tourData.image[fallbackLang]}`
    : poiData.poi?.coverPhoto?.url || 'https://via.placeholder.com/400x200?text=No+Image+Available';

  return (
    <Box
      sx={{
        ...commonStyles.container,
        backgroundImage: `url(${imageUrl})`,
      }}
    >
      <Box sx={commonStyles.overlay} />
      
      {/* Back button */}
      <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBackToPOI}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'white',
            },
          }}
        >
          ← Back to POI
        </Button>
      </Box>

      <Box sx={commonStyles.content}>
        <Typography variant="h2" sx={commonStyles.title}>
          {title}
        </Typography>
        <Typography variant="body2" sx={commonStyles.subtitle}>
          {venue}
        </Typography>
      </Box>
      
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          pb: 4,
          zIndex: 2,
        }}
      >
        <Button
          variant="outlined"
          sx={{ ...commonStyles.button, ...commonStyles.audioButton }}
          onClick={handleAudioSetting}
        >
          Audio: {audioLanguage.toUpperCase()}
        </Button>
        <Button
          variant="contained"
          sx={{ ...commonStyles.button, ...commonStyles.startButton }}
          onClick={handleStartTour}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Start Tour'}
        </Button>
      </Box>
      
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={handleToastClose}
        message="Coming Soon..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={commonStyles.snackbar}
      />
      
      {/* Audio Language Selector Dialog */}
      <AudioLanguageSelector
        open={audioLanguageDialogOpen}
        onClose={handleAudioLanguageDialogClose}
        availableLanguages={availableAudioLanguages}
      />
    </Box>
  );
}

export default TourLanding;
