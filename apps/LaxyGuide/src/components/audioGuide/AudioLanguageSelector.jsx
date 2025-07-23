import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box
} from '@mui/material';
import { useAudioGuide } from '../../context/AudioGuideContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getFilteredAudioLanguages, FALLBACK_AUDIO_LANGUAGES } from '../../utils/audioLanguageUtils.js';

const AudioLanguageSelector = ({ open, onClose, availableLanguages = [] }) => {
  const { audioLanguage, setAudioLanguage } = useAudioGuide();
  const { language } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(audioLanguage);

  // Get dynamic audio languages from API configuration
  const configAudioLanguages = getFilteredAudioLanguages(language, availableLanguages);
  
  // Use config languages or fallback if none available
  const AUDIO_LANGUAGES = configAudioLanguages.length > 0 ? configAudioLanguages : FALLBACK_AUDIO_LANGUAGES;

  // Filter available languages based on what's provided
  const availableAudioLanguages = availableLanguages.length > 0 
    ? AUDIO_LANGUAGES.filter(lang => availableLanguages.includes(lang.code))
    : AUDIO_LANGUAGES;

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleApply = () => {
    setAudioLanguage(selectedLanguage);
    onClose();
  };

  const handleCancel = () => {
    setSelectedLanguage(audioLanguage); // Reset to current audio language
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Select Audio Language
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Choose the language for audio narration
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={selectedLanguage}
            onChange={handleLanguageChange}
            name="audio-language"
          >
            {availableAudioLanguages.map((language) => (
              <FormControlLabel
                key={language.code}
                value={language.code}
                control={<Radio color="primary" />}
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {language.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {language.code}
                    </Typography>
                  </Box>
                }
                sx={{
                  py: 1,
                  px: 2,
                  m: 0.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: selectedLanguage === language.code ? 'primary.main' : 'divider',
                  backgroundColor: selectedLanguage === language.code ? 'action.selected' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 2 }}>
        <Button 
          onClick={handleCancel}
          variant="outlined"
          sx={{ flex: 1 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleApply}
          variant="contained"
          sx={{ flex: 1 }}
          disabled={!selectedLanguage}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AudioLanguageSelector;
