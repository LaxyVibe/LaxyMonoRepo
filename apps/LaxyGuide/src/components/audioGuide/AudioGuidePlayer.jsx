/**
 * Audio Guide Player Component
 * Main component for playing audio guides with subtitles and images
 */
import React, { useState, useEffect, useRef } from 'react';
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
import { parseSRT, isValidSRT } from '../../utils/srtParser.js';

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
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(-1);
  const [currentImage, setCurrentImage] = useState(null);
  const [isManualScroll, setIsManualScroll] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  
  // Refs for subtitle handling
  const subtitleContainerRef = useRef(null);
  const manualScrollTimerRef = useRef(null);
  const currentSubtitleRef = useRef(null);
  const touchStartY = useRef(0);

  // Load subtitles when step changes
  useEffect(() => {
    console.log('🎬 Step changed, currentStep:', currentStep);
    console.log('🎬 Subtitle URL:', currentStep?.subtitleUrl);
    if (currentStep?.subtitleUrl) {
      loadSubtitles(currentStep.subtitleUrl);
    } else {
      console.log('🎬 No subtitle URL found, clearing subtitles');
      setSubtitles([]);
      setCurrentSubtitle('');
    }
  }, [currentStep?.subtitleUrl]);

  // Update current subtitle and image based on time
  useEffect(() => {
    updateCurrentSubtitle();
    updateCurrentImage();
  }, [currentTime, subtitles, currentStep?.images]);

  // Auto-scroll subtitle container to current subtitle
  useEffect(() => {
    if (!isManualScroll && currentSubtitleRef.current && subtitleContainerRef.current) {
      const container = subtitleContainerRef.current;
      const element = currentSubtitleRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      const scrollTo = element.offsetTop - (containerRect.height / 2) + (elementRect.height / 2);
      
      const boundedScrollTo = Math.max(0, Math.min(scrollTo, container.scrollHeight - containerRect.height));
      
      container.scrollTo({
        top: boundedScrollTo,
        behavior: 'smooth'
      });
    }
  }, [currentSubtitleIndex, isManualScroll]);

  // Cleanup manual scroll timer
  useEffect(() => {
    return () => {
      if (manualScrollTimerRef.current) {
        clearTimeout(manualScrollTimerRef.current);
      }
    };
  }, []);

  const loadSubtitles = async (subtitleUrl) => {
    console.log('🎬 Loading subtitles from:', subtitleUrl);
    try {
      const response = await fetch(subtitleUrl);
      console.log('🎬 Subtitle response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const srtContent = await response.text();
      console.log('🎬 Raw SRT content length:', srtContent.length);
      console.log('🎬 Raw SRT content preview:', srtContent.substring(0, 400));
      
      // Test the SRT validation
      const isValid = isValidSRT(srtContent);
      console.log('🎬 SRT validation result:', isValid);
      
      const parsedSubtitles = parseSRT(srtContent);
      console.log('🎬 Parsed subtitles count:', parsedSubtitles.length);
      console.log('🎬 First few parsed subtitles:', parsedSubtitles.slice(0, 3));
      
      if (parsedSubtitles.length === 0) {
        console.warn('🎬 No subtitles parsed! Checking raw content structure...');
        const lines = srtContent.split('\n');
        console.log('🎬 First 10 lines of SRT:', lines.slice(0, 10));
      }
      
      setSubtitles(parsedSubtitles);
    } catch (error) {
      console.error('🎬 Failed to load subtitles:', error);
      setSubtitles([]);
    }
  };

  const updateCurrentSubtitle = () => {
    let newIndex = -1;
    for (let i = 0; i < subtitles.length; i++) {
      const subtitle = subtitles[i];
      if (currentTime >= subtitle.startTime && currentTime <= subtitle.endTime) {
        newIndex = i;
        break;
      }
    }
    
    if (newIndex !== currentSubtitleIndex) {
      setCurrentSubtitleIndex(newIndex);
      setCurrentSubtitle(newIndex >= 0 ? subtitles[newIndex]?.text || '' : '');
    }
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

  const handleSubtitleClick = (index) => {
    if (!subtitles[index]) return;
    const subtitle = subtitles[index];
    seekTo(subtitle.startTime);
    if (!isPlaying) {
      togglePlayPause();
    }
  };

  const handleSubtitleScroll = () => {
    if (!isManualScroll) {
      setIsManualScroll(true);
    }

    if (manualScrollTimerRef.current) {
      clearTimeout(manualScrollTimerRef.current);
    }

    manualScrollTimerRef.current = setTimeout(() => {
      setIsManualScroll(false);
    }, 5000);
  };

  const handleTouchStart = (e) => {
    if (subtitleContainerRef.current) {
      touchStartY.current = e.touches[0].clientY;
      setIsTouching(true);
      setIsManualScroll(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isTouching || !subtitleContainerRef.current) return;
    
    const container = subtitleContainerRef.current;
    const touchY = e.touches[0].clientY;
    const diff = touchStartY.current - touchY;
    
    container.scrollTop += diff;
    touchStartY.current = touchY;
    
    if (manualScrollTimerRef.current) {
      clearTimeout(manualScrollTimerRef.current);
    }
    
    manualScrollTimerRef.current = setTimeout(() => {
      setIsManualScroll(false);
    }, 5000);
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
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
          gap: 2,
          backgroundColor: '#000000',
          color: '#ffffff'
        }}
      >
        <CircularProgress sx={{ color: '#46B2BB' }} />
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
        WebkitTapHighlightColor: 'transparent',
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
            // Default dark gradient background
            return 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)';
          })(),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
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
        }}
      />

      {/* Additional Dark Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,1) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content Area */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative', 
        overflowY: 'auto',
        paddingBottom: '220px',
        zIndex: 2 
      }} />

      {/* Step Title */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          zIndex: 2,
          width: '100%',
          padding: '0 16px',
        }}
      >
        <Typography
          sx={{
            color: 'white',
            fontWeight: 600,
            fontSize: '16px',
            textAlign: 'left',
            marginBottom: '8px',
          }}
        >
          {currentStep.title}
        </Typography>
      </Box>

      {/* Subtitles */}
      <Box
        ref={subtitleContainerRef}
        sx={{
          position: 'absolute',
          zIndex: 3,
          top: 200,
          left: 16,
          right: 16,
          color: 'white',
          p: 2,
          borderRadius: 2,
          maxHeight: '40vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          scrollbarWidth: 'thin',
          touchAction: 'pan-y',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.5)',
            },
          },
        }}
        onScroll={handleSubtitleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {subtitles.length > 0 ? (
          <>
            <Typography 
              variant="h5" 
              sx={{ 
                textAlign: 'center',
                lineHeight: 1.5 
              }}
            >
              {subtitles.map((subtitle, index) => {
                const isCurrent = index === currentSubtitleIndex;
                return (
                  <React.Fragment key={index}>
                    <Box
                      component="span"
                      ref={isCurrent ? currentSubtitleRef : null}
                      onClick={() => handleSubtitleClick(index)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'opacity 0.3s ease, color 0.3s ease',
                        '&:hover': {
                          opacity: 0.8,
                        },
                        display: 'inline',
                        opacity: 1,
                        color: isCurrent ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {subtitle.text}
                    </Box>
                    {' '}
                  </React.Fragment>
                );
              })}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h5" sx={{ textAlign: 'center' }}>
              No subtitles available
            </Typography>
          </>
        )}
      </Box>

      {/* Player Controls */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          zIndex: 3,
          p: 3,
          pt: 2,
          bgcolor: '#000000',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          borderRadius: 0,
          border: 'none',
        }}
      >
        <Box sx={{
          maxWidth: '600px',
          margin: '0 auto',
          width: '100%',
        }}>
          <Typography 
            variant="h7"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              mb: 1,
              textAlign: 'left',
              display: 'block'
            }}
          >
            {currentStep.title}
          </Typography>
          
          {/* Progress Bar */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            mb: 2,
            px: 2,
          }}>
            <Slider
              value={progress}
              onChange={handleSliderChange}
              sx={{
                width: '100%',
                color: 'white',
                padding: '15px 0',
                '& .MuiSlider-thumb': { 
                  width: 12,
                  height: 12,
                  color: 'white',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0px 0px 0px 8px rgba(255, 255, 255, 0.16)',
                  },
                },
                '& .MuiSlider-track': { 
                  color: 'white',
                  height: 2,
                },
                '& .MuiSlider-rail': { 
                  color: 'grey.500',
                  opacity: 0.38,
                  height: 2,
                },
              }}
            />
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              width: '100%', 
              mt: 1 
            }}>
              <Typography sx={{
                color: 'white',
                fontSize: '12px',
                minWidth: '45px',
                opacity: 0.7,
              }}>
                {formatTime(currentTime)}
              </Typography>
              <Typography sx={{
                color: 'white',
                fontSize: '12px',
                minWidth: '45px',
                opacity: 0.7,
              }}>
                -{formatTime(duration - currentTime)}
              </Typography>
            </Box>
          </Box>

          {/* Control Buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 3,
              mb: 1,
            }}
          >
            <IconButton
              onClick={goToPreviousStep}
              disabled={!hasPreviousStep}
              size="large"
              sx={{
                color: '#ffffff',
                '&:disabled': {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              <SkipPrevious />
            </IconButton>

            <IconButton 
              onClick={() => skipBackward(10)} 
              size="large"
              sx={{ color: '#ffffff' }}
            >
              <Replay10 />
            </IconButton>

            <IconButton
              onClick={togglePlayPause}
              disabled={isLoading}
              size="large"
              sx={{
                backgroundColor: '#46B2BB',
                color: 'white',
                width: 64,
                height: 64,
                '&:hover': {
                  backgroundColor: '#3a9199',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
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

            <IconButton 
              onClick={() => skipForward(10)} 
              size="large"
              sx={{ color: '#ffffff' }}
            >
              <Forward10 />
            </IconButton>

            <IconButton
              onClick={goToNextStep}
              disabled={!hasNextStep}
              size="large"
              sx={{
                color: '#ffffff',
                '&:disabled': {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              <SkipNext />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AudioGuidePlayer;
