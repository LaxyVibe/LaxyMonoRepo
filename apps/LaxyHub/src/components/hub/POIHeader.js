import React from 'react';
import { 
  Box, 
  IconButton,
  Container
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { trackButtonClick, trackNavigation } from '../../utils/analytics';
import { PAGE_LAYOUTS } from '../../config/layout';

/**
 * POI Header component with background image and overlay back button
 * @param {object} coverPhoto - POI cover photo object with url
 * @param {string} poiLabel - POI label for alt text
 * @param {function} onBack - Custom back handler (optional)
 */
const POIHeader = ({ coverPhoto, poiLabel, onBack }) => {
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
    <Container {...PAGE_LAYOUTS.POIDetail} sx={{ px: 0 }}>
      <Box 
        sx={{ 
          position: 'relative',
          width: '100%',
          height: 300,
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
              zIndex: 2
            }}
          />
        )}
        
        {/* White Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0) 100%)',
            zIndex: 3
          }}
        />
        
        {/* Overlay Back Button */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 4,
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1
          }}
        >
          <IconButton
            onClick={handleBackClick}
            sx={{ 
              p: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)'
              }
            }}
          >
            <ArrowBackIcon 
              sx={{ 
                width: 24, 
                height: 24, 
                color: '#333333' 
              }} 
            />
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
};

export default POIHeader;
