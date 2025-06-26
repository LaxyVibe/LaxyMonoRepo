import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { DEFAULT_LANGUAGE, extractLanguageFromPath } from './utils/languageUtils';
import GuideLanding from './components/GuideLanding.jsx';
import POIDetailGuide from './components/guide/POIDetailGuide.jsx';
import LanguagePage from './components/LanguagePage.jsx';

// Language redirect component
function DefaultLanguageRedirect() {
  const { pathname, search } = useLocation();
  
  const { langCode: currentLangCode, cleanedPathname } = extractLanguageFromPath(pathname);
  
  const langToUse = currentLangCode || DEFAULT_LANGUAGE;

  const redirectPath = cleanedPathname !== pathname
    ? `/${langToUse}${cleanedPathname}`
    : `/${langToUse}${pathname}`;
  
  return <Navigate to={`${redirectPath}${search}`} replace />;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <LanguageProvider>
          <Routes>
            <Route path="/" element={<DefaultLanguageRedirect />} />
            <Route path="/language" element={<LanguagePage />} />
            <Route path="/:langCode" element={<GuideLanding />} />
            <Route path="/:langCode/poi/:poiSlug" element={<POIDetailGuide />} />
            <Route path="*" element={<DefaultLanguageRedirect />} />
          </Routes>
        </LanguageProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;