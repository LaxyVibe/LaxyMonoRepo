import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

const GuideLanding = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  console.log('🔍 GuideLanding rendering with language:', language);

  const handlePOIClick = (poiSlug) => {
    navigate(`/${language}/poi/${poiSlug}`);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#f0f0f0' // Add background to see if component is rendering
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flex: 1,
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'white',
          borderRadius: '16px',
          padding: '60px 40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: '#1d1d1f',
            marginBottom: '20px',
            letterSpacing: '-0.02em'
          }}>
            Hello World! 👋
          </h1>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '500',
            color: '#6e6e73',
            marginBottom: '30px',
            letterSpacing: '-0.01em'
          }}>
            Welcome to LaxyGuide ({language})
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#86868b',
            lineHeight: '1.6',
            marginBottom: '40px'
          }}>
            Your journey begins here. LaxyGuide is ready to help you explore and discover amazing experiences.
          </p>
          
          {/* Demo POI buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '30px'
          }}>
            <button 
              onClick={() => handlePOIClick('test-1')}
              style={{
                background: 'linear-gradient(135deg, #007aff, #0056d3)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(0, 122, 255, 0.3)';
              }}
            >
              View Test POI 1
            </button>
            <button 
              onClick={() => handlePOIClick('test-2')}
              style={{
                background: 'transparent',
                color: '#007aff',
                border: '2px solid #007aff',
                borderRadius: '12px',
                padding: '14px 32px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#007aff';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#007aff';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              View Test POI 2
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button style={{
              background: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e0e0e0';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f0f0f0';
              e.target.style.transform = 'translateY(0)';
            }}>
              Language: {language}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideLanding;