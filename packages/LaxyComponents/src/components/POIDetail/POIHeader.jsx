import React from 'react';
import { 
  Box, 
  IconButton,
  Container
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

/**
 * POI Header component with background image and overlay back button
 * @param {object} coverPhoto - POI cover photo object with url
 * @param {string} poiLabel - POI label for alt text
 * @param {function} onBack - Custom back handler (optional)
 * @param {object} pageLayouts - Layout configuration
 * @param {function} trackButtonClick - Analytics function for tracking button clicks
 * @param {function} trackNavigation - Analytics function for tracking navigation
 */
const POIHeader = ({ 
  coverPhoto, 
  poiLabel, 
  onBack, 
  pageLayouts = {},
  trackButtonClick = () => { /* no-op */ },
  trackNavigation = () => { /* no-op */ }
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    trackButtonClick('poi_header_back_button', 'poi_header');
    
    if (onBack) {
      trackNavigation('poi_header', 'custom_back', 'back_button');
      onBack();
    } else {
      trackNavigation('poi_header', 'previous_page', 'back_button');
      navigate(-1);
    }
  };

  return (
    <Container {...pageLayouts.POIDetail} sx={{ px: 0 }}>
      <Box 
        sx={{ 
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          overflow: 'hidden',
          zIndex: 1
        }}
      >
        {/* Background Image */}
        {coverPhoto && (
          <Box
            component="img"
            src={coverPhoto.url}
            alt={poiLabel}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              zIndex: 1
            }}
          />
        )}
        
        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.5) 100%)',
            zIndex: 2
          }}
        />
        
        {/* Back Button */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10
          }}
        >
          <IconButton
            onClick={handleBackClick}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: 44,
              height: 44,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
};

export default POIHeader;
