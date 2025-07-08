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
      <Paper 
        elevation={1} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: { xs: 0.75, sm: 1.5 },
          borderRadius: '50%',
          width: { xs: 56, sm: 63 },
          height: { xs: 56, sm: 63 },
          mx: 'auto',
          border: `3px solid ${colors.primary[200]}`, // Using #5FBCC4
          backgroundColor: 'transparent',
          boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.3s ease',
          '&:hover': disabled ? {} : {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px rgba(95, 188, 196, 0.3)`,
            backgroundColor: 'rgba(95, 188, 196, 0.05)',
          },
          ...paperProps.sx
        }}
        onClick={disabled ? undefined : onClick}
        {...paperProps}
      >
        {iconUrl ? (
          <Box 
            component="img" 
            src={iconUrl} 
            alt={iconAlt || label}
            sx={{ 
              width: { xs: 20, sm: iconSize.xs || 24 }, 
              height: { xs: 20, sm: iconSize.xs || 24 },
              color: 'primary.main'
            }}
          />
        ) : (
          icon
        )}
      </Paper>
      {label && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            mt: { xs: 0.5, sm: 1 }, 
            display: 'block',
            opacity: disabled ? 0.6 : 1,
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            lineHeight: 1.2,
            maxWidth: { xs: 60, sm: 80 },
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