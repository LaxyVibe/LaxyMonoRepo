import React from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../../utils/languageUtils';
import { trackLanguageChange } from '../../utils/analytics';

// Language name mapping
const LANGUAGE_NAMES = {
  'en': 'English',
  'ja': '日本語', // Japanese
  'ko': '한국어', // Korean
};

/**
 * Language selector component
 * @param {Object} props - Component props
 * @param {Object} props.sx - MUI sx prop for styling
 */
const LanguageSelector = ({ sx = {} }) => {
  const { language, setLanguage } = useLanguage();

  const handleChange = (event) => {
    const newLanguage = event.target.value;
    const currentLanguage = language;
    
    // Track language change
    trackLanguageChange(currentLanguage, newLanguage);
    
    setLanguage(newLanguage);
  };

  return (
    <Box sx={{ minWidth: 120, ...sx }}>
      <FormControl fullWidth size="small">
        <Select
          value={language}
          onChange={handleChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Select language' }}
          sx={{ 
            borderRadius: 2,
            '& .MuiSelect-select': { 
              fontWeight: 'bold',
              py: 1
            }
          }}
        >
          {SUPPORTED_LANGUAGES.map((langCode) => (
            <MenuItem key={langCode} value={langCode}>
              {LANGUAGE_NAMES[langCode] || langCode.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector;
