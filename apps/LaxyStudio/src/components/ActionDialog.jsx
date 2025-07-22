import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography,
  Divider,
  Avatar
} from '@mui/material';
import { useRedirect } from 'react-admin';
import AiChatDialog from './AiChatDialog';

const ActionDialog = ({ 
  open, 
  onClose, 
  record, 
  resource = 'poi',
  title = 'Choose Action',
  subtitle = 'What would you like to do?',
  onLaxyAI
}) => {
  const redirect = useRedirect();

  const handleView = () => {
    if (record) {
      redirect(`/${resource}s/${record.documentId}/show`);
    }
    onClose();
  };

  const handleEdit = () => {
    if (record) {
      redirect(`/${resource}s/${record.documentId}`);
    }
    onClose();
  };

  const handleLaxyAI = () => {
    if (onLaxyAI) {
      onLaxyAI();
    }
  };

  const getRecordIcon = () => {
    if (!record) return '📄';
    
    switch (resource) {
      case 'poi':
        return record.type === 'restaurant' ? '🍴' : 
               record.type === 'attraction' ? '🎯' : '📍';
      default:
        return '📄';
    }
  };

  const getRecordTitle = () => {
    if (!record) return 'Unknown Item';
    return record.label || record.name || record.title || `${resource} #${record.id}`;
  };

  const getRecordSubtitle = () => {
    if (!record) return '';
    
    switch (resource) {
      case 'poi':
        const typeLabel = record.type === 'restaurant' ? 'Restaurant' : 
                         record.type === 'attraction' ? 'Attraction' : 
                         record.type || 'POI';
        return `${typeLabel}${record.address ? ` • ${record.address.substring(0, 50)}${record.address.length > 50 ? '...' : ''}` : ''}`;
      default:
        return record.description || record.slug || '';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', paddingBottom: 2, paddingTop: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              backgroundColor: '#f0f7ff',
              fontSize: '28px',
              border: '3px solid #e3f2fd'
            }}
          >
            {getRecordIcon()}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', marginTop: 0.5 }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ paddingX: 3, paddingY: 0 }}>
        {record && (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ 
              backgroundColor: '#f8f9fa', 
              borderRadius: 2, 
              padding: 3,
              border: '1px solid #e9ecef'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#1976d2',
                  marginBottom: 1,
                  wordBreak: 'break-word'
                }}
              >
                {getRecordTitle()}
              </Typography>
              {getRecordSubtitle() && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    lineHeight: 1.5
                  }}
                >
                  {getRecordSubtitle()}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        justifyContent: 'center', 
        gap: 2, 
        paddingX: 3,
        paddingY: 3,
        paddingTop: 3,
        flexWrap: 'wrap'
      }}>
        <Button
          onClick={handleView}
          variant="outlined"
          size="large"
          sx={{ 
            minWidth: '140px',
            height: '48px',
            color: '#1976d2',
            borderColor: '#1976d2',
            borderWidth: '2px',
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#f0f7ff',
              borderColor: '#1565c0',
              borderWidth: '2px',
            }
          }}
          startIcon={
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '18px' 
            }}>
              👁️
            </Box>
          }
        >
          View Details
        </Button>
        
        <Button
          onClick={handleEdit}
          variant="outlined"
          size="large"
          sx={{ 
            minWidth: '140px',
            height: '48px',
            color: '#1976d2',
            borderColor: '#1976d2',
            borderWidth: '2px',
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#f0f7ff',
              borderColor: '#1565c0',
              borderWidth: '2px',
            }
          }}
          startIcon={
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '18px' 
            }}>
              ✏️
            </Box>
          }
        >
          Edit
        </Button>

        <Button
          onClick={handleLaxyAI}
          variant="contained"
          size="large"
          sx={{ 
            minWidth: '140px',
            height: '48px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
            }
          }}
          startIcon={
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '18px',
              color: 'white'
            }}>
              ✨
            </Box>
          }
        >
          Laxy AI
        </Button>
      </DialogActions>

      <Box sx={{ textAlign: 'center', paddingBottom: 2 }}>
        <Button
          onClick={onClose}
          sx={{ 
            color: '#999',
            textTransform: 'none',
            fontSize: '14px',
            '&:hover': {
              backgroundColor: 'transparent',
              color: '#666'
            }
          }}
        >
          Cancel
        </Button>
      </Box>
    </Dialog>
  );
};

// Export ActionDialog with AiChatDialog wrapped separately
const ActionDialogWrapper = (props) => {
  const [aiChatOpen, setAiChatOpen] = useState(false);

  const handleLaxyAI = () => {
    setAiChatOpen(true);
    props.onClose();
  };

  const handleAiChatClose = () => {
    setAiChatOpen(false);
  };

  return (
    <>
      <ActionDialog {...props} onLaxyAI={handleLaxyAI} />
      <AiChatDialog
        open={aiChatOpen}
        onClose={handleAiChatClose}
        record={props.record}
      />
    </>
  );
};

export default ActionDialogWrapper;
