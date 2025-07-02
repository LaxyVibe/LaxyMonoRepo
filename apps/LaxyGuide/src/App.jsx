import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { AudioGuideProvider } from './context/AudioGuideContext.jsx';
import { DEFAULT_LANGUAGE, extractLanguageFromPath } from './utils/languageUtils';
import GuideLanding from './components/GuideLanding.jsx';
import POIDetailGuide from './components/guide/POIDetailGuide.jsx';
import POICover from './components/guide/POICover.jsx';
import TourCover from './components/guide/TourCover.jsx';
import StepList from './components/guide/StepList.jsx';
import LanguagePage from './components/LanguagePage.jsx';
import MiniAudioPlayer from './components/audioGuide/MiniAudioPlayer.jsx';
import AudioGuidePage from './components/audioGuide/AudioGuidePage.jsx';

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
          <AudioGuideProvider>
            <Routes>
              <Route path="/" element={<DefaultLanguageRedirect />} />
              <Route path="/language" element={<LanguagePage />} />
              <Route path="/:langCode" element={<GuideLanding />} />
              <Route path="/:langCode/poi/:poiSlug" element={<POICover />} />
              <Route path="/:langCode/poi/:poiSlug/tour/:tourId/step/:stepId" element={<AudioGuidePage />} />
              
              <Route path="/:langCode/poi/:poiSlug/details" element={<POIDetailGuide />} />
              <Route path="/:langCode/tour/:tourId" element={<TourCover />} />
              <Route path="/:langCode/tour/:tourId/steps" element={<StepList />} />
              <Route path="/:langCode/tour/:tourId/step/:stepId" element={<AudioGuidePage />} />
              <Route path="/:langCode/audio-guide/:tourId" element={<AudioGuidePage />} />
              <Route path="*" element={<DefaultLanguageRedirect />} />
            </Routes>
            <MiniAudioPlayer />
          </AudioGuideProvider>
        </LanguageProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;