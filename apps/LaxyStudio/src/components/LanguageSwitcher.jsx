import React, { useState } from 'react';
import { 
  Box, 
  Select, 
  MenuItem, 
  Typography,
  Chip,
  Tooltip,
  ButtonGroup,
  IconButton,
  Menu,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  Language as LanguageIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useLocale } from '../context/LocaleContext';
import { useRefresh } from 'react-admin';

export const LanguageSwitcher = () => {
  const { currentLocale, changeLocale, availableLocales, getCurrentLocaleInfo } = useLocale();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isChanging, setIsChanging] = useState(false);
  const refresh = useRefresh();
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLocaleChange = async (localeCode) => {
    if (localeCode === currentLocale) {
      handleClose();
      return;
    }

    setIsChanging(true);
    changeLocale(localeCode);
    
    // Auto refresh data after locale change
    setTimeout(() => {
      refresh();
      setIsChanging(false);
      handleClose();
    }, 300);
  };

  const currentInfo = getCurrentLocaleInfo();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <Tooltip title="Switch Language / 切换语言 / 언어 변경 / 言語を変更">
        <IconButton
          onClick={handleClick}
          size="medium"
          sx={{ 
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              transform: 'translateY(-1px)',
            },
            borderRadius: '8px',
            px: { xs: 1, sm: 1.5 },
            py: 0.5,
            minWidth: { xs: 80, sm: 120 },
            justifyContent: 'space-between',
            height: 40,
            transition: 'all 0.2s ease-in-out',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
          disabled={isChanging}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isChanging ? (
              <CircularProgress size={16} sx={{ color: 'white' }} />
            ) : (
              <>
                <span style={{ fontSize: '18px' }}>{currentInfo.flag}</span>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 500,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  {currentInfo.name}
                </Typography>
                <Chip 
                  label={currentLocale}
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem', 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    '& .MuiChip-label': {
                      px: 0.5
                    }
                  }}
                />
              </>
            )}
          </Box>
          {!isChanging && <ExpandMoreIcon sx={{ fontSize: 16, color: 'white' }} />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            maxWidth: 280,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.05)',
            borderRadius: 2,
          }
        }}
      >
        <Box sx={{ px: 2, py: 1, backgroundColor: '#f8f9fa' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageIcon fontSize="small" />
            Select Language
          </Typography>
        </Box>
        <Divider />
        
        {availableLocales.map((locale) => {
          const isSelected = locale.code === currentLocale;
          return (
            <MenuItem 
              key={locale.code} 
              onClick={() => handleLocaleChange(locale.code)}
              sx={{
                py: 1.5,
                px: 2,
                backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <span style={{ fontSize: '20px' }}>{locale.flag}</span>
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                      {locale.name}
                    </Typography>
                    <Chip 
                      label={locale.code}
                      size="small"
                      variant={isSelected ? "filled" : "outlined"}
                      color={isSelected ? "primary" : "default"}
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        '& .MuiChip-label': {
                          px: 0.5
                        }
                      }}
                    />
                  </Box>
                }
                secondary={
                  locale.code === 'en' ? 'English' :
                  locale.code === 'zh-Hant' ? 'Traditional Chinese' :
                  locale.code === 'zh-Hans' ? 'Simplified Chinese' :
                  locale.code === 'ko' ? 'Korean' :
                  locale.code === 'ja' ? 'Japanese' : ''
                }
              />
              {isSelected && (
                <CheckIcon 
                  sx={{ 
                    fontSize: 16, 
                    color: 'primary.main',
                    ml: 1 
                  }} 
                />
              )}
            </MenuItem>
          );
        })}
        
        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span style={{ fontSize: '12px' }}>🌐</span>
            Content will auto-refresh
          </Typography>
        </Box>
      </Menu>
    </Box>
  );
};
