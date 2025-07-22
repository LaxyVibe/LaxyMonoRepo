import React from 'react';
import { Card, CardContent, CardHeader, Box, Typography, Button, Grid } from '@mui/material';
import { Title, useRedirect } from 'react-admin';
import { Add as AddIcon, List as ListIcon } from '@mui/icons-material';
import LaxyLogo from './assets/logo.svg';

export const Dashboard = () => {
  const redirect = useRedirect();

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 } }}>
      <Title title="Laxy Studio" />
      
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <img 
            src={LaxyLogo} 
            alt="Laxy Logo" 
            style={{ 
              height: '48px', 
              width: '48px',
              filter: 'hue-rotate(240deg) saturate(1.2)' // Apply brand colors
            }} 
          />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#333' }}>
            Welcome to Laxy Studio
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your multilingual Points of Interest with ease
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardHeader 
              title="🗺️ POI Management" 
              subheader="Points of Interest Collection"
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '& .MuiCardHeader-subheader': { color: 'rgba(255,255,255,0.8)' }
              }}
            />
            <CardContent>
              <Typography variant="body2" paragraph>
                Manage your multilingual POI collection with full CRUD operations powered by Strapi 5.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>✨</span> Multilingual support (EN, 中文, 한국어, 日本語)
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🔍</span> Advanced search and filtering
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>📸</span> Media management with cover photos
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🏷️</span> Tag system and categorization
                </Typography>
              </Box>
              <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  startIcon={<ListIcon />}
                  onClick={() => redirect('/pois')}
                  size="small"
                >
                  View POIs
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={() => redirect('/pois/create')}
                  size="small"
                >
                  Add New
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardHeader 
              title="🌐 i18n Features" 
              subheader="Internationalization"
              sx={{ 
                background: 'linear-gradient(135deg, #4CAF50 30%, #8BC34A 90%)',
                color: 'white',
                '& .MuiCardHeader-subheader': { color: 'rgba(255,255,255,0.8)' }
              }}
            />
            <CardContent>
              <Typography variant="body2" paragraph>
                Built-in internationalization with automatic content switching.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🇺🇸</span> English (Default)
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🇹🇼</span> Traditional Chinese
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🇨🇳</span> Simplified Chinese
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🇰🇷</span> Korean
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🇯🇵</span> Japanese
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Switch languages using the selector in the top-right corner
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
