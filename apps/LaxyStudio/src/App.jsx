import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="hello-world-container">
          <h1 className="hello-world-title">Hello World! 123</h1>
          <p className="hello-world-subtitle">Welcome to Laxy Studio</p>
          <div className="hello-world-description">
            <p>🚀 Your creative development platform is ready!</p>
            <p>Built with React, powered by Vite, deployed on Netlify</p>
          </div>
          <div className="feature-cards">
            <div className="feature-card">
              <h3>⚡ Fast Development</h3>
              <p>Powered by Vite for lightning-fast development experience</p>
            </div>
            <div className="feature-card">
              <h3>🎨 Modern Design</h3>
              <p>Beautiful and responsive UI components ready for customization</p>
            </div>
            <div className="feature-card">
              <h3>🌐 Deploy Ready</h3>
              <p>Optimized Netlify configuration for seamless deployments</p>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
