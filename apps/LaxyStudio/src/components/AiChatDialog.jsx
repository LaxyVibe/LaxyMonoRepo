import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import { Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';

const AiChatDialog = ({ open, onClose, record }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  console.log('AiChatDialog - record:', record);
  console.log('AiChatDialog - open:', open);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !record) return;

    setIsLoading(true);

    // Prepare the data to send to AI
    const aiPayload = {
      userMessage: userInput.trim(),
      poiData: {
        documentId: record.documentId,
        numericId: record.numericId,
        label: record.label,
        slug: record.slug,
        type: record.type,
        address: record.address,
        highlight: record.highlight,
        externalURL: record.externalURL,
        addressURL: record.addressURL,
        dial: record.dial,
        laxyURL: record.laxyURL,
        nativeLanguageCode: record.nativeLanguageCode,
        locale: record.locale,
        coverPhoto: record.coverPhoto,
        tag_labels: record.tag_labels,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }
    };

    // TODO: Replace with actual API call
    console.log('🤖 Sending to Laxy AI:', aiPayload);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setUserInput('');
    
    // TODO: Handle AI response
    console.log('✨ AI Response received (simulated)');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const getPoiIcon = () => {
    if (!record) return '📍';
    return record.type === 'restaurant' ? '🍴' : 
           record.type === 'attraction' ? '🎯' : '📍';
  };

  const getPoiImage = () => {
    if (!record?.coverPhoto) return null;
    return record.coverPhoto.url || 
           record.coverPhoto.formats?.thumbnail?.url || 
           record.coverPhoto.formats?.small?.url;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          height: '80vh',
          maxHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingY: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '24px'
          }}>
            ✨
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Laxy AI Assistant
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Ask me anything about this POI
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        padding: 0,
        height: '100%'
      }}>
        {/* POI Context (Compact) */}
        {record && (
          <Box sx={{ padding: 2, paddingBottom: 1, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="caption" sx={{ 
              color: '#999', 
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Context: {record.type === 'restaurant' ? '🍴 Restaurant' : record.type === 'attraction' ? '🎯 Attraction' : '📍 POI'}
            </Typography>
          </Box>
        )}

        <Divider sx={{ opacity: 0.3 }} />

        {/* Chat Area */}
        <Box sx={{ 
          flex: 1, 
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <Avatar sx={{ 
            width: 100, 
            height: 100,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontSize: '40px',
            marginBottom: 3
          }}>
            ✨
          </Avatar>
          <Typography variant="h5" sx={{ 
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: 2
          }}>
            Ready to help!
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#666',
            maxWidth: '400px',
            lineHeight: 1.6,
            fontSize: '16px'
          }}>
            Ask me anything about <strong>{record?.label || 'this POI'}</strong>. I can help with directions, recommendations, or answer any questions you have.
          </Typography>
        </Box>
      </DialogContent>

      {/* Attachment Chip - Separate Section */}
      {record && (
        <Box sx={{ 
          padding: '16px 24px 8px 24px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            padding: 2,
            backgroundColor: '#e3f2fd',
            borderRadius: 2,
            border: '2px solid #1976d2'
          }}>
            <Typography variant="body2" sx={{ 
              color: '#1976d2', 
              marginRight: 2,
              fontSize: '14px',
              fontWeight: 700
            }}>
              📎 ATTACHED:
            </Typography>
            <Chip
              avatar={
                getPoiImage() ? (
                  <Avatar
                    src={getPoiImage()}
                    sx={{ 
                      width: 28, 
                      height: 28
                    }}
                  />
                ) : (
                  <Avatar sx={{ 
                    width: 28, 
                    height: 28,
                    backgroundColor: '#1976d2',
                    fontSize: '14px',
                    color: 'white'
                  }}>
                    {getPoiIcon()}
                  </Avatar>
                )
              }
              label={record.label || 'POI'}
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: 'white',
                border: '2px solid #1976d2',
                color: '#1976d2',
                height: '36px',
                '& .MuiChip-avatar': {
                  marginLeft: '4px'
                }
              }}
            />
          </Box>
        </Box>
      )}

      <DialogActions sx={{ 
        padding: '8px 24px 24px 24px',
        display: 'flex',
        gap: 1
      }}>
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={3}
          placeholder="Ask me anything about this POI..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
                borderWidth: '2px',
              }
            }
          }}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!userInput.trim() || isLoading}
          variant="contained"
          sx={{
            minWidth: '60px',
            height: '56px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
            },
            '&:disabled': {
              background: '#e0e0e0',
              color: '#999'
            }
          }}
        >
          {isLoading ? (
            <Box sx={{ 
              width: 20, 
              height: 20, 
              border: '2px solid #fff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }} />
          ) : (
            <SendIcon />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AiChatDialog;
