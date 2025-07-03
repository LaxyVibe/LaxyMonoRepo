import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Slider } from '@mui/material';
import { useAudioGuide } from '../../context/AudioGuideContext';

// S3 Base URL configuration for tour content
const getS3BaseUrl = (legacyTourCode) => {
  return `https://s3.ap-northeast-1.amazonaws.com/laxy.travel.staging/tours/${legacyTourCode}/`;
};

// Common styles
const commonStyles = {
  container: {
    position: 'fixed',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'black',
    color: 'white',
    padding: '10px 16px 0px', // Remove bottom padding completely
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    width: 'calc(100% - 32px)',
    overflow: 'hidden',
  },
  innerContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginBottom: '4px', // Reduced from 8px to 4px
  },
  stepImage: {
    width: '42px',
    height: '42px',
    borderRadius: '8px',
    marginRight: '12px',
    objectFit: 'cover',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  title: {
    variant: 'body2',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '2px',
    fontSize: '14px',
  },
  timeText: {
    color: '#999',
    fontSize: '12px',
  },
  playButtonContainer: {
    marginLeft: '12px',
  },
  playButton: {
    color: 'white',
    width: 32,
    height: 32,
    minWidth: 32,
    '& svg': {
      fontSize: '24px',
    }
  },
  progressContainer: {
    width: '100%',
    marginTop: 0,
    marginBottom: 0,
    padding: 0,
  },
  slider: {
    width: '100%',
    color: 'white',
    height: 4, // Increased height for better visibility
    padding: 0,
    margin: 0,
    borderRadius: 0,
    '& .MuiSlider-thumb': { 
      width: 4, // Increased thumb size for better visibility
      height: 4, // Increased thumb size for better visibility
      transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
      '&:before': {
        boxShadow: '0 2px 12px 0 rgba(255,255,255,0.4)',
      },
      '&:hover, &.Mui-focusVisible': {
        boxShadow: '0px 0px 0px 8px rgba(255, 255, 255, 0.16)',
      },
      '&.Mui-active': {
        width: 14,
        height: 14,
      },
    },
    '& .MuiSlider-track': { 
      color: 'white',
      height: 4, // Increased track height for better visibility
      borderRadius: 0,
    },
    '& .MuiSlider-rail': { 
      color: 'grey.500',
      opacity: 0.38,
      height: 4, // Increased rail height for better visibility
      borderRadius: 0,
    },
    // Add specific overrides for MUI's CSS classes
    '&.MuiSlider-root': {
      padding: 0,
    },
    '&.css-14iwn0k-MuiSlider-root': {
      padding: 0,
    },
  },
};
export default function MiniAudioPlayer() {
  const location = useLocation();
  const {
    isPlaying,
    currentTime,
    duration,
    currentStep,
    play,
    pause,
    seekTo,
    clearAudioGuide,
    tourTitle,
    tourData
  } = useAudioGuide();

  // Don't show mini player if no audio is loaded
  if (!currentStep || !tourTitle) {
    return null;
  }

  // Don't show mini player on AudioGuidePage (full player page), TourCover page, or POICover page
  if (location.pathname.includes('/step/') || 
      location.pathname.includes('/audio-guide/') || 
      location.pathname.includes('/details') ||
      location.pathname.match(/\/[^/]+\/poi\/[^/]+$/) || // Matches /:langCode/poi/:poiSlug pattern
      location.pathname.match(/\/[^/]+\/tour\/[^/]+$/) // Matches /:langCode/tour/:tourId pattern (TourCover)
  ) {
    return null;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSeek = (event, newValue) => {
    seekTo(newValue);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get the image URL for current step
  const getStepImageUrl = () => {
    if (!currentStep?.images || currentStep.images.length === 0) {
      return 'https://via.placeholder.com/42x42?text=Step';
    }
    
    const firstImage = currentStep.images[0];
    const tourId = tourData?.tourCode;
    const s3BaseUrl = getS3BaseUrl(tourId);
    
    // Check if it's the new object format with url property
    if (typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url.startsWith('http') ? firstImage.url : `${s3BaseUrl}${firstImage.url}`;
    }
    
    // Legacy string format
    if (typeof firstImage === 'string') {
      return firstImage.startsWith('http') ? firstImage : `${s3BaseUrl}${firstImage}`;
    }
    
    return 'https://via.placeholder.com/42x42?text=Step';
  };

  const imageUrl = getStepImageUrl();

  return (
    <Box sx={commonStyles.container}>
      {/* Main content with image, title and play button */}
      <Box sx={commonStyles.innerContainer}>
        <Box 
          component="img"
          src={imageUrl}
          alt={currentStep.title || 'Step'}
          sx={commonStyles.stepImage}
        />
        
        <Box sx={commonStyles.infoContainer}>
          <Typography sx={commonStyles.title}>
            {currentStep.title || 'Untitled Step'}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={commonStyles.timeText}>
              {formatTime(currentTime || 0)}
            </Typography>
            <Typography sx={commonStyles.timeText}>
              {formatTime(duration || 0)}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={commonStyles.playButtonContainer}>
          <Box
            component="button"
            onClick={handlePlayPause}
            sx={{
              ...commonStyles.playButton,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
            }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Progress bar at the bottom edge of the card */}
      <Box sx={commonStyles.progressContainer}>
        <Slider
          size="small"
          value={currentTime || 0}
          min={0}
          max={duration || 100}
          onChange={handleSeek}
          sx={{
            ...commonStyles.slider,
            position: 'relative',
            bottom: 0,
            marginTop: '4px',
            borderRadius: '0 0 8px 8px'
          }}
        />
      </Box>
    </Box>
  );
}
