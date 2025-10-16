import React, { useEffect, useMemo, useRef } from 'react';
import DOMPurify from 'dompurify';
import { Box, CircularProgress, Typography, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAudioGuide } from '../../context/AudioGuideContext.jsx';
import { extractTextAndAudioLanguageFromPath, getValidAudioLanguageCode } from '../../utils/languageUtils.js';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Step Content Page
 * Shows only the textual/HTML content of a step. Mini player stays visible at bottom.
 */
export default function StepContentPage() {
  const { langCode, poiSlug, tourId, stepId, audioLang } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const {
    currentGuide,
    steps,
    currentStep,
    currentStepIndex,
    isLoading,
    error,
    loadAudioGuide,
    goToStep,
    audioLanguage,
    setAudioLanguage,
    clearAudioGuide,
    pause
  } = useAudioGuide();

  // Extract audio language from URL or use default
  const { audioLangCode } = extractTextAndAudioLanguageFromPath(window.location.pathname);
  const urlAudioLanguage = getValidAudioLanguageCode(audioLang || audioLangCode);

  const lastLoadedConfigRef = useRef(null);

  // Memoize current config
  const currentConfig = useMemo(() => ({
    tourId,
    language,
    audioLanguage: urlAudioLanguage,
    stepId
  }), [tourId, language, urlAudioLanguage, stepId]);

  // Initialize and sync guide + step similar to AudioGuidePage, but do not render player
  useEffect(() => {
    const configKey = `${currentConfig.tourId}-${currentConfig.language}-${currentConfig.audioLanguage}`;
    if (!currentConfig.tourId) return;

    // Ensure audio language is set early
    if (urlAudioLanguage !== audioLanguage) {
      setAudioLanguage(urlAudioLanguage);
    }

    const guideMatches = currentGuide &&
      currentGuide.tourCode === currentConfig.tourId &&
      currentGuide.currentLanguage === currentConfig.language &&
      currentGuide.audioLanguage === currentConfig.audioLanguage;

    if (!guideMatches) {
      // Clear and load new guide without auto-playing or forcing first step
      if (currentGuide) {
        pause();
        clearAudioGuide();
      }
      lastLoadedConfigRef.current = configKey;
      // Do not auto-load first step; we will navigate to step below
      loadAudioGuide(currentConfig.tourId, currentConfig.language, currentConfig.audioLanguage, false)
        .catch(console.error);
    } else {
      lastLoadedConfigRef.current = configKey;
      if (currentConfig.stepId && steps && steps.length > 0) {
        const targetStepIndex = steps.findIndex((s) => s.id.toString() === currentConfig.stepId.toString());
        if (targetStepIndex !== -1 && targetStepIndex !== currentStepIndex) {
          goToStep(targetStepIndex);
        }
      }
    }
  }, [currentConfig, currentGuide, steps, currentStepIndex, urlAudioLanguage, audioLanguage, setAudioLanguage, loadAudioGuide, goToStep, pause, clearAudioGuide]);

  // Sanitize step HTML content
  const sanitizedStepHtml = useMemo(() => {
    const html = currentStep?.content || '';
    if (!html) return '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'img', 'a'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'target', 'rel', 'width', 'height',
        'loading', 'decoding'
      ]
    });
  }, [currentStep?.content]);

  const handleBackClick = () => {
    // Prefer validated audio language for steps route
    const aLang = urlAudioLanguage || audioLang || 'eng';
    if (poiSlug) {
      navigate(`/${langCode}/poi/${poiSlug}`);
    } else if (langCode && tourId) {
      navigate(`/${langCode}/tour/${tourId}/${aLang}/steps`);
    } else {
      navigate(-1);
    }
  };

  if (isLoading && !currentGuide) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Layout with padding bottom to make room for the mini player
  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh', pb: '96px', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Back button to Step List */}
      <Box sx={{ 
        position: 'sticky', top: 0, zIndex: 20,
        backgroundColor: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        px: 2, py: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <IconButton 
          onClick={handleBackClick}
          sx={{ color: '#222', backgroundColor: 'rgba(0,0,0,0.04)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' } }}
          aria-label="Back to steps"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h6" 
          sx={{ color: '#111', fontWeight: 600, textAlign: 'center', flex: 1, mx: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {currentStep?.title || 'Step Content'}
        </Typography>
        <Box sx={{ width: 48 }} />
      </Box>

      <Box sx={{ maxWidth: 900, width: '100%', mx: 'auto', px: 2, py: 3, flex: 1 }}>
        {sanitizedStepHtml ? (
          <Box
            sx={{
              color: '#111',
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                display: 'block',
                margin: '12px auto'
              },
              '& p, & div, & span, & li': {
                textAlign: 'justify',
                lineHeight: 1.7,
                fontSize: '16px',
                fontFamily: 'Inter',
              },
              '& a': {
                color: '#0aa',
                textDecoration: 'underline'
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                marginTop: '0.8em',
                marginBottom: '0.4em',
                lineHeight: 1.3
              }
            }}
            dangerouslySetInnerHTML={{ __html: sanitizedStepHtml }}
            onClick={(e) => {
              const target = e.target;
              if (target && target.tagName === 'A') {
                target.setAttribute('target', '_blank');
                target.setAttribute('rel', 'noopener noreferrer');
              }
            }}
          />
        ) : (
          <Typography variant="h5" sx={{ color: '#222' }}>
            {currentStep?.title || 'Step content coming soon'}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
