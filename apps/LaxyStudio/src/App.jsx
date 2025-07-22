import React from 'react';
import { Admin, Resource, Layout, AppBar, TitlePortal } from 'react-admin';
import { Box, Typography } from '@mui/material';
import { Dashboard } from './Dashboard';
import { PoiList, PoiEdit, PoiShow, PoiCreate } from './components/Poi';
import { LocaleProvider, useLocale } from './context/LocaleContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { LocaleChangeIndicator } from './components/LocaleChangeIndicator';
import { createLocaleAwareDataProvider } from './localeAwareDataProvider';
import LaxyLogo from './assets/logo.svg';
import './App.css';

// Custom AppBar with Logo and Language Switcher only
const CustomAppBar = () => {

  return (
    <AppBar 
      sx={{ 
        '& .RaAppBar-toolbar': { 
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingX: { xs: 2, sm: 3 },
          paddingY: { xs: 1, sm: 1.5 },
          minHeight: { xs: 64, sm: 72 },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
        } 
      }}
      toolbar={
        <>
          {/* Language Switcher only */}
          <LanguageSwitcher />

          <Box sx={{ display: 'flex', alignItems: 'right', gap: 1.5 }}>
            <img 
              src={LaxyLogo} 
              alt="Laxy Logo" 
              style={{ 
                height: '48px', 
                width: '48px',
                marginLeft: '8px',
                filter: 'brightness(0) invert(1)' // Make logo white
              }} 
            />
          </Box>
        </>
      }
    >
    </AppBar>
  );
};

// Custom Layout with better spacing
const CustomLayout = (props) => (
  <Layout 
    {...props} 
    appBar={CustomAppBar}
    sx={{
      '& .RaLayout-content': {
        marginTop: { xs: '20px', sm: '28px' }, // Adjusted spacing below larger header
        padding: { xs: 2, sm: 3 },
      },
      // Style the left sidebar navigation
      '& .RaSidebar-root': {
        marginTop: { xs: '20px', sm: '28px' }, // Match content margin
        '& .RaSidebar-fixed': {
          marginTop: { xs: '20px', sm: '28px' }, // Ensure fixed sidebar also gets margin
        }
      },
      // Alternative: target the sidebar docked state
      '& .RaSidebar-docked': {
        marginTop: { xs: '20px', sm: '28px' }, // For docked sidebar
      },
      // Style the menu items in the sidebar
      '& .RaMenuItemLink-root': {
        marginTop: '8px',
        marginBottom: '4px',
        borderRadius: '8px',
        marginX: '8px',
        '&:first-of-type': {
          marginTop: '16px', // Extra margin for first item
        }
      },
      // Style the active menu item
      '& .RaMenuItemLink-active': {
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderLeft: '4px solid #667eea',
      }
    }}
  />
);

// Admin App with Locale Provider
const AdminApp = () => {
  const { currentLocale } = useLocale();
  
  // Use the locale-aware data provider directly
  const dataProvider = React.useMemo(() => {
    console.log('🔄 Creating data provider with locale:', currentLocale);
    return createLocaleAwareDataProvider(() => currentLocale);
  }, [currentLocale]);

  return (
    <Admin 
      dataProvider={dataProvider}
      dashboard={Dashboard}
      title="Laxy Studio"
      layout={CustomLayout}
      key={currentLocale} // Force re-render when locale changes
    >
      <Resource 
        name="pois" 
        list={PoiList} 
        edit={PoiEdit} 
        show={PoiShow} 
        create={PoiCreate}
        options={{ label: 'Points of Interest' }}
      />
    </Admin>
  );
};

function App() {
  return (
    <LocaleProvider>
      <AdminApp />
      <LocaleChangeIndicator />
    </LocaleProvider>
  );
}

export default App;
