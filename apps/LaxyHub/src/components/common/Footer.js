import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import logo from '../../assets/logo.svg';
import { useLanguage } from '../../context/LanguageContext';
import { getHubConfigByLanguage } from '../../mocks/hub-application-config';

const FooterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f7',
  marginTop: 'auto',
}));

const Footer = () => {
  const { language } = useLanguage();
  
  // Get hub configuration for current language
  const hubConfig = getHubConfigByLanguage(language);
  const poweredByLabelTemplate = hubConfig?.data?.globalComponent?.poweredByLabel || 'Powered by {{value}}';
  
  // Split the template around {{value}} to handle logo placement
  const parts = poweredByLabelTemplate.split('{{value}}');
  const beforeLogo = parts[0] || '';
  const afterLogo = parts[1] || '';

  return (
    <FooterContainer component="footer">
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
        style={{ 
          height: '40px',
          width: 'auto'
        }} 
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

export default Footer;
