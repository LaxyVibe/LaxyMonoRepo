import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Global flag for compatibility (removed MSW dependency)
window.mswReady = true;

console.log('🔍 index.jsx loading...');
console.log('🔍 document.getElementById("root"):', document.getElementById('root'));

// Render the app directly without MSW
const root = ReactDOM.createRoot(document.getElementById('root'));
console.log('🔍 root created:', root);

console.log('🔍 About to render App component');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('🔍 App component rendered');
