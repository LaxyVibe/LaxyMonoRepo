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
    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.8) 80%, rgba(0, 0, 0, 0.8) 100%)',
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
    px: { xs: 2, sm: 3, md: 4 },
    pb: { xs: 2, sm: 3 },
  },
  title: {
    textAlign: 'center',
    textTransform: 'uppercase',
    mb: 1,
    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
  },
  jpnTitle: {
    textAlign: 'center',
    mb: 2,
    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
    opacity: 0.9,
  },
  subtitle: {
    mb: { xs: 3, sm: 4 },
    fontSize: { xs: '0.875rem', sm: '1rem' },
    px: { xs: 1, sm: 2 },
  },
  button: {
    borderRadius: '50px',
    px: { xs: 3, sm: 4 },
    py: { xs: 1, sm: 1.5 },
    textTransform: 'none',
    fontSize: { xs: '0.875rem', sm: '1rem' },
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
    '& .MuiOutlinedInput-root': {
      borderRadius: '50px',
      paddingTop: '8px', // Add space for the label
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
      padding: { xs: '10px 12px', sm: '12px 14px' },
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
        top: { xs: 15, sm: 20 }, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 3 
      }}>
        <img 
          src={travelLogo} 
          alt="Travel Logo" 
          style={{ 
            height: '60px',
            width: 'auto',
            filter: 'brightness(0) invert(1)' // Make the logo white
          }} 
        />
      </Box>

      <Box sx={commonStyles.content}>
        <Typography variant="h2" sx={commonStyles.title}>
          {title}
        </Typography>
        {jpnTitle && selectedAudioLanguage !== 'jpn' && (
          <Typography variant="h4" sx={commonStyles.jpnTitle}>
            {jpnTitle}
          </Typography>
        )}
        <Typography variant="body1" sx={commonStyles.subtitle}>
          {coverDescription}
        </Typography>
      </Box>
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 2, sm: 3 },
          pb: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          zIndex: 2,
        }}
      >
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
            mb: { xs: 4, sm: 2 }, // Add bottom margin for mobile browser toolbar
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
