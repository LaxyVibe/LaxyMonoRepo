import React, { useEffect } from 'react';
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, useParams, useLocation, Navigate } from 'react-router-dom';
import HubLanding from './components/HubLanding';
import SuiteLanding from './components/SuiteLanding';
import StayInfo from './components/hub/StayInfo';
import AddressInfo from './components/hub/AddressInfo';
import CheckInOutInfo from './components/hub/CheckInOutInfo';
import HouseRulesInfo from './components/hub/HouseRulesInfo';
import DirectContactInfo from './components/hub/DirectContactInfo';
import AmenitiesInfo from './components/hub/AmenitiesInfo';
import FAQInfo from './components/hub/FAQInfo';
import POIDetailHub from './components/hub/POIDetailHub';
import POIAddressInfo from './components/hub/POIAddressInfo';
import POIList from './components/common/POIList';
import SearchPage from './components/SearchPage';
import SearchResultPage from './components/SearchResultPage';
import LanguagePage from './components/LanguagePage';
import HubFooter from './components/common/HubFooter.jsx';
import { getHubClientInfo } from './config/clients';
import { getPOIsByType } from './utils/dataFetcher';
import { LanguageProvider } from './context/LanguageContext';
import { DEFAULT_LANGUAGE, extractLanguageFromPath } from './utils/languageUtils';
import { DEFAULT_SUITE_ID, DEFAULT_CLIENT_ID } from './config/constants';
import { theme } from './config/theme';
import { getHubConfigByLanguage } from './mocks/hub-application-config';
import usePageTracking from './hooks/usePageTracking';

// ScrollToTop component to handle scrolling to top on route changes and GA tracking
function ScrollToTop() {
  const { pathname } = useLocation();
  
  // Use the page tracking hook
  usePageTracking();
  
  useEffect(() => {
    // Add class to disable smooth scrolling temporarily
    document.documentElement.classList.add('scroll-to-top');
    
    // Use requestAnimationFrame to ensure the scroll happens after the DOM is updated
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      
      // Also try scrolling the body element in case of any layout issues
      if (document.body.scrollTop !== 0) {
        document.body.scrollTop = 0;
      }
      if (document.documentElement.scrollTop !== 0) {
        document.documentElement.scrollTop = 0;
      }
    };
    
    // First attempt - immediate scroll
    scrollToTop();
    
    // Second attempt - after animation frame (for any delayed renders)
    const rafId = requestAnimationFrame(() => {
      scrollToTop();
      
      // Remove the class to restore smooth scrolling after scroll is complete
      setTimeout(() => {
        document.documentElement.classList.remove('scroll-to-top');
      }, 100);
    });
    
    return () => {
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove('scroll-to-top');
    };
  }, [pathname]);
  
  return null;
}

// Wrapper components to handle nested routes
function HubWrapper() {
  const { langCode } = useParams();
  const { pathname } = useLocation();
  const hostname = window.location.hostname;
  
  // Extract the cleaned pathname without the language code for client info
  const { cleanedPathname } = extractLanguageFromPath(pathname);
  
  // For hub landing, use the default suite
  const defaultSuiteId = DEFAULT_SUITE_ID;
  
  const clientInfo = {
    ...getHubClientInfo(hostname, cleanedPathname, langCode, defaultSuiteId),
    language: langCode
  };
  
  return <HubLanding clientInfo={clientInfo} />;
}

function SuiteWrapper() {
  const { suiteId, langCode } = useParams();
  const { pathname } = useLocation();
  const hostname = window.location.hostname;
  
  // Extract the cleaned pathname without the language code and suiteId for client info
  const { cleanedPathname } = extractLanguageFromPath(pathname.replace(`/${suiteId}`, ''));
  
  return <SuiteLanding clientInfo={{
    ...getHubClientInfo(hostname, cleanedPathname, langCode, suiteId),
    language: langCode,
    suiteId
  }} />;
}

// Wrapper components for new hub routes
function StayInfoWrapper() {
  // The StayInfo component now reads data directly from the URL params and hub config
  return <StayInfo />;
}

function AddressInfoWrapper() {
  return <AddressInfo />;
}

function CheckInOutInfoWrapper() {
  return <CheckInOutInfo />;
}

function HouseRulesInfoWrapper() {
  return <HouseRulesInfo />;
}

function DirectContactInfoWrapper() {
  return <DirectContactInfo />;
}

function AmenitiesInfoWrapper() {
  return <AmenitiesInfo />;
}

function FAQInfoWrapper() {
  return <FAQInfo />;
}

function SearchWrapper() {
  return <SearchPage />;
}

function SearchResultWrapper() {
  return <SearchResultPage />;
}

function RestaurantsWrapper() {
  const { suiteId: urlSuiteId, langCode } = useParams();
  const location = useLocation();
  // Get suiteId from either URL params or from navigation state (for the new route structure)
  const suiteId = urlSuiteId || (location.state && location.state.suiteId);
  const [pois, setPois] = React.useState([]);
  const [title, setTitle] = React.useState('Nearby Restaurants');
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchPOIs = async () => {
      try {
        const result = await getPOIsByType(DEFAULT_CLIENT_ID, suiteId, 'restaurant', langCode || DEFAULT_LANGUAGE);
        setPois(result.pois);
        
        // Get title from hub-application-config
        const hubConfig = getHubConfigByLanguage(langCode || DEFAULT_LANGUAGE);
        const foodsNav = hubConfig?.data?.pageLanding?.naviagtion?.find(item => item.route === "/nearby-restaurants");
        setTitle(foodsNav?.label || result.title || 'Nearby Restaurants');
      } catch (error) {
        console.error("Failed to fetch restaurant POIs:", error);
        setPois([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPOIs();
  }, [langCode, suiteId]);

  if (loading) {
    return (
      <POIList 
        pois={[]}
        title={title}
        type="restaurant"
        suiteId={suiteId}
        loading={true}
      />
    );
  }
  
  return (
    <POIList 
      pois={pois}
      title={title}
      type="restaurant"
      suiteId={suiteId}
      loading={false}
    />
  );
}


function POIDetailWrapper() {
  return <POIDetailHub />;
}

function POIAddressInfoWrapper() {
  return <POIAddressInfo />;
}

function PlacesWrapper() {
  const { suiteId: urlSuiteId, langCode } = useParams();
  const location = useLocation();
  // Get suiteId from either URL params or from navigation state (for the new route structure)
  const suiteId = urlSuiteId || (location.state && location.state.suiteId);
  const [pois, setPois] = React.useState([]);
  const [title, setTitle] = React.useState('Nearby Attractions');
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchPOIs = async () => {
      try {
        const result = await getPOIsByType(DEFAULT_CLIENT_ID, suiteId || DEFAULT_SUITE_ID, 'attraction', langCode || DEFAULT_LANGUAGE);
        setPois(result.pois);
        
        // Get title from hub-application-config
        const hubConfig = getHubConfigByLanguage(langCode || DEFAULT_LANGUAGE);
        const spotsNav = hubConfig?.data?.pageLanding?.naviagtion?.find(item => item.route === "/nearby-attractions");
        setTitle(spotsNav?.label || result.title || 'Nearby Attractions');
      } catch (error) {
        console.error("Failed to fetch attraction POIs:", error);
        setPois([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPOIs();
  }, [langCode, suiteId]);

  if (loading) {
    return (
      <POIList 
        pois={[]}
        title={title}
        type="attraction"
        suiteId={suiteId}
        loading={true}
      />
    );
  }
  
  return (
    <POIList 
      pois={pois}
      title={title}
      type="attraction"
      suiteId={suiteId}
      loading={false}
    />
  );
}


// Language Page wrapper component
function LanguagePageWrapper() {
  return <LanguagePage />;
}

// Language redirect component to handle default routing
function DefaultLanguageRedirect() {
  const { pathname, search } = useLocation();
  
  const { langCode: currentLangCode, cleanedPathname } = extractLanguageFromPath(pathname);
  
  // Get path segments to analyze the URL structure
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  
  // Check if the first segment is one of the known hub navigation routes
  const isHubNavigationRoute = [
    "info", "nearby-restaurants", "nearby-attractions", "tours"
  ].includes(firstSegment);

  const langToUse = currentLangCode || DEFAULT_LANGUAGE;

  // If it's a hub navigation route, we need to insert the language code at the beginning
  if (isHubNavigationRoute) {
    const redirectPath = `/${langToUse}${pathname}`;
    return <Navigate to={redirectPath} replace />;
  }
  
  // Otherwise use the traditional language-based routing
  const hasPotentialLanguageCode = pathSegments.length > 0 && 
                                  /^[a-z]{2}(-[A-Z]{2})?$/.test(firstSegment);
  
  const redirectPath = cleanedPathname !== pathname
    ? `/${langToUse}${cleanedPathname}`
    : hasPotentialLanguageCode
      ? `/${langToUse}/${pathSegments.slice(1).join('/')}`
      : `/${langToUse}${pathname}`;
      
  return <Navigate to={`${redirectPath}${search}`} replace />;
}

function App() {
  const getRouteConfig = () => {
    return (
      <Routes>
        <Route path="/" element={<DefaultLanguageRedirect />} />
        
        {/* Direct routes for hub navigation with language redirect */}
        <Route path="/info" element={<DefaultLanguageRedirect />} />
        <Route path="/info/address" element={<DefaultLanguageRedirect />} />
        <Route path="/info/check-in-out" element={<DefaultLanguageRedirect />} />
        <Route path="/info/house-rules" element={<DefaultLanguageRedirect />} />
        <Route path="/info/direct-contact" element={<DefaultLanguageRedirect />} />
        <Route path="/info/amenities" element={<DefaultLanguageRedirect />} />
        <Route path="/info/faq" element={<DefaultLanguageRedirect />} />
        <Route path="/nearby-restaurants" element={<DefaultLanguageRedirect />} />
        <Route path="/nearby-attractions" element={<DefaultLanguageRedirect />} />
        <Route path="/search" element={<DefaultLanguageRedirect />} />
        <Route path="/search/*" element={<DefaultLanguageRedirect />} />
        
        <Route path="/:langCode">
          <Route index element={<HubWrapper />} />
          <Route path="language" element={<LanguagePageWrapper />} />
          <Route path=":suiteId">
            <Route index element={<SuiteWrapper />} />
            <Route path="language" element={<LanguagePageWrapper />} />
            <Route path="poi/:poiSlug" element={<POIDetailWrapper />} />
            <Route path="poi/:poiSlug/address" element={<POIAddressInfoWrapper />} />
            {/* Routes based on hub-application-config navigation */}
            <Route path="info">
              <Route index element={<StayInfoWrapper />} />
              <Route path="address" element={<AddressInfoWrapper />} />
              <Route path="check-in-out" element={<CheckInOutInfoWrapper />} />
              <Route path="house-rules" element={<HouseRulesInfoWrapper />} />
              <Route path="direct-contact" element={<DirectContactInfoWrapper />} />
              <Route path="amenities" element={<AmenitiesInfoWrapper />} />
              <Route path="faq" element={<FAQInfoWrapper />} />
            </Route>
            <Route path="nearby-restaurants" element={<RestaurantsWrapper />} />
            <Route path="nearby-attractions" element={<PlacesWrapper />} />
            <Route path="search">
              <Route index element={<SearchWrapper />} />
              <Route path="result" element={<SearchResultWrapper />} />
            </Route>
            
            {/* Legacy routes for backward compatibility */}
            <Route path="*" element={<SuiteWrapper />} />
          </Route>
        </Route>
        <Route path="/:suiteId/*" element={<DefaultLanguageRedirect />} />
        <Route path="*" element={<DefaultLanguageRedirect />} />
      </Routes>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <BrowserRouter>
          <ScrollToTop />
          <LanguageProvider>
            {getRouteConfig()}
            <HubFooter />
          </LanguageProvider>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;