import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchClientInfo } from '../config/clients/hubClients';
import { getHubConfigByLanguage } from '../mocks/hub-application-config';
import { getAllSuites } from '../utils/suiteUtils';
import { DEFAULT_CLIENT_ID, DEFAULT_SUITE_ID } from '../config/constants';
import { PAGE_LAYOUTS, CONTENT_PADDING } from '../config/layout';
import { trackSuiteView, trackButtonClick, trackNavigation } from '../utils/analytics';

// ISO language codes to display names mapping for backward compatibility
const languageCodeToName = {
  "en": "English",
  "ja": "日本語",
  "ko": "한국어",
  "zh-Hant": "繁體中文",
  "zh-Hans": "简体中文"
};

// Translations for UI text
const translations = {
  "English": {
    title: 'Select Your Suite',
    availableSuites: 'Available Suites',
    suiteDescription: 'Please select a suite from the list below!'
  },
  "日本語": {
    title: 'スイートを選択',
    availableSuites: '利用可能なスイート',
    suiteDescription: '下記のリストからスイートをお選びください。'
  },
  "한국어": {
    title: '스위트 선택',
    availableSuites: '이용 가능한 스위트',
    suiteDescription: '아래 목록에서 스위트를 선택하세요.'
  },
  "繁體中文": {
    title: '選擇您的套房',
    availableSuites: '可用套房',
    suiteDescription: '請從下面的列表中選擇套房。'
  },
  "简体中文": {
    title: '选择您的套房',
    availableSuites: '可用套房',
    suiteDescription: '请从下面的列表中选择套房。'
  }
};

const HubLanding = ({ clientInfo: initialClientInfo }) => {
  const { language } = useLanguage();
  const currentLanguage = languageCodeToName[language] || "English";
  const hubConfig = getHubConfigByLanguage(language);
  const [clientInfo, setClientInfo] = useState(initialClientInfo);
  const [loading, setLoading] = useState(!initialClientInfo);
  const [error, setError] = useState(null);
  const [suites, setSuites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadClientInfo = async () => {
      try {
        // Use the default suite for hub landing
        const data = await fetchClientInfo(DEFAULT_CLIENT_ID, DEFAULT_SUITE_ID, language);
        setClientInfo(data);
        
        // Load suites from the folder structure instead of API
        const availableSuites = getAllSuites();
        setSuites(availableSuites);
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to load client info:", err);
        setError("Failed to load client information. Please try again later.");
        setLoading(false);
      }
    };

    if (!initialClientInfo) {
      loadClientInfo();
    } else {
      // If we have initialClientInfo, still load the suites
      const availableSuites = getAllSuites();
      setSuites(availableSuites);
    }
  }, [initialClientInfo, language]);

  const handleSuiteSelect = (suiteId) => {
    // Track suite selection
    trackButtonClick(`suite_${suiteId}`, 'hub_landing');
    trackNavigation('hub_landing', 'suite', 'suite_selection');
    trackSuiteView(suiteId, language);
    
    navigate(`/${language}/${suiteId}`);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  const sectionLabels = translations[currentLanguage];

  return (
    <Container {...PAGE_LAYOUTS.HubLanding}>
      <Box sx={{ ...CONTENT_PADDING.standard }}>
        <Paper elevation={3} sx={{ mb: 3, p: 3, borderRadius: 2, position: 'relative' }}>
          <Typography variant="h4" sx={{ mb: 1, textAlign: 'center' }}>
            {hubConfig?.pageLanding?.title || clientInfo?.title || 'Suite Selection'}
          </Typography>
        </Paper>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ justifyContent: 'center' }}>
          {suites.map((suite) => (
            <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={suite.id}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: { xs: '1px solid #e0e0e0', sm: 'none' },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: { xs: '0 4px 20px rgba(0,0,0,0.12)', sm: '0 6px 24px rgba(0,0,0,0.16)' },
                  }
                }}
                onClick={() => handleSuiteSelect(suite.id)}
              >
                {suite.image && (
                  <Box
                    sx={{
                      height: { xs: 200, sm: 200 },
                      backgroundImage: `url(${suite.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                )}
                <Box sx={{ p: { xs: 2, sm: 2 }, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1, fontSize: { xs: '1.1rem', sm: '1rem' } }}>
                    {suite.name}
                  </Typography>
                  {suite.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.75rem' } }}>
                      {suite.description}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      </Box>
    </Container>
  );
};

export default HubLanding;