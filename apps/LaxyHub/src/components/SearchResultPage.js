import React, { useState, useEffect } from 'react';
import {
  Container,
  Box
} from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import PageHeader from './common/PageHeader';
import POIList from './common/POIList';
import { PAGE_LAYOUTS, CONTENT_PADDING } from '../config/layout';
import { trackNavigation } from '../utils/analytics';
import { getHubConfigByLanguage } from '../mocks/hub-application-config';

const SearchResultPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  
  // Get search query from URL parameters
  const searchQuery = searchParams.get('q') || '';
  
  const [filteredResults, setFilteredResults] = useState([]);
  const [poiRecommendationsData, setPOIRecommendationsData] = useState(null);
  
  // Get suite ID from params
  const suiteId = params.suiteId;

  // Get hub configuration for current language
  const hubConfig = getHubConfigByLanguage(language);
  const searchResultHeadingTemplate = hubConfig?.data?.pageSearch?.searchResultHeading || 'Result of {{value}}';
  
  // Replace template placeholder with actual search query
  const searchResultHeading = searchResultHeadingTemplate.replace('{{value}}', searchQuery);

  // Load POI recommendations data based on current language
  useEffect(() => {
    const loadPOIRecommendations = async () => {
      try {
        const poiModule = await import(`../mocks/poi-recommendations/${language}.json`);
        setPOIRecommendationsData(poiModule.default);
      } catch (error) {
        console.error(`Failed to load POI recommendations for language ${language}:`, error);
        // Fallback to English if language-specific data is not available
        try {
          const fallbackModule = await import(`../mocks/poi-recommendations/en.json`);
          setPOIRecommendationsData(fallbackModule.default);
        } catch (fallbackError) {
          console.error('Failed to load fallback POI recommendations:', fallbackError);
          setPOIRecommendationsData({ data: [] });
        }
      }
    };

    loadPOIRecommendations();
  }, [language]);

  // Filter POI recommendations that have weightInHighlight !== -1 and sort by weight
  const highlightedPOIs = React.useMemo(() => {
    if (!poiRecommendationsData) return [];
    return poiRecommendationsData.data
      .filter(item => item.weightInHighlight !== -1)
      .sort((a, b) => a.weightInHighlight - b.weightInHighlight);
  }, [poiRecommendationsData]);

  // Filter search results based on query
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = highlightedPOIs.filter(poi => 
        poi.poi.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.poi.highlight.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredResults(results);
    } else {
      setFilteredResults([]);
    }
  }, [searchQuery, highlightedPOIs]);

  const handleBack = () => {
    trackNavigation('search_result_page', 'search_page', 'back_button');
    navigate(`/${language}/${suiteId}/search`);
  };

  return (
    <Container {...PAGE_LAYOUTS.SearchPage}>
      {/* Page Header */}
      <PageHeader 
        title={searchResultHeading}
        onBack={handleBack}
      />

      {/* Search Results Content */}
      <Box sx={{ ...CONTENT_PADDING.standard, py: 3 }}>
        <POIList
          searchResults={filteredResults}
          suiteId={suiteId}
          showHeader={false}
          loading={false}
        />
      </Box>
    </Container>
  );
};

export default SearchResultPage;
