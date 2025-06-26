import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import logo from '../../assets/logos/logo.svg';

const FooterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  marginTop: 'auto',
}));

/**
 * Common Footer component that can be shared across all apps
 * @param {string} poweredByText - Text template with {{value}} placeholder for logo
 * @param {Object} logoStyle - Custom styles for the logo
 * @param {Object} containerStyle - Custom styles for the footer container
 */
const CommonFooter = ({ 
  poweredByText = "Powered by {{value}}", 
  logoStyle = {},
  containerStyle = {}
}) => {
  // Split the template around {{value}} to handle logo placement
  const parts = poweredByText.split('{{value}}');
  const beforeLogo = parts[0] || '';
  const afterLogo = parts[1] || '';

  const defaultLogoStyle = {
    height: '40px',
    width: 'auto',
    ...logoStyle
  };

  return (
    <FooterContainer 
      component="footer" 
      sx={containerStyle}
    >
      {beforeLogo && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666', 
            marginRight: 1,
            fontSize: '0.875rem'
          }}
        >
          {beforeLogo}
        </Typography>
      )}
      <img 
        src={logo} 
        alt="Laxy" 
        style={defaultLogoStyle}
      />
      {afterLogo && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666', 
            marginLeft: 1,
            fontSize: '0.875rem'
          }}
        >
          {afterLogo}
        </Typography>
      )}
    </FooterContainer>
  );
};

export default CommonFooter;
