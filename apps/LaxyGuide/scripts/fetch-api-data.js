#!/usr/bin/env node

/**
 * API Data Fetcher for LaxyGuide
 * 
 * This script fetches guide configuration and POI guide data for the LaxyGuide application.
 * 
 * Features:
 * - Fetches guide application configuration
 * - Fetches POI guides
 * - Multi-language support
 * - Configurable API parameters for maintainability
 * 
 * Usage:
 *   node scripts/fetch-api-data.js
 *   
 * Environment Variables (optional):
 *   CLIENT_ID - Override the default client ID (default: beppu-airbnb)
 * 
 * Customizing API Parameters:
 *   To modify what data is fetched from the endpoints, edit the configuration objects:
 *   
 *   - GUIDE_CONFIG_PARAMS: for guide-application-config endpoint
 *   - POI_GUIDES_PARAMS: for poi-guides endpoint
 *   
 *   Both follow Strapi's populate and fields conventions:
 *   
 *   - fields: Array of field names to fetch
 *   - populate: Object containing nested relations to populate
 *   
 *   Example:
 *   {
 *     componentName: {
 *       fields: ['field1', 'field2'],
 *       populate: {
 *         relationName: {
 *           fields: ['relatedField']
 *         }
 *       }
 *     }
 *   }
 * 
 * Output:
 *   - Updates mock data files in src/mocks/
 *   - Generates discovered.json with client configuration
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const API_BASE_URL = 'https://laxy-studio-strapi-c1d6d20cbc41.herokuapp.com';
const API_TOKEN = 'e67959c9c07282664a57013db7120c2d9993fb097f9bd28cde7e550e0eaff82845957f4b9d572c5a4c33813922a982c8442bb460dab88f3253b964cf59b8428f227cec012a832526060cd2511631c9c2bc7525bb4252c3c15377cd8bb6d45b88f0721bbf87752720c4cdfbe1e4551ef29108638e377e9d536127afdb571b1acb';

// Default client configuration - can be overridden via environment variable
const DEFAULT_CLIENT_ID = process.env.CLIENT_ID || 'beppu-airbnb';

// Supported languages
const LANGUAGES = ['en', 'ja', 'ko', 'zh-Hans', 'zh-Hant'];

// Base paths
const BASE_MOCK_PATH = path.join(__dirname, '..', 'src', 'mocks');

/**
 * Guide Application Config API Parameters Configuration
 * This configuration object defines what data to fetch from the guide-application-config endpoint.
 * Each section represents a different component/page of the application.
 * 
 * Structure:
 * - Key: The component/section name
 * - Value: Array of field configurations or nested populate configurations
 */
const GUIDE_CONFIG_PARAMS = {
  universalConfig: {
    populate: {
      releasedLanguages: {
        fields: ['label', 'value']
      },
      audioLanguages: {
        fields: ['label', 'value']
      }
    }
  },
  pagePOIGuide: {
    fields: [
      'coverDescription',
      'audioLanguageLabel',
      'nextLabel'
    ]
  },
  // globalComponent: {
  //   fields: [
  //     'readMoreLabel',
  //     'readLessLabel',
  //     'hostTagLabel',
  //     'poweredByLabel'
  //   ],
  // },
};

/**
 * POI Guides API Parameters Configuration
 * This configuration object defines what data to fetch from the poi-guides endpoint.
 * 
 * For POI guides, we use a simpler structure since it's a direct endpoint query.
 */
const POI_GUIDES_PARAMS = {
  fields: [
    'legacyTourCode',
  ],
  populate: {
    poi: {
      fields: [
        'slug',
        'label', 
        'address',
        'highlight',
        'externalURL',
        'type',
        'nativeLanguageCode',
        'addressEmbedHTML',
        'dial',
        'addressURL'
      ],
      populate: {
        tag_labels: {
          fields: ['name', 'color']
        },
        coverPhoto: {
          fields: ['url']
        }
      }
    }
  }
};

/**
 * Write the discovered configuration to a JSON file for frontend use
 */
function writeDiscoveredConfig(clientId) {
  const configPath = path.join(__dirname, '..', 'src', 'config', 'discovered.json');
  const configData = {
    clientId: clientId,
    discoveredAt: new Date().toISOString()
  };

  ensureDirectoryExists(path.dirname(configPath));
  fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
  console.log(`  📝 Updated configuration: ${path.relative(path.join(__dirname, '..'), configPath)}`);
}

/**
 * Makes an HTTPS GET request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            console.log(`  ← Error parsing JSON. Response: ${data.substring(0, 500)}...`);
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        } else if (res.statusCode === 404) {
          // Handle 404 as a special case - language version might not exist
          reject(new Error(`NOT_FOUND`));
        } else {
          console.log(`  ← HTTP ${res.statusCode}. Response: ${data.substring(0, 200)}...`);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Ensure directory exists
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  📁 Created directory: ${dirPath}`);
  }
}

/**
 * Write JSON data to file with pretty formatting
 */
function writeJsonFile(filePath, data) {
  ensureDirectoryExists(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
  console.log(`    ✓ Updated: ${path.relative(BASE_MOCK_PATH, filePath)}`);
}

/**
 * Fetch data for a specific endpoint and language
 */
async function fetchEndpointData(endpointKey, language, apiEndpoints) {
  const endpoint = apiEndpoints[endpointKey];
  const url = `${API_BASE_URL}${endpoint.path}?${endpoint.params}&locale=${language}`;
  
  console.log(`  📡 ${endpointKey} (${language})`);
  
  try {
    const data = await makeRequest(url);
    const outputPath = path.join(BASE_MOCK_PATH, endpoint.outputDir, `${language}.json`);
    writeJsonFile(outputPath, data);
    return true;
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      console.log(`    ⚠️ Skipped: Translation not available`);
      return 'skipped';
    } else {
      console.error(`    ✗ Failed: ${error.message}`);
      return false;
    }
  }
}

/**
 * Convert a configuration object to URL parameters format
 * This function recursively builds the populate and fields parameters for Strapi API
 */
function buildUrlParams(config, basePath = '') {
  const params = [];
  
  function processConfig(obj, path) {
    if (obj.fields && Array.isArray(obj.fields)) {
      obj.fields.forEach((field, index) => {
        params.push(`${path}[fields][${index}]=${field}`);
      });
    }
    
    if (obj.populate) {
      Object.keys(obj.populate).forEach(key => {
        const populatePath = path ? `${path}[populate][${key}]` : `populate[${key}]`;
        processConfig(obj.populate[key], populatePath);
      });
    }
  }
  
  Object.keys(config).forEach(key => {
    const configPath = basePath ? `${basePath}[${key}]` : `populate[${key}]`;
    processConfig(config[key], configPath);
  });
  
  return params.join('&');
}

/**
 * Build URL parameters for direct endpoint queries (like poi-guides)
 * This handles simpler structures without nested component configurations
 */
function buildDirectUrlParams(config) {
  const params = [];
  
  function processConfig(obj, basePath = '') {
    if (obj.fields && Array.isArray(obj.fields)) {
      obj.fields.forEach((field, index) => {
        const path = basePath ? `${basePath}[fields][${index}]` : `fields[${index}]`;
        params.push(`${path}=${field}`);
      });
    }
    
    if (obj.populate) {
      Object.keys(obj.populate).forEach(key => {
        const populatePath = basePath ? `${basePath}[populate][${key}]` : `populate[${key}]`;
        processConfig(obj.populate[key], populatePath);
      });
    }
  }
  
  processConfig(config);
  return params.join('&');
}

/**
 * Build guide application config endpoint with dynamic parameters
 */
function buildGuideConfigEndpoint() {
  const params = buildUrlParams(GUIDE_CONFIG_PARAMS);
  
  // Optional: Log the generated parameters for debugging
  if (process.env.DEBUG_PARAMS) {
    console.log('🔧 Generated guide config parameters:');
    console.log(params);
  }
  
  return {
    guideApplicationConfig: {
      path: '/api/guide-application-config',
      params: params,
      outputDir: 'guide-application-config'
    }
  };
}

/**
 * Build POI guides endpoint with dynamic parameters
 */
function buildPoiGuidesEndpoint() {
  const params = buildDirectUrlParams(POI_GUIDES_PARAMS);
  
  // Add pagination
  const additionalParams = [
    'pagination[page]=1',
    'pagination[pageSize]=10000'
  ];
  
  const finalParams = additionalParams.concat(params.split('&')).join('&');
  
  // Optional: Log the generated parameters for debugging
  if (process.env.DEBUG_PARAMS) {
    console.log('🔧 Generated POI guides parameters:');
    console.log(finalParams);
  }
  
  return {
    poiGuides: {
      path: '/api/poi-guides',
      params: finalParams,
      outputDir: 'poi-guides'
    }
  };
}


/**
 * Main function to fetch all data
 */
async function fetchAllData() {
  console.log('🚀 Starting API data fetch...');
  console.log(`📂 Base mock path: ${BASE_MOCK_PATH}`);
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log(`🔑 Using API Token: ${API_TOKEN.substring(0, 20)}...`);
  console.log(`🗣️  Languages: ${LANGUAGES.join(', ')}`);
  
  try {
    // Write client configuration
    writeDiscoveredConfig(DEFAULT_CLIENT_ID);
    
    let totalRequests = 0;
    let successfulRequests = 0;
    let skippedRequests = 0;
    let failedRequests = 0;
    
    // Process guide application config
    console.log(`📋 Processing guideApplicationConfig:`);
    const guideConfigEndpoint = buildGuideConfigEndpoint();

    for (const language of LANGUAGES) {
      totalRequests++;
      const result = await fetchEndpointData('guideApplicationConfig', language, guideConfigEndpoint);
      if (result === true) {
        successfulRequests++;
      } else if (result === 'skipped') {
        skippedRequests++;
      } else {
        failedRequests++;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Process POI guides
    console.log(`📋 Processing poiGuides:`);
    const poiEndpoints = buildPoiGuidesEndpoint();
    
    for (const language of LANGUAGES) {
      totalRequests++;
      const result = await fetchEndpointData('poiGuides', language, poiEndpoints);
      if (result === true) {
        successfulRequests++;
      } else if (result === 'skipped') {
        skippedRequests++;
      } else {
        failedRequests++;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`\n🎉 Completed!`);
    console.log(`  ✅ Successful: ${successfulRequests}`);
    console.log(`  ⚠️  Skipped: ${skippedRequests}`);
    console.log(`  ❌ Failed: ${failedRequests}`);
    console.log(`  📊 Total: ${totalRequests}`);
    
    if (failedRequests > 0) {
      console.log(`\n⚠️  Some requests failed. Check the errors above.`);
      process.exit(1);
    } else {
      console.log(`\n✅ All available data fetched successfully!`);
    }
  } catch (error) {
    console.error(`💥 Failed to fetch data: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  fetchAllData().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}
