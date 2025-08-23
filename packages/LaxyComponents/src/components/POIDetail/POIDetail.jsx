import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Rating,
  Chip,
  Button,
  CircularProgress,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import POIHeader from './POIHeader.jsx';

// Function to extract domain from URL for display
const extractDomain = (url) => {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    // Remove 'www.' prefix if present
    let hostname = urlObj.hostname;
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    return hostname;
  } catch (error) {
    console.warn('Invalid URL:', url, error);
    return url; // Return original URL if parsing fails
  }
};

/**
 * POIDetail Component - Shared component for displaying POI details
 * 
 * @param {object} props - Component props
 * @param {function} props.useLanguage - Hook to get current language
 * @param {function} props.loadPOIData - Function to load POI data
 * @param {function} props.loadNativeLanguagePOI - Function to load native language POI data (optional)
 * @param {function} props.loadPOIRecommendations - Function to load POI recommendations (optional)
 * @param {function} props.getSuiteData - Function to get suite data (optional)
 * @param {function} props.getConfig - Function to get configuration data
 * @param {object} props.pageLayouts - Layout configuration
 * @param {object} props.contentPadding - Content padding configuration (optional)
 * @param {function} props.trackNavigation - Analytics function for tracking navigation (optional)
 * @param {function} props.trackContentInteraction - Analytics function for tracking content interaction (optional)
 * @param {function} props.onAddressClick - Custom handler for address click (optional)
 * @param {object} props.routeParams - Additional route parameters like suiteId (optional)
 * @param {function} props.renderCustomSections - Function to render custom sections (receives poi as argument) (optional)
 */
const POIDetail = ({
  useLanguage,
  loadPOIData,
  loadNativeLanguagePOI,
  loadPOIRecommendations,
  getSuiteData,
  getConfig,
  pageLayouts = {},
  contentPadding = {},
  trackNavigation = () => { /* no-op */ },
  trackContentInteraction = () => { /* no-op */ },
  onAddressClick,
  routeParams = {},
  renderCustomSections
}) => {
  const { language } = useLanguage();
  const { poiSlug, suiteId } = useParams();
  const { suiteId: routeSuiteId } = routeParams;
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [poi, setPOI] = useState(null);
  const [nativePOI, setNativePOI] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [poiRecommendationsData, setPOIRecommendationsData] = useState(null);
  
  // State for expandable text sections
  const [isRecommendationExpanded, setIsRecommendationExpanded] = useState(false);
  const [isHighlightExpanded, setIsHighlightExpanded] = useState(false);
  
  const config = getConfig(language);
  const pageConfig = config?.data?.pagPoiDetail;
  
  // Get read more/less labels from global component config
  const readMoreLabel = config?.data?.globalComponent?.readMoreLabel || 'Read more';
  const readLessLabel = config?.data?.globalComponent?.readLessLabel || 'Read less';
  const hostTagLabel = config?.data?.globalComponent?.hostTagLabel || 'Host';
  const audioGuideButtonLabel = config?.data?.globalComponent?.audioGuideButton?.label || 'Start Audio Guide with Laxy';
  const exploreMoreAboutLabel = config?.data?.globalComponent?.exploreMoreAboutLabel || 'Explore more about {{value}}?';

  // Get suite data for host avatar (if getSuiteData is provided)
  const suiteData = getSuiteData ? getSuiteData(suiteId || routeSuiteId, language) : null;
  const hostAvatar = suiteData?.details?.data?.[0]?.ownedBy?.avatar;

  // Load POI recommendations data based on current language (if loadPOIRecommendations is provided)
  useEffect(() => {
    if (loadPOIRecommendations) {
      const loadRecommendations = async () => {
        try {
          const data = await loadPOIRecommendations(language);
          setPOIRecommendationsData(data);
        } catch (err) {
          console.error(`Failed to load POI recommendations for language ${language}:`, err);
          setPOIRecommendationsData({ data: [] });
        }
      };

      loadRecommendations();
    }
  }, [language, loadPOIRecommendations]);

  // Function to get POI recommendation
  const getPOIRecommendation = useCallback((poiSlug) => {
    if (!poiRecommendationsData) return null;
    const recommendationItem = poiRecommendationsData.data.find(
      item => item.poi.slug === poiSlug
    );
    return recommendationItem ? recommendationItem.recommendation : null;
  }, [poiRecommendationsData]);

  useEffect(() => {
    const loadPOIDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const foundPOI = await loadPOIData(poiSlug, language, suiteId || routeSuiteId);
        
        if (!foundPOI) {
          setError(`Location with slug "${poiSlug}" not found in ${language} data.`);
          setPOI(null);
        } else {
          setPOI(foundPOI);
          
          // Debug: Log POI data to check laxyURL
          console.log('POI Data loaded:', foundPOI);
          console.log('LaxyURL:', foundPOI.laxyURL);
          
          // Track POI view
          trackNavigation(`poi_detail_${foundPOI.type || 'poi'}`, foundPOI.slug, 'direct_access');
          
          // Load native language POI data if available and function is provided
          if (loadNativeLanguagePOI && foundPOI.nativeLanguageCode && foundPOI.nativeLanguageCode !== language) {
            const nativeLanguagePOI = await loadNativeLanguagePOI(poiSlug, foundPOI.nativeLanguageCode, suiteId || routeSuiteId);
            setNativePOI(nativeLanguagePOI);
          }
          
          // Check for host recommendation if recommendations are loaded
          if (poiRecommendationsData) {
            const hostRecommendation = getPOIRecommendation(poiSlug);
            setRecommendation(hostRecommendation);
          }
        }
      } catch (err) {
        console.error(`Failed to load POI details for slug ${poiSlug} (lang: ${language}):`, err);
        setError('Failed to load information. Please try again later.');
        setPOI(null);
      }
      setLoading(false);
    };

    if (poiSlug && (!loadPOIRecommendations || poiRecommendationsData !== null)) {
      loadPOIDetails();
    }
  }, [language, poiSlug, suiteId, routeSuiteId, poiRecommendationsData, getPOIRecommendation, loadPOIData, loadNativeLanguagePOI, loadPOIRecommendations, trackNavigation]);

  // Helper function to render expandable text
  const renderExpandableText = (text, isExpanded, setIsExpanded, characterLimit = 300, isItalic = false) => {
    if (!text) return null;
    
    // Helper function to render text with line breaks and clickable URLs
    const renderTextWithLineBreaks = (content) => {
      return content.split('\n').map((line, lineIndex, array) => {
        // URL regex pattern to match URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = line.split(urlRegex);
        
        return (
          <React.Fragment key={lineIndex}>
            {parts.map((part, partIndex) => {
              if (urlRegex.test(part)) {
                // This is a URL, make it clickable
                const domain = extractDomain(part);
                return (
                  <Box
                    key={partIndex}
                    component="a"
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: theme.palette.primary.light,
                      textDecoration: 'underline',
                      '&:hover': {
                        textDecoration: 'none'
                      }
                    }}
                    onClick={() => trackContentInteraction('external_link_click', poi?.type || 'poi', part)}
                  >
                    {domain}
                  </Box>
                );
              } else {
                // Regular text
                return part;
              }
            })}
            {lineIndex < array.length - 1 && <br />}
          </React.Fragment>
        );
      });
    };
    
    if (text.length <= characterLimit) {
      return (
        <Typography 
          variant="body1" 
          component="div"
          sx={{ 
            fontStyle: isItalic ? 'italic' : 'normal',
            fontFamily: 'Commissioner, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: 1.6,
            textAlign: 'justify'
          }}
        >
          {renderTextWithLineBreaks(text)}
        </Typography>
      );
    }

    const truncatedText = text.substring(0, characterLimit);
    const displayText = isExpanded ? text : `${truncatedText}...`;

    return (
      <Box>
        <Typography 
          variant="body1" 
          component="div"
          sx={{ 
            fontStyle: isItalic ? 'italic' : 'normal',
            fontFamily: 'Commissioner, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: 1.6,
            textAlign: 'justify',
            mb: 1
          }}
        >
          {renderTextWithLineBreaks(displayText)}
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            p: 0,
            minWidth: 'auto',
            fontSize: '14px',
            fontWeight: 500,
            color: theme.palette.primary.light,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
              textDecoration: 'underline'
            }
          }}
        >
          {isExpanded ? readLessLabel : readMoreLabel}
        </Button>
      </Box>
    );
  };

  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const audioRef = React.useRef(null);

  const handlePlayAudio = () => {
    trackContentInteraction('audio_play', poi?.type || 'poi', poi?.slug || poiSlug);
    
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        trackContentInteraction('audio_pause', poi?.type || 'poi', poi?.slug || poiSlug);
      } else {
        audioRef.current.play();
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  const handleAddressClick = () => {
    if (onAddressClick) {
      onAddressClick(poi);
    } else if (suiteId || routeSuiteId) {
      navigate(`/${language}/${suiteId || routeSuiteId}/poi/${poi.slug}/address`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <POIHeader 
          pageLayouts={pageLayouts}
          trackNavigation={trackNavigation}
        />
        <Container {...pageLayouts.POIDetail} sx={{ px: 3 }}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', backgroundColor: 'error.light' }}>
            <RestaurantIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" color="error.contrastText">Error</Typography>
            <Typography color="error.contrastText">{error}</Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* POI Header with image and back button */}
      <POIHeader 
        coverPhoto={poi.coverPhoto}
        poiLabel={poi.label}
        pageLayouts={pageLayouts}
        trackNavigation={trackNavigation}
      />
      
      {/* Main Content Card */}
      <Container {...pageLayouts.POIDetail} sx={{ position: 'relative', mt: -4, px: 0 }}> {/* Remove horizontal padding for full width */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 4, // 16px radius
            overflow: 'hidden',
            position: 'relative',
            zIndex: 10,
            backgroundColor: '#F5F5F5', // Neutral/100 background
            px: 3, // 24px horizontal margin for whole content
            py: 3
            // Removed contentPadding.standard to prevent override
          }}
        >
          {/* POI Label */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="h1" sx={{ 
              fontFamily: 'Commissioner, sans-serif',
              fontWeight: 700,
              fontSize: '24px',
              flex: 1 
            }}>
              {poi.label}
            </Typography>
          </Box>

          {/* Native Label */}
          {nativePOI && nativePOI.label && nativePOI.label !== poi.label && (
            <Typography variant="body1" sx={{ 
              mb: 2, 
              fontFamily: 'Commissioner, sans-serif',
              fontWeight: 400,
              fontSize: '18px'
            }}>
              {nativePOI.label}
            </Typography>
          )}

          {/* Tag Labels */}
          {poi.tag_labels && poi.tag_labels.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Regular Tags */}
                {poi.tag_labels.map((tag) => (
                  <Chip 
                    key={tag.id || tag.name}
                    size="medium" 
                    label={tag.name || tag}
                    sx={{ 
                      fontSize: '16px',
                      fontFamily: 'Commissioner, sans-serif',
                      fontWeight: 400,
                      height: 28,
                      backgroundColor: '#9C9696',
                      color: '#ffffff',
                      borderRadius: '4px',
                      '& .MuiChip-label': {
                        paddingLeft: '8px',
                        paddingRight: '8px'
                      }
                    }}
                  />
                ))}
                
                {/* Host Tag */}
                {recommendation && (
                  <Chip 
                    size="small" 
                    label={hostTagLabel}
                    sx={{ 
                      fontSize: '16px',
                      fontFamily: 'Commissioner, sans-serif',
                      fontWeight: 400,
                      height: 28,
                      backgroundColor: '#ff6b47',
                      color: 'white',
                      borderRadius: '4px',
                      '& .MuiChip-label': {
                        paddingLeft: '8px',
                        paddingRight: '8px'
                      }
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Contact Information Sections */}
          {(poi.address || poi.externalURL || poi.dial) && (
            <Box sx={{ mb: 2 }}>
              {/* Address Section */}
              {poi.address && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      borderRadius: 1
                    },
                    py: 2,
                    ...(poi.externalURL || poi.dial ? {
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                      mb: 0
                    } : {})
                  }}
                  onClick={handleAddressClick}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    {pageConfig?.addressIcon ? (
                      <Box
                        component="img"
                        src={pageConfig.addressIcon.url}
                        alt="Address"
                        sx={{ width: 24, height: 24, mr: 1, color: theme.palette.primary.light }}
                      />
                    ) : (
                      <Box sx={{ width: 24, height: 24, bgcolor: theme.palette.primary.light, borderRadius: '50%', mr: 1 }} />
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        lineHeight: 1.6,
                        fontFamily: 'Commissioner, sans-serif',
                        fontWeight: 400,
                        fontSize: '16px',
                        textAlign: 'justify',
                        '&:hover': {
                          color: theme.palette.primary.light
                        }
                      }}
                    >
                      {poi.address}
                    </Typography>
                  </Box>
                  <ChevronRightIcon 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: 20,
                      ml: 1
                    }} 
                  />
                </Box>
              )}

              {/* External URL Section */}
              {poi.externalURL && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    py: 2,
                    ...(poi.dial ? {
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                      mb: 0
                    } : {})
                  }}
                >
                  {pageConfig?.urlIcon ? (
                    <Box
                      component="img"
                      src={pageConfig.urlIcon.url}
                      alt="Website"
                      sx={{ width: 24, height: 24, mr: 1, color: theme.palette.primary.light }}
                    />
                  ) : (
                    <Box sx={{ width: 24, height: 24, bgcolor: theme.palette.primary.light, borderRadius: '50%', mr: 1 }} />
                  )}
                  <Button 
                    variant="text" 
                    href={poi.externalURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ 
                      p: 0, 
                      textAlign: 'left', 
                      justifyContent: 'flex-start',
                      fontFamily: 'Commissioner, sans-serif',
                      fontWeight: 400,
                      fontSize: '16px',
                      color: '#423B3C',
                      '&:hover': {
                        color: '#423B3C'
                      }
                    }}
                  >
                    {extractDomain(poi.externalURL)}
                  </Button>
                </Box>
              )}

              {/* Phone Number Section */}
              {poi.dial && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    py: 2
                  }}
                >
                  <PhoneIcon sx={{ width: 24, height: 24, color: theme.palette.primary.light, mr: 1 }} />
                  <Button 
                    variant="text" 
                    href={`tel:${poi.dial}`}
                    sx={{ 
                      p: 0, 
                      textAlign: 'left', 
                      justifyContent: 'flex-start',
                      fontFamily: 'Commissioner, sans-serif',
                      fontWeight: 400,
                      fontSize: '16px',
                      color: '#423B3C',
                      '&:hover': {
                        color: '#423B3C'
                      }
                    }}
                  >
                    {poi.dial}
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Host Recommendation Section */}
          {recommendation && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography 
                  variant="h8" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '18px',
                    fontFamily: 'Inter, sans-serif',
                    color: theme.palette.primary.light 
                  }}
                >
                  {pageConfig?.recommendationHeading}
                </Typography>
                {hostAvatar && (
                  <Box 
                    component="img" 
                    src={hostAvatar.url}
                    alt="Host"
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      flexShrink: 0,
                      marginRight: 2
                    }} 
                  />
                )}
              </Box>
              <Box>
                {renderExpandableText(
                  recommendation, 
                  isRecommendationExpanded, 
                  setIsRecommendationExpanded,
                  250
                )}
              </Box>
            </Box>
          )}

          {/* Highlight Content */}
          {poi.highlight && (
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  fontSize: '18px',
                  fontFamily: 'Inter, sans-serif',
                  color: '#423B3C'
                }}
              >
                {pageConfig?.highlightHeading || 'About'}
              </Typography>
              {renderExpandableText(
                poi.highlight, 
                isHighlightExpanded, 
                setIsHighlightExpanded,
                400,
                false
              )}
            </Box>
          )}

          {poi.rating && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
              <Rating value={poi.rating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {poi.rating} ({poi.reviewCount || 0} reviews)
              </Typography>
            </Box>
          )}

          {poi.audioGuide && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<PlayCircleOutlineIcon />}
                onClick={handlePlayAudio}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {isPlayingAudio ? 'Stop Audio' : 'Listen to Audio Tour'}
              </Button>
              <audio ref={audioRef} src={poi.audioGuide} style={{ display: 'none' }} />
            </Box>
          )}

          {/* LaxyURL Section */}
          {poi.laxyURL && (
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 500,
                  color: 'text.primary',
                  textAlign: 'center'
                }}
              >
                {exploreMoreAboutLabel.replace('{{value}}', poi.label)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  trackContentInteraction('laxy_audio_guide_click', poi?.type || 'poi', poi?.slug || poiSlug);
                  window.open(poi.laxyURL, '_blank');
                }}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  mb: 2,
                  borderRadius: '50px'
                }}
              >
                {audioGuideButtonLabel}
              </Button>
            </Box>
          )}

          {/* Custom Sections */}
          {renderCustomSections && renderCustomSections(poi)}

          {/* Address Embed HTML */}
          {poi.addressEmbedHTML && (
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  fontSize: '18px',
                  fontFamily: 'Inter, sans-serif',
                  color: '#423B3C'
                }}
              >
                Location
              </Typography>
              <Box
                sx={{
                  '& iframe': {
                    width: '100%',
                    height: '300px',
                    border: 'none',
                    borderRadius: '8px'
                  }
                }}
                dangerouslySetInnerHTML={{ __html: poi.addressEmbedHTML }}
              />
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default POIDetail;
