#!/usr/bin/env node

/**
 * Validation script to test Netlify configurations
 * This script simulates what Netlify will do when building
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Netlify Setup for LaxyMonoRepo\n');

// Check if config files exist
const configs = [
  { name: 'LaxyHub', file: 'netlify.toml' },
  { name: 'LaxyGuide', file: 'netlify-guide.toml' }
];

configs.forEach(config => {
  const configPath = path.join(__dirname, config.file);
  if (fs.existsSync(configPath)) {
    console.log(`✅ ${config.name} config found: ${config.file}`);
  } else {
    console.log(`❌ ${config.name} config missing: ${config.file}`);
  }
});

console.log('\n📋 Testing build commands...\n');

// Test LaxyHub build
try {
  console.log('🏗️  Testing LaxyHub build...');
  console.log('Command: npm run build:hub');
  
  const hubOutput = execSync('npm run build:hub', { 
    encoding: 'utf8',
    cwd: __dirname,
    timeout: 300000 // 5 minutes
  });
  
  // Check if build folder exists
  const hubBuildPath = path.join(__dirname, 'apps/LaxyHub/build');
  if (fs.existsSync(hubBuildPath)) {
    console.log('✅ LaxyHub build successful - build folder created');
  } else {
    console.log('❌ LaxyHub build folder not found');
  }
} catch (error) {
  console.log('❌ LaxyHub build failed:');
  console.log(error.message);
}

console.log('');

// Test LaxyGuide build
try {
  console.log('🏗️  Testing LaxyGuide build...');
  console.log('Command: npm run build:guide');
  
  const guideOutput = execSync('npm run build:guide', { 
    encoding: 'utf8',
    cwd: __dirname,
    timeout: 300000 // 5 minutes
  });
  
  // Check if build folder exists
  const guideBuildPath = path.join(__dirname, 'apps/LaxyGuide/build');
  if (fs.existsSync(guideBuildPath)) {
    console.log('✅ LaxyGuide build successful - build folder created');
  } else {
    console.log('❌ LaxyGuide build folder not found');
  }
} catch (error) {
  console.log('❌ LaxyGuide build failed:');
  console.log(error.message);
}

console.log('\n🎯 Next Steps:');
console.log('1. Clear Netlify dashboard build settings (build command, publish directory, base directory)');
console.log('2. Create new Netlify project for LaxyGuide');
console.log('3. Set LaxyGuide config file path to: netlify-guide.toml');
console.log('4. Test deployments');

console.log('\n📚 Documentation:');
console.log('- Netlify Config: https://docs.netlify.com/configure-builds/file-based-configuration/');
console.log('- Multiple Apps: https://docs.netlify.com/configure-builds/monorepos/');
