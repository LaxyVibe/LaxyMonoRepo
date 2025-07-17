import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Snackbar, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getPOIDetails } from '../../utils/poiGuideService.js';
import { useAudioGuide } from '../../context/AudioGuideContext.jsx';
import { travelLogo, getCurrentLanguages, mapTextToAudioLanguage } from '@laxy/components';
import { getHubConfigByLanguage } from '../../mocks/guide-application-config/index.js';
import { getValidAudioLanguageCode } from '../../utils/languageUtils.js';

// S3 Base URL configuration for tour content
const getS3BaseUrl = (legacyTourCode) => {
  return `https://s3.ap-northeast-1.amazonaws.com/laxy.travel.staging/tours/${legacyTourCode}/`;
};

// Audio language options with display names
const AUDIO_LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'jpn', label: '日本語' },
  { code: 'kor', label: '한국어' },
  { code: 'cmn', label: '國語' }
];

// Common styles
const commonStyles = {
  container: {
    height: '100vh',
    maxHeight: '100vh',
    overflow: 'hidden',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    '@supports (height: 100dvh)': {
      height: '100dvh',
      maxHeight: '100dvh',
    },
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.8) 80%, rgba(0, 0, 0, 0.8) 100%)',
    zIndex: 1,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: 'white',
    zIndex: 2,
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 1, sm: 2 },
    minHeight: 0,
  },
  title: {
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: { xs: '20px', sm: '24px', md: '26px' },
    fontFamily: 'Commissioner',
    fontWeight: 700,
    mb: { xs: 1, sm: 2, md: 3 },
    lineHeight: 1.2,
    '@media (max-height: 700px)': {
      fontSize: { xs: '18px', sm: '22px', md: '24px' },
      mb: { xs: 0.75, sm: 1.5, md: 2.5 },
    },
    '@media (max-height: 600px)': {
      fontSize: { xs: '16px', sm: '20px', md: '22px' },
      mb: { xs: 0.5, sm: 1, md: 2 },
    },
    '@media (max-height: 500px)': {
      fontSize: { xs: '14px', sm: '18px', md: '20px' },
      mb: { xs: 0.25, sm: 0.75, md: 1.5 },
    },
  },
  jpnTitle: {
    textAlign: 'center',
    mb: { xs: 0.5, sm: 1, md: 1.5 },
    fontSize: { xs: '0.75rem', sm: '1rem', md: '1.375rem' },
    opacity: 0.9,
    lineHeight: 1.2,
    '@media (max-height: 700px)': {
      fontSize: { xs: '0.6875rem', sm: '0.875rem', md: '1.25rem' },
      mb: { xs: 0.375, sm: 0.75, md: 1.25 },
    },
    '@media (max-height: 600px)': {
      fontSize: { xs: '0.625rem', sm: '0.75rem', md: '1.125rem' },
      mb: { xs: 0.25, sm: 0.5, md: 1 },
    },
    '@media (max-height: 500px)': {
      fontSize: { xs: '0.5625rem', sm: '0.6875rem', md: '1rem' },
      mb: { xs: 0.125, sm: 0.25, md: 0.75 },
    },
  },
  subtitle: {
    mb: { xs: 1, sm: 1.5, md: 2 },
    fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' },
    px: { xs: 0.5, sm: 1 },
    lineHeight: 1.3,
    '@media (max-height: 700px)': {
      fontSize: { xs: '0.625rem', sm: '0.6875rem', md: '0.8125rem' },
      mb: { xs: 0.75, sm: 1.25, md: 1.75 },
    },
    '@media (max-height: 600px)': {
      fontSize: { xs: '0.5625rem', sm: '0.625rem', md: '0.75rem' },
      mb: { xs: 0.5, sm: 1, md: 1.5 },
    },
    '@media (max-height: 500px)': {
      fontSize: { xs: '0.5rem', sm: '0.5625rem', md: '0.6875rem' },
      mb: { xs: 0.25, sm: 0.75, md: 1.25 },
    },
  },
  button: {
    borderRadius: '50px',
    px: { xs: 2, sm: 2.5, md: 3.5 },
    py: { xs: 0.5, sm: 0.75, md: 1.25 },
    textTransform: 'none',
    fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' },
    minHeight: { xs: '40px', sm: '44px', md: '48px' },
    '@media (max-height: 600px)': {
      minHeight: { xs: '36px', sm: '40px', md: '44px' },
      py: { xs: 0.375, sm: 0.5, md: 0.75 },
    },
    '@media (max-height: 500px)': {
      minHeight: { xs: '32px', sm: '36px', md: '40px' },
      py: { xs: 0.25, sm: 0.375, md: 0.5 },
    },
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
  audioSelect: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50px',
    minHeight: { xs: '40px', sm: '44px', md: '48px' },
    '& .MuiOutlinedInput-root': {
      borderRadius: '50px',
      paddingTop: '8px', // Add space for the label
      minHeight: { xs: '40px', sm: '44px', md: '48px' },
      '& fieldset': {
        borderColor: 'white',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'white',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#805858',
      backgroundColor: 'transparent',
      fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' },
      '&.Mui-focused': {
        color: '#805858',
      },
      '&.MuiInputLabel-shrink': {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '0 8px',
        transform: 'translate(14px, -9px) scale(0.75)',
      },
    },
    '& .MuiSelect-select': {
      color: '#805858',
      padding: { xs: '6px 10px', sm: '8px 12px', md: '10px 14px' },
      fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' },
    },
    '@media (max-height: 600px)': {
      minHeight: { xs: '36px', sm: '40px', md: '44px' },
      '& .MuiOutlinedInput-root': {
        minHeight: { xs: '36px', sm: '40px', md: '44px' },
      },
      '& .MuiSelect-select': {
        padding: { xs: '4px 8px', sm: '6px 10px', md: '8px 12px' },
      },
    },
    '@media (max-height: 500px)': {
      minHeight: { xs: '32px', sm: '36px', md: '40px' },
      '& .MuiOutlinedInput-root': {
        minHeight: { xs: '32px', sm: '36px', md: '40px' },
      },
      '& .MuiSelect-select': {
        padding: { xs: '2px 6px', sm: '4px 8px', md: '6px 10px' },
      },
    },
  },
  snackbar: {
    '& .MuiSnackbarContent-root': {
      backgroundColor: '#4dd0e1',
      color: 'white',
    },
  },
};

function POICover() {
  const { langCode, poiSlug } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { loadAudioGuide, isLoading, audioLanguage, audioLanguageRefreshKey, setAudioLanguage, clearAudioGuide, pause } = useAudioGuide();
  
  const [poiData, setPoiData] = useState(null);
  const [tourData, setTourData] = useState(null);
  const [error, setError] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);

  // Get current languages based on URL langCode
  const { currentTextLanguage, currentAudioLanguage } = getCurrentLanguages(langCode);
  
  // For POICover, similar to TourCover, use reactive audio language state
  const defaultAudioLanguage = getValidAudioLanguageCode(currentAudioLanguage);
  
  // State for currently selected audio language (for the dropdown)
  // Initialize with the actual audio language from context, not just the default
  const [selectedAudioLanguage, setSelectedAudioLanguage] = useState(() => {
    const currentAudioLang = audioLanguage || defaultAudioLanguage;
    console.log('🔍 POICover initializing selectedAudioLanguage with:', currentAudioLang);
    return currentAudioLang;
  });

  useEffect(() => {
    loadPOICoverData();
  }, [poiSlug, currentTextLanguage]);

  // Sync the dropdown with the actual audio language from context
  // This ensures the dropdown always shows the current audio language
  useEffect(() => {
    console.log('🔍 POICover syncing dropdown with context audioLanguage:', audioLanguage);
    if (audioLanguage && audioLanguage !== selectedAudioLanguage) {
      setSelectedAudioLanguage(audioLanguage);
    }
  }, [audioLanguage, selectedAudioLanguage]);

  // Initialize audio language if not set (fallback to default)
  useEffect(() => {
    if (!audioLanguage) {
      console.log('🔍 POICover initializing audio language with default:', defaultAudioLanguage);
      setAudioLanguage(defaultAudioLanguage);
      setSelectedAudioLanguage(defaultAudioLanguage);
    }
  }, [audioLanguage, defaultAudioLanguage, setAudioLanguage]);

  const loadPOICoverData = async () => {
    try {
      // Load POI data to get the legacyTourCode
      const poiItem = await getPOIDetails(poiSlug, currentTextLanguage);
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

    // Navigate to the step AudioGuide directly using currentTextLanguage for URL and selectedAudioLanguage for audio
    navigate(`/${currentTextLanguage}/poi/${poiSlug}/tour/${poiData.legacyTourCode}/step/${poiData.legacyTourCode}-0001`);
  };

  const handleAudioLanguageChange = (event) => {
    const newAudioLang = event.target.value;
    const currentDropdownLang = selectedAudioLanguage;
    const currentContextLang = audioLanguage;
    console.log('🔍 POICover Audio language change event:');
    console.log('  From dropdown state:', currentDropdownLang);
    console.log('  From context:', currentContextLang);
    console.log('  To:', newAudioLang);
    console.log('  Is same as dropdown?', currentDropdownLang === newAudioLang);
    console.log('  Is same as context?', currentContextLang === newAudioLang);
    
    // Always stop current audio and clear audio guide state to force clean reload
    // This ensures that even if the user selects the same language, we refresh the content
    pause();
    clearAudioGuide();
    
    // Force update the selected language state
    setSelectedAudioLanguage(newAudioLang);
    
    // Always set the audio language with force refresh flag
    // This ensures that even if the user selects the same language, we refresh the content
    setAudioLanguage(newAudioLang, true); // Force refresh = true
    
    console.log('🔍 POICover Audio content cleared and language set to:', newAudioLang);
  };

  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastOpen(false);
  };

  const handleBackToPOI = () => {
    navigate(`/${currentTextLanguage}/poi/${poiSlug}`);
  };

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
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
      <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
        <Typography variant="body2">Loading tour...</Typography>
      </Box>
    );
  }

  // Get the current language or fallback - now using currentTextLanguage for UI text
  const currentLang = currentTextLanguage || tourData.currentLanguage || tourData.languages?.[0] || 'eng';
  const fallbackLang = tourData.languages?.[0] || 'eng';

  // Get available audio languages from tour data
  const availableAudioLanguages = tourData.languages || ['eng'];
  
  // Filter available audio languages to only include ones we support
  const supportedAudioLanguages = AUDIO_LANGUAGES
    .filter(lang => availableAudioLanguages.includes(lang.code))
    .map(lang => lang.code);
  
  console.log('🔍 Audio language availability:');
  console.log('  tourData.languages:', tourData.languages);
  console.log('  availableAudioLanguages:', availableAudioLanguages);
  console.log('  supportedAudioLanguages:', supportedAudioLanguages);
  
  // Get guide configuration and cover description using currentTextLanguage
  const guideConfig = getHubConfigByLanguage(currentTextLanguage);
  const coverDescription = guideConfig?.data?.pagePOIGuide?.coverDescription || 'Start your audio guide experience!';
  const audioLanguageLabel = guideConfig?.data?.pagePOIGuide?.audioLanguageLabel || 'Audio Language';
  const nextLabel = guideConfig?.data?.pagePOIGuide?.nextLabel || 'Start Tour';
  
  // Get localized content - IMPORTANT: Separate text language from audio language
  // For UI text (title, descriptions): use currentTextLanguage (from URL)
  // For audio content: use selectedAudioLanguage (from state/context)
  
  console.log('🔍 Debug POICover data binding:');
  console.log('  currentTextLanguage (for UI):', currentTextLanguage);
  console.log('  audioLanguage from context:', audioLanguage);
  console.log('  currentAudioLanguage from mapping:', currentAudioLanguage);
  console.log('  selectedAudioLanguage (dropdown state):', selectedAudioLanguage);
  console.log('  availableAudioLanguages:', availableAudioLanguages);
  
  // Title should be based on TEXT language (for UI), not audio language
  // Handle both text language format (en) and audio language format (eng) for title lookup
  const titleLookupOrder = [
    currentTextLanguage,  // e.g., 'en' 
    mapTextToAudioLanguage(currentTextLanguage), // e.g., 'eng'
    currentLang,
    fallbackLang
  ];
  
  let title = 'Unnamed POI Guide';
  for (const langKey of titleLookupOrder) {
    if (tourData.title?.[langKey]) {
      title = tourData.title[langKey];
      break;
    }
  }
  
  // Fallback to POI label if no title found
  if (title === 'Unnamed POI Guide' && poiData.poi?.label) {
    title = poiData.poi.label;
  }
  
  console.log('🔍 Title lookup:');
  console.log('  titleLookupOrder:', titleLookupOrder);
  console.log('  tourData.title keys:', Object.keys(tourData.title || {}));
  console.log('  selected title:', title);
  
  const jpnTitle = tourData.title?.['jpn'] || tourData.title?.['ja'];
  
  // Images can be based on audio language (since different audio might have different visuals)
  const s3BaseUrl = getS3BaseUrl(poiData.legacyTourCode);
  const imageUrl = tourData.image?.[selectedAudioLanguage]
    ? `${s3BaseUrl}${tourData.image[selectedAudioLanguage]}`
    : tourData.image?.[currentTextLanguage]
    ? `${s3BaseUrl}${tourData.image[currentTextLanguage]}`
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
      
      {/* Logo in center of header */}
      <Box sx={{ 
        position: 'absolute', 
        top: { xs: 10, sm: 15 }, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 3 
      }}>
        <img 
          src={travelLogo} 
          alt="Laxy Travel" 
          style={{ 
            height: '76px',
            width: 'auto',
            filter: 'brightness(0) invert(1)' // Make the logo white
          }} 
        />
      </Box>

      {/* Main Content Area - Centered */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white',
        zIndex: 2,
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 6, sm: 7, md: 8 }, // Reduced top padding for small screens
        pb: { xs: 0.5, sm: 1, md: 2 }, // Reduced bottom padding
        minHeight: 0,
        '@media (max-height: 700px)': {
          pt: { xs: 5, sm: 6, md: 7 },
          pb: { xs: 0, sm: 0.5, md: 1 },
        },
        '@media (max-height: 600px)': {
          pt: { xs: 4, sm: 5, md: 6 },
          pb: { xs: 0, sm: 0, md: 0.5 },
        },
        '@media (max-height: 500px)': {
          pt: { xs: 3, sm: 4, md: 5 },
          pb: { xs: 0, sm: 0, md: 0 },
        },
      }}>
        {/* Empty space for background image display */}
      </Box>
      
      {/* Bottom Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 1, sm: 1.5, md: 2 },
          pb: { xs: 1.5, sm: 2, md: 3 },
          px: { xs: 2, sm: 3, md: 4 },
          zIndex: 2,
          flexShrink: 0,
          '@media (max-height: 700px)': {
            gap: { xs: 0.75, sm: 1, md: 1.5 },
            pb: { xs: 1, sm: 1.5, md: 2.5 },
          },
          '@media (max-height: 600px)': {
            gap: { xs: 0.5, sm: 0.75, md: 1 },
            pb: { xs: 0.75, sm: 1, md: 2 },
          },
          '@media (max-height: 500px)': {
            gap: { xs: 0.25, sm: 0.5, md: 0.75 },
            pb: { xs: 0.5, sm: 0.75, md: 1.5 },
          },
        }}
      >
        {/* Title */}
        <Typography variant="h5" sx={{...commonStyles.title, color: 'white'}}>
          {title}
        </Typography>
        
        {/* Japanese Title */}
        {jpnTitle && selectedAudioLanguage !== 'jpn' && (
          <Typography variant="h4" sx={{...commonStyles.jpnTitle, color: 'white'}}>
            {jpnTitle}
          </Typography>
        )}
        
        {/* Subtitle */}
        <Typography variant="body1" sx={{...commonStyles.subtitle, color: 'white'}}>
          {coverDescription}
        </Typography>
        {/* Audio Language Select */}
        <FormControl sx={{ width: '100%', ...commonStyles.audioSelect }}>
          <InputLabel id="audio-language-label">{audioLanguageLabel}</InputLabel>
          <Select
            labelId="audio-language-label"
            value={selectedAudioLanguage || audioLanguage || 'eng'}
            label={audioLanguageLabel}
            onChange={handleAudioLanguageChange}
            displayEmpty
          >
            {AUDIO_LANGUAGES
              .filter(lang => supportedAudioLanguages.includes(lang.code))
              .map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.label}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        {/* Start Tour Button */}
        <Button
          variant="contained"
          sx={{ 
            ...commonStyles.button, 
            ...commonStyles.startButton,
            width: '100%',
          }}
          onClick={handleStartTour}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : nextLabel}
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
    </Box>
  );
}

export default POICover;
