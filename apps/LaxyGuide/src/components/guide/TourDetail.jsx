import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material';
import { Paid, AccessTime, LocationOn } from '@mui/icons-material';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAudioGuide } from '../../context/AudioGuideContext.jsx';
import { getPOIDetails } from '../../utils/poiGuideService.js';

// S3 Base URL configuration for tour content
const getS3BaseUrl = (legacyTourCode) => {
  return `https://s3.ap-northeast-1.amazonaws.com/laxy.travel.staging/tours/${legacyTourCode}/`;
};

// Common styles
const commonStyles = {
  container: {
    maxWidth: 1280,
    mx: 'auto',
    p: 0,
    bgcolor: '#000000',
    minHeight: '100vh',
  },
  image: {
    height: '400px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    zIndex: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.8) 100%)',
      zIndex: 1,
    },
  },
  card: {
    position: 'relative',
    top: '-20px',
    borderRadius: '16px 16px 0 0',
    p: 2,
    pb: 10,
    bgcolor: '#000000',
    color: '#ffffff',
    zIndex: 2,
    boxShadow: '0 -2px 8px rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  footerCard: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    bgcolor: '#000000',
    color: '#ffffff',
    p: 2,
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    zIndex: 3,
  },
  buyButton: {
    backgroundColor: '#46B2BB',
    color: '#F5F5F5',
    borderRadius: '50px',
    px: 4,
    py: 1.5,
    textTransform: 'none',
    fontSize: '1rem',
    '&:hover': {
      backgroundColor: '#3a9199',
    },
  },
  iconText: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 1,
    color: '#ffffff',
  },
};

function TourDetail() {
  const { langCode, tourId } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { loadAudioGuide } = useAudioGuide();
  
  const [tourData, setTourData] = useState(null);
  const [poiData, setPoiData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTourDetailData();
  }, [tourId, language]);

  const loadTourDetailData = async () => {
    try {
      // Load the audio guide data to get tour information
      await loadAudioGuide(tourId, language);
      
      // Load tour index data
      const s3BaseUrl = getS3BaseUrl(tourId);
      const indexResponse = await fetch(`${s3BaseUrl}index.json`);
      if (!indexResponse.ok) {
        throw new Error('Failed to load tour details');
      }
      const indexData = await indexResponse.json();
      setTourData(indexData);
      
    } catch (error) {
      console.error('Failed to load tour details:', error);
      setError('Failed to load tour details');
    }
  };

  const handleBuyNow = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/${langCode}/tour/${tourId}/steps`);
    }, 1500);
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#000000', minHeight: '100vh', color: '#ffffff' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ color: '#ffffff', borderColor: '#ffffff' }}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!tourData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#000000', minHeight: '100vh', color: '#ffffff' }}>
        <Typography variant="body2">Loading tour details...</Typography>
      </Box>
    );
  }

  // Get the current language or fallback
  const currentLang = langCode || language || tourData.currentLanguage || tourData.languages?.[0] || 'eng';
  const fallbackLang = tourData.languages?.[0] || 'eng';
  
  // Get localized content
  const title = tourData.title?.[currentLang] || tourData.title?.[fallbackLang] || 'Unnamed Tour';
  const description = tourData.description?.[currentLang] || tourData.description?.[fallbackLang] || 'No description available';
  const venue = tourData.venue?.[currentLang] || tourData.venue?.[fallbackLang] || 'Venue not specified';
  
  // Construct image URL
  const s3BaseUrl = getS3BaseUrl(tourId);
  const imageUrl = tourData.image?.[currentLang]
    ? `${s3BaseUrl}${tourData.image[currentLang]}`
    : tourData.image?.[fallbackLang]
    ? `${s3BaseUrl}${tourData.image[fallbackLang]}`
    : 'https://via.placeholder.com/400x200?text=No+Image+Available';

  // Calculate estimated duration (placeholder logic)
  const estimatedDuration = tourData.estimatedDuration || '45-60 minutes';
  const totalPrice = tourData.price || '0';

  return (
    <>
      <Box sx={commonStyles.container}>
        {/* Header Image */}
        <Box
          sx={{
            ...commonStyles.image,
            backgroundImage: `url(${imageUrl})`,
          }}
        />

        {/* Content Card */}
        <Paper sx={commonStyles.card}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#ffffff' }}>
            {title}
          </Typography>

          <Box sx={commonStyles.iconText}>
            <LocationOn sx={{ color: '#46B2BB' }} />
            <Typography variant="body2" sx={{ color: '#ffffff' }}>{venue}</Typography>
          </Box>

          <Box sx={commonStyles.iconText}>
            <AccessTime sx={{ color: '#46B2BB' }} />
            <Typography variant="body2" sx={{ color: '#ffffff' }}>{estimatedDuration}</Typography>
          </Box>

          <Box sx={commonStyles.iconText}>
            <Paid sx={{ color: '#46B2BB' }} />
            <Typography variant="body2" sx={{ color: '#ffffff' }}>USD ${totalPrice}</Typography>
          </Box>

          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 'bold', color: '#ffffff' }}>
            About This Tour
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 3, color: '#ffffff' }}>
            {description}
          </Typography>

          {/* Additional tour information can be added here */}
        </Paper>

        {/* Floating Footer with Total Price and Buy Now Button */}
        <Paper sx={commonStyles.footerCard}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ffffff', fontSize: '1.5rem' }}>
              USD ${totalPrice}
            </Typography>
            <Button
              variant="contained"
              sx={commonStyles.buyButton}
              onClick={handleBuyNow}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Start Tour'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
}

export default TourDetail;
