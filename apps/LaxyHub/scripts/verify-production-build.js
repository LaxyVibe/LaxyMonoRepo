#!/usr/bin/env node

/**
 * Fail production builds that would silently drop analytics or publish damaged
 * Japanese content. This runs automatically after `npm run build`.
 */

const fs = require('fs');
const path = require('path');

const appRoot = path.join(__dirname, '..');
const buildRoot = path.join(appRoot, 'build');
const japaneseDataRoot = path.join(appRoot, 'src', 'mocks');
const expectedMeasurementId =
  process.env.VITE_GA_LAXY_HUB_MEASUREMENT_ID || 'G-102C698SDQ';

const walkFiles = directory => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap(entry => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
  });

const indexHtml = fs.readFileSync(path.join(buildRoot, 'index.html'), 'utf8');
const entryAssetMatch = indexHtml.match(/<script[^>]+src="([^"]+\.js)"/);

if (!entryAssetMatch) {
  throw new Error('Production build has no JavaScript entry asset.');
}

const entryAssetPath = path.join(buildRoot, entryAssetMatch[1].replace(/^\//, ''));
const entryAsset = fs.readFileSync(entryAssetPath, 'utf8');

if (!entryAsset.includes(expectedMeasurementId)) {
  throw new Error(
    `Production bundle is missing Google Analytics ID ${expectedMeasurementId}.`
  );
}

const damagedJapaneseFiles = walkFiles(japaneseDataRoot)
  .filter(file => path.basename(file) === 'ja.json')
  .filter(file => fs.readFileSync(file, 'utf8').includes('\uFFFD'))
  .map(file => path.relative(appRoot, file));

if (damagedJapaneseFiles.length > 0) {
  throw new Error(
    `Japanese data still contains Unicode replacement characters:\n${damagedJapaneseFiles.join('\n')}`
  );
}

console.log(`Verified production analytics ID: ${expectedMeasurementId}`);
console.log('Verified Japanese data: no Unicode replacement characters');
