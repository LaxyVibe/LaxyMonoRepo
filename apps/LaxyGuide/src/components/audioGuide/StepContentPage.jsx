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

  // If there is no content available for this step (after loading), redirect to player
  useEffect(() => {
    if (!isLoading && currentGuide && currentStep && !sanitizedStepHtml) {
      const aLang = urlAudioLanguage || audioLang || 'eng';
      if (langCode && tourId && stepId) {
        navigate(`/${langCode}/tour/${tourId}/${aLang}/step/${stepId}`, { replace: true });
      }
    }
  }, [isLoading, currentGuide, currentStep, sanitizedStepHtml, langCode, tourId, stepId, urlAudioLanguage, audioLang, navigate]);

  // Derive hero image and step number
  const heroImageUrl = useMemo(() => {
    const imgs = currentStep?.images || [];
    if (!imgs.length) return null;
    const first = imgs[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && first.url) return first.url;
    return null;
  }, [currentStep?.images]);

  const stepNumberPadded = useMemo(() => {
    if (!currentStep?.order) return null;
    return String(currentStep.order).padStart(3, '0');
  }, [currentStep?.order]);

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

  // Navigate to a related step (content page if available)
  const handleRelatedClick = (step) => {
    const aLang = urlAudioLanguage || audioLang || 'eng';
    const hasContent = (() => {
      const raw = step?.content;
      if (!raw) return false;
      if (typeof raw !== 'string') return !!raw;
      const text = raw.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').trim();
      return text.length > 0;
    })();
    const base = `/${langCode}/tour/${tourId}/${aLang}/step/${step.id}`;
    navigate(hasContent ? `${base}/content` : base);
  };

  // Compute related steps (previous and next)
  const relatedSteps = useMemo(() => {
    if (!steps || steps.length === 0 || currentStepIndex == null) return [];
    const items = [];
    if (currentStepIndex > 0) items.push(steps[currentStepIndex - 1]);
    if (currentStepIndex < steps.length - 1) items.push(steps[currentStepIndex + 1]);
    return items;
  }, [steps, currentStepIndex]);

  const getImageForStep = (step) => {
    const imgs = step?.images || [];
    if (!imgs.length) return null;
    const first = imgs[0];
    const raw = typeof first === 'string' ? first : (first && typeof first === 'object' ? first.url : null);
    if (!raw) return null;
    // Make absolute using S3 base URL when needed
    const isAbsolute = /^https?:\/\//i.test(raw);
    const base = currentGuide?.s3BaseUrl || '';
    return isAbsolute ? raw : (base ? `${base}${raw}` : null);
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
      {/* Hero image with overlay back button; if no image, render a slim top bar back button */}
      {heroImageUrl ? (
        <Box sx={{ width: '100%', position: 'relative', bgcolor: '#000' }}>
          <Box
            component="img"
            src={heroImageUrl}
            alt={currentStep?.title || 'Artwork'}
            sx={{ width: '100%', height: { xs: 220, sm: 280 }, objectFit: 'cover', display: 'block' }}
          />
          <IconButton
            onClick={handleBackClick}
            aria-label="Back to steps"
            sx={{
              position: 'absolute',
              top: { xs: 10, sm: 12 },
              left: { xs: 10, sm: 12 },
              color: '#fff',
              backgroundColor: 'rgba(0,0,0,0.4)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ px: 1.5, py: 1 }}>
          <IconButton
            onClick={handleBackClick}
            aria-label="Back to steps"
            sx={{ color: '#222', backgroundColor: 'rgba(0,0,0,0.04)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' } }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
      )}

      {/* Content */}
      <Box sx={{ maxWidth: 900, width: '100%', mx: 'auto', px: 2, py: 2, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
          {stepNumberPadded && (
            <Box sx={{
              backgroundColor: '#46B2BB',
              color: '#fff',
              px: 1.25,
              py: 0.25,
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: 12,
              lineHeight: '18px',
              minWidth: 44,
              textAlign: 'center'
            }}>
              {stepNumberPadded}
            </Box>
          )}
          <Typography variant="h5" sx={{ color: '#111', fontWeight: 700 }}>
            {currentStep?.title || 'Untitled'}
          </Typography>
        </Box>

        {/* Highlight heading */}
        <Typography variant="subtitle1" sx={{ color: '#111', fontWeight: 700, mb: 1 }}>
          Highlight
        </Typography>

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
                lineHeight: 1.8,
                fontSize: 16,
                fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
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
          <Typography variant="body1" sx={{ color: '#444' }}>
            {currentStep?.title || 'Step content coming soon'}
          </Typography>
        )}

        {/* Related section */}
        {relatedSteps.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#111', fontWeight: 700, mb: 1.25 }}>
              Related
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
              {relatedSteps
                .map((s) => ({ step: s, img: getImageForStep(s) }))
                .filter((x) => !!x.img)
                .map(({ step: s, img }) => (
                  <Box
                    key={s.id}
                    onClick={() => handleRelatedClick(s)}
                    sx={{
                      minWidth: 180,
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      alt={s.title || 'Related'}
                      sx={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
                    />
                    <Box sx={{ p: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box sx={{
                          backgroundColor: '#46B2BB',
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: 10,
                          px: 0.75,
                          py: 0.25,
                          fontWeight: 700,
                          minWidth: 38,
                          textAlign: 'center'
                        }}>
                          {String(s.order || '').padStart(3, '0')}
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.title || 'Step'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
