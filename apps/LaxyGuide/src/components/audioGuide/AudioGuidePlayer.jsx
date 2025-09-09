/**
 * Audio Guide Player Component
 * Main component for playing audio guides with subtitles and images
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Pause
} from '@mui/icons-material';
import { useAudioGuide } from '../../context/AudioGuideContext.jsx';
import { parseSRT, isValidSRT } from '../../utils/srtParser.js';

// Import custom SVG icons
import Backward15sIcon from '../../assets/player/backward-15s.svg';
import Forward15sIcon from '../../assets/player/forward-15s.svg';

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
  
  // Animation states for rotation
  const [isBackwardAnimating, setIsBackwardAnimating] = useState(false);
  const [isForwardAnimating, setIsForwardAnimating] = useState(false);
  
  // Refs for subtitle handling
  const subtitleContainerRef = useRef(null);
  const manualScrollTimerRef = useRef(null);
  const currentSubtitleRef = useRef(null);
  const lastLoadedSubtitleUrlRef = useRef(null);
  const lastStepIdRef = useRef(null);
  const isLoadingSubtitlesRef = useRef(false);

  // Extract stable values to prevent unnecessary re-renders
  const currentStepId = currentStep?.id || null;
  const currentSubtitleUrl = currentStep?.subtitleUrl || null;
  const currentImages = currentStep?.images || [];

  // Memoized loadSubtitles function
  const loadSubtitles = useCallback(async (subtitleUrl) => {
    // Prevent concurrent loads
    if (isLoadingSubtitlesRef.current) {
      console.log('🎬 Already loading subtitles, skipping');
      return;
    }
    
    console.log('🎬 Fetching subtitles from:', subtitleUrl);
    isLoadingSubtitlesRef.current = true;
    
    try {
      const response = await fetch(subtitleUrl);
      console.log('🎬 Subtitle response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const srtContent = await response.text();
      console.log('🎬 Raw SRT content length:', srtContent.length);
      
      // Test the SRT validation
      const isValid = isValidSRT(srtContent);
      console.log('🎬 SRT validation result:', isValid);
      
      const parsedSubtitles = parseSRT(srtContent);
      console.log('🎬 Parsed subtitles count:', parsedSubtitles.length);
      
      if (parsedSubtitles.length === 0) {
        console.warn('🎬 No subtitles parsed! Raw content:', srtContent.substring(0, 200));
      }
      
      setSubtitles(parsedSubtitles);
    } catch (error) {
      console.error('🎬 Failed to load subtitles:', error);
      setSubtitles([]);
    } finally {
      isLoadingSubtitlesRef.current = false;
    }
  }, []);

  // Load subtitles when step changes
  useEffect(() => {
    console.log('🎬 Step effect triggered:', {
      currentStepId,
      currentSubtitleUrl,
      lastStepId: lastStepIdRef.current,
      lastSubtitleUrl: lastLoadedSubtitleUrlRef.current
    });
    
    // Update step tracking
    lastStepIdRef.current = currentStepId;
    
    if (currentSubtitleUrl) {
      // Only load if it's a different subtitle URL
      if (currentSubtitleUrl !== lastLoadedSubtitleUrlRef.current) {
        console.log('🎬 Loading new subtitle URL:', currentSubtitleUrl);
        lastLoadedSubtitleUrlRef.current = currentSubtitleUrl;
        loadSubtitles(currentSubtitleUrl);
      } else {
        console.log('🎬 Subtitle URL unchanged, skipping load');
      }
    } else {
      console.log('🎬 No subtitle URL found, clearing subtitles');
      if (lastLoadedSubtitleUrlRef.current !== null) {
        lastLoadedSubtitleUrlRef.current = null;
        setSubtitles([]);
        setCurrentSubtitle('');
      }
    }
  }, [currentSubtitleUrl, loadSubtitles]); // Only depend on the URL, not the step ID

  // Update current subtitle and image based on time
  useEffect(() => {
    updateCurrentSubtitle();
    updateCurrentImage();
  }, [currentTime, subtitles, currentImages]);

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
    if (!currentImages || currentImages.length === 0) {
      return;
    }
    
    const image = currentImages.find(
      img => currentTime >= img.startTimestamp && currentTime <= img.endTimestamp
    );
    
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

  // Enhanced skip functions with animation
  const handleSkipBackward = () => {
    setIsBackwardAnimating(true);
    skipBackward(15); // Use 15 seconds
    setTimeout(() => setIsBackwardAnimating(false), 200); // Animation duration
  };

  const handleSkipForward = () => {
    setIsForwardAnimating(true);
    skipForward(15); // Use 15 seconds  
    setTimeout(() => setIsForwardAnimating(false), 200); // Animation duration
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
      <Box
        sx={{
          width: '100%',
          height: 'clamp(200px, 35vh, 300px)', // Responsive height with min/max bounds
          maxHeight: '35vh', // Limit to 35% of viewport height
          position: 'relative',
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
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.2) 20%, rgba(0, 0, 0, 0.2) 80%, rgba(0, 0, 0, 1) 100%)',
            zIndex: 1,
          },
        }}
      />

      {/* Subtitle Section with Solid Background */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: '#000000',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          paddingBottom: '200px', // Space for controls
          minHeight: 'clamp(250px, 40vh, 100vh)', // Ensure minimum height for subtitles
          maxHeight: 'calc(65vh - 200px)', // Ensure space for controls
        }}
      >
        {/* Subtitles Container */}
        <Box
          ref={subtitleContainerRef}
          sx={{
            flex: 1,
            color: 'white',
            p: 3,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'thin',
            touchAction: 'pan-y',
            minHeight: 'clamp(200px, 30vh, 100vh)', // Ensure minimum subtitle area
            maxHeight: '100%', // Ensure container doesn't exceed parent
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
        >
        {subtitles.length > 0 ? (
          <Box sx={{ 
            paddingTop: '20px', 
            paddingBottom: '60px', // Extra bottom padding for better scroll experience
            minHeight: '100%' // Ensure content takes full height to enable scrolling
          }}>
            <Typography 
              variant="h8" 
              sx={{ 
                textAlign: 'justify',
                lineHeight: 1.4,
                fontSize: 'clamp(16px, 4vw, 18px)', // Responsive font size
                fontFamily: 'Inter',
                fontWeight: 600,
                marginLeft: '16px',
                marginRight: '16px',
                display: 'block' // Change to block for better text flow
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
          </Box>
        ) : (
          <Box sx={{ 
            paddingTop: '20px', 
            paddingBottom: '60px',
            minHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography 
              variant="h8" 
              sx={{ 
                textAlign: 'center',
                fontSize: 'clamp(16px, 4vw, 18px)', // Responsive font size
                fontFamily: 'Inter',
                fontWeight: 600,
                marginLeft: '16px',
                marginRight: '16px'
              }}
            >
              No subtitles available
            </Typography>
          </Box>
        )}
        </Box>
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
              onClick={handleSkipBackward}
              size="large"
              sx={{ 
                color: '#ffffff',
                '& img': {
                  width: 30,
                  height: 30,
                  transition: 'transform 0.6s ease-in-out',
                  transform: isBackwardAnimating ? 'rotate(-360deg)' : 'rotate(0deg)',
                }
              }}
            >
              <img src={Backward15sIcon} alt="Backward 15s" />
            </IconButton>

            <IconButton
              onClick={togglePlayPause}
              disabled={isLoading}
              size="large"
              sx={{
                backgroundColor: 'white',
                color: '#46b2bb',
                width: 64,
                height: 64,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: '#46b2bb' }} />
              ) : isPlaying ? (
                <Pause sx={{ fontSize: 32 }} />
              ) : (
                <PlayArrow sx={{ fontSize: 32 }} />
              )}
            </IconButton>

            <IconButton 
              onClick={handleSkipForward}
              size="large"
              sx={{ 
                color: '#ffffff',
                '& img': {
                  width: 30,
                  height: 30,
                  transition: 'transform 0.6s ease-in-out',
                  transform: isForwardAnimating ? 'rotate(360deg)' : 'rotate(0deg)',
                }
              }}
            >
              <img src={Forward15sIcon} alt="Forward 15s" />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AudioGuidePlayer;
