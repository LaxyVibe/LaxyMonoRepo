import React from 'react';
import { Box, Fade, Typography, CircularProgress } from '@mui/material';
import { useLocale } from '../context/LocaleContext';

export const LocaleChangeIndicator = () => {
  const { isChanging, getCurrentLocaleInfo } = useLocale();

  return (
    <Fade in={isChanging}>
      <Box
        sx={{
          position: 'fixed',
          top: 80,
          right: 24,
          zIndex: 1400,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          minWidth: 200,
        }}
      >
        <CircularProgress size={20} thickness={4} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Switching to {getCurrentLocaleInfo().name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Updating content...
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};
