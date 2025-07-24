import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';

const NavigationButton = ({
  icon,
  iconUrl,
  iconAlt,
  label,
  onClick,
  gridProps = { xs: 2.4 },
  iconSize = { xs: 24, sm: 28 },
  disabled = false,
  ...paperProps
}) => {
  return (
    <Grid item {...gridProps} sx={{ textAlign: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
        {/* Icon Container */}
        <Box sx={{ mb: { xs: 0.5, sm: 1 } }}>
          {iconUrl ? (
            <Box 
              component="img" 
              src={iconUrl} 
              alt={iconAlt || label}
              sx={{ 
                width: 63, 
                height: 63,
                display: 'block',
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.3s ease',
                '&:hover': disabled ? {} : {
                  transform: 'translateY(-2px)',
                },
                ...paperProps.sx
              }}
              onClick={disabled ? undefined : onClick}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 63,
                height: 63,
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.3s ease',
                '&:hover': disabled ? {} : {
                  transform: 'translateY(-2px)',
                },
                ...paperProps.sx
              }}
              onClick={disabled ? undefined : onClick}
            >
              {icon}
            </Box>
          )}
        </Box>
        
        {/* Label Container with fixed height for alignment */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '32px', // Fixed height for label area
          width: '100%'
        }}>
          {label && (
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                opacity: disabled ? 0.6 : 1,
                fontFamily: 'Commissioner, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: 1.2,
                textAlign: 'center',
                width: '100%',
                maxWidth: '63px',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                whiteSpace: 'normal'
              }}
            >
              {label}
            </Typography>
          )}
        </Box>
      </Box>
    </Grid>
  );
};

export default NavigationButton;