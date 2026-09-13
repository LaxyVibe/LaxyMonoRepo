#!/usr/bin/env node

/**
 * Generate the build-time client configuration from committed mock data.
 *
 * The Strapi instance previously used by fetch-api-data.js is no longer
 * available, so production builds must treat src/mocks as the source of truth.
 *
 * Environment variables:
 *   CLIENT_ID - Client folder to build (default: beppu-airbnb)
 *   SUITE_ID  - Override the default suite from the local client manifest
 */

const fs = require('fs');
const path = require('path');

const clientId = process.env.CLIENT_ID || 'beppu-airbnb';
const appRoot = path.join(__dirname, '..');
const suitesRoot = path.join(appRoot, 'src', 'mocks', 'suites', clientId);
const clientConfigPath = path.join(appRoot, 'src', 'mocks', 'client-configs', `${clientId}.json`);
const outputPath = path.join(appRoot, 'src', 'config', 'discovered.json');

if (!fs.existsSync(suitesRoot)) {
  throw new Error(`No committed suite data found for client: ${clientId}`);
}

const discoveredSuites = fs.readdirSync(suitesRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .filter(entry => fs.readdirSync(path.join(suitesRoot, entry.name)).some(file => file.endsWith('.json')))
  .map(entry => entry.name)
  .sort();

if (discoveredSuites.length === 0) {
  throw new Error(`No committed suite JSON files found for client: ${clientId}`);
}

let clientConfig = {};

if (fs.existsSync(clientConfigPath)) {
  clientConfig = JSON.parse(fs.readFileSync(clientConfigPath, 'utf8'));
}

const configuredSuites = clientConfig.availableSuites;
const availableSuites = Array.isArray(configuredSuites) ? configuredSuites : discoveredSuites;

const missingSuites = availableSuites.filter(suite => !discoveredSuites.includes(suite));
const unconfiguredSuites = discoveredSuites.filter(suite => !availableSuites.includes(suite));

if (missingSuites.length > 0 || unconfiguredSuites.length > 0) {
  throw new Error(
    `Local client manifest does not match the suite folders for ${clientId}. ` +
    `Missing folders: ${missingSuites.join(', ') || 'none'}. ` +
    `Unconfigured folders: ${unconfiguredSuites.join(', ') || 'none'}.`
  );
}

const currentSuite = process.env.SUITE_ID || clientConfig.currentSuite || availableSuites[0];

if (!availableSuites.includes(currentSuite)) {
  throw new Error(`Suite ${currentSuite} is not available for client: ${clientId}`);
}

const config = {
  clientId,
  availableSuites,
  currentSuite,
  discoveredAt: new Date().toISOString(),
  source: 'local-mocks',
  ...(clientConfig.sourceDeployId ? { sourceDeployId: clientConfig.sourceDeployId } : {})
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`);

console.log(`Generated local configuration for ${clientId}: ${availableSuites.join(', ')}`);
console.log(`Default suite: ${currentSuite}`);
