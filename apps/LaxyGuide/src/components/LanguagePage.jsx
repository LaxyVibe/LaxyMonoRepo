import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { SUPPORTED_LANGUAGES } from '../utils/languageUtils';

// Language display names
const languageNames = {
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어', 
  'zh-Hant': '繁體中文',
  'zh-Hans': '简体中文'
};

const LanguagePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  const handleLanguageSelect = (newLanguage) => {
    setLanguage(newLanguage);
    // Navigate back to the previous page or home
    const from = location.state?.from || `/${newLanguage}`;
    navigate(from, { replace: true });
  };

  const handleBack = () => {
    navigate(`/${language}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Select Language / 言語選択
        </Typography>
        
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Choose your preferred language for LaxyGuide
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {SUPPORTED_LANGUAGES.map((langCode) => (
            <Grid item xs={12} sm={6} md={4} key={langCode}>
              <Button
                variant={language === langCode ? "contained" : "outlined"}
                fullWidth
                onClick={() => handleLanguageSelect(langCode)}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: language === langCode ? 600 : 400,
                  borderRadius: 2
                }}
              >
                {languageNames[langCode] || langCode}
              </Button>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={handleBack}
            sx={{ color: 'text.secondary' }}
          >
            Back to Guide
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LanguagePage;
