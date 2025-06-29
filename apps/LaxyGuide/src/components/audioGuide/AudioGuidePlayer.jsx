/**
 * Audio Guide Player Component
 * Main component for playing audio guides with subtitles and images
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Replay10,
  Forward10
} from '@mui/icons-material';
import { useAudioGuide } from '../../context/AudioGuideContext.jsx';
import { parseSRT } from '../../utils/srtParser.js';

const AudioGuidePlayer = ({ onClose }) => {
  const {
    currentGuide,
    currentStep,
    currentStepIndex,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    goToNextStep,
    goToPreviousStep,
    hasNextStep,
    hasPreviousStep,
    totalSteps,
    progress,
    tourTitle
  } = useAudioGuide();

  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [currentImage, setCurrentImage] = useState(null);

  // Load subtitles when step changes
  useEffect(() => {
    if (currentStep?.subtitleUrl) {
      loadSubtitles(currentStep.subtitleUrl);
    } else {
      setSubtitles([]);
      setCurrentSubtitle('');
    }
  }, [currentStep?.subtitleUrl]);

  // Update current subtitle and image based on time
  useEffect(() => {
    updateCurrentSubtitle();
    updateCurrentImage();
  }, [currentTime, subtitles, currentStep?.images]);

  const loadSubtitles = async (subtitleUrl) => {
    try {
      const response = await fetch(subtitleUrl);
      const srtContent = await response.text();
      const parsedSubtitles = parseSRT(srtContent);
      setSubtitles(parsedSubtitles);
    } catch (error) {
      console.error('Error loading subtitles:', error);
      setSubtitles([]);
    }
  };

  const updateCurrentSubtitle = () => {
    const subtitle = subtitles.find(
      sub => currentTime >= sub.start && currentTime <= sub.end
    );
    setCurrentSubtitle(subtitle?.text || '');
  };

  const updateCurrentImage = () => {
    if (!currentStep?.images) {
      console.log('🖼️ No images in currentStep:', currentStep);
      return;
    }
    
    console.log('🖼️ Checking images for time:', currentTime);
    console.log('🖼️ Available images:', currentStep.images);
    
    const image = currentStep.images.find(
      img => currentTime >= img.startTimestamp && currentTime <= img.endTimestamp
    );
    
    console.log('🖼️ Found image:', image);
    setCurrentImage(image?.url || null);
  };

  const handleSliderChange = (event, newValue) => {
    seekTo((newValue / 100) * duration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentGuide || !currentStep) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography>Loading audio guide...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: (() => {
            // Use current timed image if available
            if (currentImage) return `url(${currentImage})`;
            // Fallback to first image if available
            if (currentStep?.images && currentStep.images.length > 0 && currentStep.images[0].url) {
              return `url(${currentStep.images[0].url})`;
            }
            // Default gradient background
            return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          })(),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1
        }}
      />

      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
          zIndex: 2
        }}
      />

      {/* Tour Info Header */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 3,
          p: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            {tourTitle || currentStep?.title || 'Audio Guide'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Step {currentStepIndex + 1} of {totalSteps}
          </Typography>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, position: 'relative', zIndex: 3 }} />

      {/* Step Title */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 3,
          px: 3,
          pb: 2
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: 600,
            textAlign: 'center',
            mb: 1
          }}
        >
          {currentStep.title}
        </Typography>
      </Box>

      {/* Subtitles */}
      {currentSubtitle && (
        <Box
          sx={{
            position: 'relative',
            zIndex: 3,
            px: 3,
            pb: 2,
            minHeight: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: 2,
              maxWidth: '90%'
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.5
              }}
            >
              {currentSubtitle}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Player Controls */}
      <Paper
        elevation={8}
        sx={{
          position: 'relative',
          zIndex: 3,
          mx: 2,
          mb: 2,
          p: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3
        }}
      >
        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Slider
            value={progress}
            onChange={handleSliderChange}
            sx={{
              '& .MuiSlider-thumb': {
                width: 20,
                height: 20,
              },
              '& .MuiSlider-track': {
                height: 4,
              },
              '& .MuiSlider-rail': {
                height: 4,
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(duration)}
            </Typography>
          </Box>
        </Box>

        {/* Control Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1
          }}
        >
          <IconButton
            onClick={goToPreviousStep}
            disabled={!hasPreviousStep}
            size="large"
          >
            <SkipPrevious />
          </IconButton>

          <IconButton onClick={() => skipBackward(10)} size="large">
            <Replay10 />
          </IconButton>

          <IconButton
            onClick={togglePlayPause}
            disabled={isLoading}
            size="large"
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              width: 64,
              height: 64,
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'grey.300',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : isPlaying ? (
              <Pause sx={{ fontSize: 32 }} />
            ) : (
              <PlayArrow sx={{ fontSize: 32 }} />
            )}
          </IconButton>

          <IconButton onClick={() => skipForward(10)} size="large">
            <Forward10 />
          </IconButton>

          <IconButton
            onClick={goToNextStep}
            disabled={!hasNextStep}
            size="large"
          >
            <SkipNext />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default AudioGuidePlayer;
