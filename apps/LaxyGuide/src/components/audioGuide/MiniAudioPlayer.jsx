import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAudioGuide } from '../../context/AudioGuideContext';
import './MiniAudioPlayer.css';

/**
 * Mini audio player component for persistent playback across the app
 * Displays a compact player at the bottom of the screen when audio is playing
 */
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
    tourTitle
  } = useAudioGuide();

  // Don't show mini player if no audio is loaded
  if (!currentStep || !tourTitle) {
    return null;
  }

  // Don't show mini player on AudioGuidePage (full player page), TourDetail page, or TourLanding page
  if (location.pathname.includes('/step/') || 
      location.pathname.includes('/audio-guide/') || 
      location.pathname.includes('/details') ||
      location.pathname.match(/\/[^/]+\/poi\/[^/]+$/) // Matches /:langCode/poi/:poiSlug pattern
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

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    seekTo(newTime);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mini-audio-player">
      <div className="mini-player-content">
        {/* Step info */}
        <div className="mini-player-info">
          <div className="mini-player-title">{currentStep.title}</div>
          <div className="mini-player-subtitle">{tourTitle}</div>
        </div>

        {/* Controls */}
        <div className="mini-player-controls">
          <button
            className="mini-play-button"
            onClick={handlePlayPause}
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
          </button>

          {/* Progress bar */}
          <div className="mini-progress-container" onClick={handleSeek}>
            <div className="mini-progress-bar">
              <div 
                className="mini-progress-fill" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Time display */}
          <div className="mini-time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Close button */}
          <button
            className="mini-close-button"
            onClick={clearAudioGuide}
            aria-label="Close audio guide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
