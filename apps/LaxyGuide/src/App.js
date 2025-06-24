import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
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
            Welcome to LaxyGuide
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#86868b',
            lineHeight: '1.6',
            marginBottom: '40px'
          }}>
            Your journey begins here. LaxyGuide is ready to help you explore and discover amazing experiences.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button style={{
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
            }}>
              Get Started
            </button>
            <button style={{
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
            }}>
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;