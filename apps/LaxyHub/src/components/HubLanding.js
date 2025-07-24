import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress,
  TextField,
  Button,
  Alert
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
    suiteDescription: 'Please select a suite from the list below!',
    passcodeTitle: 'Enter Passcode',
    passcodeDescription: 'Please enter your 4-digit passcode to continue',
    passcodeError: 'Invalid passcode. Please try again.',
    enterPasscode: 'Enter Passcode'
  },
  "日本語": {
    title: 'スイートを選択',
    availableSuites: '利用可能なスイート',
    suiteDescription: '下記のリストからスイートをお選びください。',
    passcodeTitle: 'パスコードを入力',
    passcodeDescription: '続行するには4桁のパスコードを入力してください',
    passcodeError: '無効なパスコードです。もう一度お試しください。',
    enterPasscode: 'パスコード入力'
  },
  "한국어": {
    title: '스위트 선택',
    availableSuites: '이용 가능한 스위트',
    suiteDescription: '아래 목록에서 스위트를 선택하세요.',
    passcodeTitle: '패스코드 입력',
    passcodeDescription: '계속하려면 4자리 패스코드를 입력하세요',
    passcodeError: '잘못된 패스코드입니다. 다시 시도해 주세요.',
    enterPasscode: '패스코드 입력'
  },
  "繁體中文": {
    title: '選擇您的套房',
    availableSuites: '可用套房',
    suiteDescription: '請從下面的列表中選擇套房。',
    passcodeTitle: '輸入密碼',
    passcodeDescription: '請輸入您的4位數密碼以繼續',
    passcodeError: '密碼無效。請重試。',
    enterPasscode: '輸入密碼'
  },
  "简体中文": {
    title: '选择您的套房',
    availableSuites: '可用套房',
    suiteDescription: '请从下面的列表中选择套房。',
    passcodeTitle: '输入密码',
    passcodeDescription: '请输入您的4位数密码以继续',
    passcodeError: '密码无效。请重试。',
    enterPasscode: '输入密码'
  }
};

// Default passcode (you can change this or make it configurable)
const DEFAULT_PASSCODE = '1234';

const HubLanding = ({ clientInfo: initialClientInfo }) => {
  const { language } = useLanguage();
  const currentLanguage = languageCodeToName[language] || "English";
  const hubConfig = getHubConfigByLanguage(language);
  const [clientInfo, setClientInfo] = useState(initialClientInfo);
  const [loading, setLoading] = useState(!initialClientInfo);
  const [error, setError] = useState(null);
  const [suites, setSuites] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
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

  const handlePasscodeChange = (event) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 4);
    setPasscode(value);
    setPasscodeError('');
  };

  const handlePasscodeSubmit = (event) => {
    event.preventDefault();
    if (passcode === DEFAULT_PASSCODE) {
      setIsAuthenticated(true);
      setPasscodeError('');
    } else {
      setPasscodeError(translations[currentLanguage].passcodeError);
      setPasscode('');
    }
  };

  // Show passcode screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 3 }}>
          <Box component="form" onSubmit={handlePasscodeSubmit} sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 'medium' }}>
              {translations[currentLanguage].passcodeTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {translations[currentLanguage].passcodeDescription}
            </Typography>
            
            {passcodeError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passcodeError}
              </Alert>
            )}
            
            <TextField
              value={passcode}
              onChange={handlePasscodeChange}
              placeholder="----"
              variant="outlined"
              type="password"
              inputProps={{
                maxLength: 4,
                style: { 
                  textAlign: 'center', 
                  fontSize: '1.5rem', 
                  letterSpacing: '0.5rem',
                  fontFamily: 'monospace'
                }
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.5rem',
                  borderRadius: 2,
                }
              }}
              fullWidth
              autoComplete="off"
              autoFocus
            />
            
            <Button
              type="submit"
              variant="contained"
              disabled={passcode.length !== 4}
              sx={{ 
                py: 1.5, 
                fontSize: '1rem',
                borderRadius: 2,
                textTransform: 'none'
              }}
              fullWidth
            >
              {translations[currentLanguage].enterPasscode}
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

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
        <Grid container spacing={{ xs: 1, sm: 3 }} sx={{ justifyContent: 'center' }}>
          {suites.map((suite) => (
            <Grid item xs={6} sm={6} md={6} lg={4} xl={3} key={suite.id}>
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
                      height: { xs: 150, sm: 200 },
                      backgroundImage: `url(${suite.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                )}
                <Box sx={{ p: { xs: 1.5, sm: 2 }, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {suite.name}
                  </Typography>
                  {suite.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }}>
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