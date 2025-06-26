import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PhoneIcon from '@mui/icons-material/Phone';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import POIHeader from './POIHeader.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getPOIDetails } from '../../utils/poiGuideService.js';
import { getHubConfigByLanguage } from '../../mocks/guide-application-config/index.js';
import { CONTAINER_CONFIG } from '../../config/layout.js';

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
    console.warn('Invalid URL:', url);
    return url; // Return original URL if parsing fails
  }
};

const POIDetail = () => {
  const { language } = useLanguage();
  const { poiSlug } = useParams();
  const navigate = useNavigate();
  
  const [poi, setPOI] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for expandable text sections
  const [isHighlightExpanded, setIsHighlightExpanded] = useState(false);
  
  const guideConfig = getHubConfigByLanguage(language);
  const pageConfig = guideConfig?.data?.pagPoiDetail;
  
  // Get read more/less labels from global component config
  const readMoreLabel = guideConfig?.data?.globalComponent?.readMoreLabel || 'Read more';
  const readLessLabel = guideConfig?.data?.globalComponent?.readLessLabel || 'Read less';

  useEffect(() => {
    const loadPOIDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Loading POI details for slug: "${poiSlug}" in language: "${language}"`);
        const foundPOI = await getPOIDetails(poiSlug, language);
        console.log('Found POI:', foundPOI);
        
        if (!foundPOI) {
          setError(`Location with slug "${poiSlug}" not found in ${language} data.`);
          setPOI(null);
        } else {
          setPOI(foundPOI);
        }
      } catch (err) {
        console.error(`Failed to load POI details for slug ${poiSlug} (lang: ${language}):`, err);
        setError('Failed to load information. Please try again later.');
        setPOI(null);
      }
      setLoading(false);
    };

    if (poiSlug) {
      loadPOIDetails();
    }
  }, [language, poiSlug]);

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
                      color: 'primary.main',
                      textDecoration: 'underline',
                      '&:hover': {
                        textDecoration: 'none'
                      }
                    }}
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
            lineHeight: 1.6
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
            color: 'primary.main',
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
        <POIHeader />
        <Container {...CONTAINER_CONFIG.wide}>
          <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', backgroundColor: 'error.light' }}>
              <Typography variant="h6" color="error.contrastText">Error</Typography>
              <Typography color="error.contrastText">{error}</Typography>
            </Paper>
          </Box>
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
      />
      
      {/* Main Content Card */}
      <Container {...CONTAINER_CONFIG.wide} sx={{ position: 'relative', mt: -8 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 4, // 16px radius
            overflow: 'hidden',
            position: 'relative',
            zIndex: 10,
            backgroundColor: '#F5F5F5', // Neutral/100 background
            p: 3
          }}
        >
          {/* POI Label */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mt: 3 }}>
            <Typography variant="h6" component="h1" sx={{ 
              fontFamily: 'Commissioner, sans-serif',
              fontWeight: 700,
              fontSize: '24px',
              flex: 1 
            }}>
              {poi.label}
            </Typography>
          </Box>

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
                    px: 1,
                    py: 2,
                    mx: -1,
                    ...(poi.externalURL || poi.dial ? {
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                      mb: 0
                    } : {})
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    {pageConfig?.addressIcon ? (
                      <Box
                        component="img"
                        src={pageConfig.addressIcon.url}
                        alt="Address"
                        sx={{ width: 24, height: 24, mr: 1, color: 'primary.main' }}
                      />
                    ) : (
                      <Box sx={{ width: 24, height: 24, bgcolor: 'primary.main', borderRadius: '50%', mr: 1 }} />
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        lineHeight: 1.6,
                        fontFamily: 'Commissioner, sans-serif',
                        fontWeight: 400,
                        fontSize: '16px',
                        '&:hover': {
                          color: 'primary.main'
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
                    px: 1,
                    py: 2,
                    mx: -1,
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
                      sx={{ width: 24, height: 24, mr: 1, color: 'primary.main' }}
                    />
                  ) : (
                    <Box sx={{ width: 24, height: 24, bgcolor: 'primary.main', borderRadius: '50%', mr: 1 }} />
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
                      fontSize: '16px'
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
                    px: 1,
                    py: 2,
                    mx: -1
                  }}
                >
                  <PhoneIcon sx={{ width: 24, height: 24, color: 'primary.main', mr: 1 }} />
                  <Button 
                    variant="text" 
                    href={`tel:${poi.dial}`}
                    sx={{ 
                      p: 0, 
                      textAlign: 'left', 
                      justifyContent: 'flex-start',
                      fontFamily: 'Commissioner, sans-serif',
                      fontWeight: 400,
                      fontSize: '16px'
                    }}
                  >
                    {poi.dial}
                  </Button>
                </Box>
              )}
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
                Explore more about {poi.label}?
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  window.open(poi.laxyURL, '_blank');
                }}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  mb: 2
                }}
              >
                Start Audio Guide with Laxy
              </Button>
            </Box>
          )}

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
