import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { colors } from '../../config/theme';

/**
 * Reusable navigation button component with consistent styling
 * Features 63px x 63px size with 3px #5FBCC4 border and hover effects
 */
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
      {iconUrl ? (
        <Box 
          component="img" 
          src={iconUrl} 
          alt={iconAlt || label}
          sx={{ 
            width: 63, 
            height: 63,
            mx: 'auto',
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
            mx: 'auto',
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
      {label && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            mt: { xs: 0.5, sm: 1 }, 
            display: 'block',
            opacity: disabled ? 0.6 : 1,
            fontFamily: 'Commissioner, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: 1.2,
            textAlign: 'center',
            width: '100%',
            mx: 'auto'
          }}
        >
          {label}
        </Typography>
      )}
    </Grid>
  );
};

export default NavigationButton;