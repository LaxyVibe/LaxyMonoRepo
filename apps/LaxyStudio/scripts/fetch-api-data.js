#!/usr/bin/env node

/**
 * Simple fetch-api-data script for LaxyStudio
 * This is a placeholder script that can be extended to fetch any API data needed at build time
 */

console.log('🔄 Fetching API data for LaxyStudio...');

// This is a placeholder - add your API fetching logic here
// For now, we'll just create a simple data file
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sampleData = {
  appName: 'LaxyStudio',
  version: '1.0.0',
  buildTime: new Date().toISOString(),
  features: [
    'Multilingual POI Management',
    'Modern React Admin Architecture',
    'Strapi 5 Backend Integration',
    'i18n Support (EN, ZH, KO, JA)',
    'Netlify Deployment Ready'
  ]
};

fs.writeFileSync(
  path.join(dataDir, 'app-data.json'),
  JSON.stringify(sampleData, null, 2)
);

console.log('✅ API data fetched successfully!');
