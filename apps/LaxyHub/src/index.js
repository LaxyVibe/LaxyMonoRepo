import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Global flag for compatibility (removed MSW dependency)
window.mswReady = true;

// Render the app directly without MSW
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
