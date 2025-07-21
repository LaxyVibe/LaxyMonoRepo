#!/usr/bin/env node

/**
 * Netlify Build Script for LaxyGuide
 * 
 * This script handles the Rollup optional dependency issue that occurs
 * on Netlify's Linux build environment when using Vite.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting LaxyGuide build process...');

try {
  // Change to workspace root
  const rootDir = path.join(__dirname, '../../..');
  process.chdir(rootDir);
  
  // Check if we're on Netlify's Linux environment and missing the Rollup dependency
  const isNetlify = process.env.NETLIFY === 'true';
  const isLinux = process.platform === 'linux';
  
  if (isNetlify && isLinux) {
    console.log('🔧 Installing missing Rollup dependency for Linux...');
    try {
      // Quick install of just the missing package
      execSync('npm install @rollup/rollup-linux-x64-gnu --no-save --silent', { 
        stdio: 'pipe',
        env: { ...process.env, NPM_CONFIG_FUND: 'false', NPM_CONFIG_AUDIT: 'false' }
      });
      console.log('✅ Rollup dependency installed successfully!');
    } catch (rollupError) {
      console.warn('⚠️  Could not install Rollup dependency, continuing anyway...');
    }
  }
  
  console.log('🏗️  Building LaxyGuide using workspace script...');
  execSync('npm run build:guide', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });
  
  console.log('✅ Build completed successfully!');
  
  // Verify build output exists
  const buildDir = path.join(__dirname, '..', 'build');
  if (fs.existsSync(buildDir)) {
    console.log('📁 Build output verified at:', buildDir);
  } else {
    throw new Error('Build directory was not created');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Fallback: try building directly in the app directory
  console.log('🔄 Trying fallback build method...');
  try {
    const appDir = path.join(__dirname, '..');
    process.chdir(appDir);
    
    console.log('📦 Running prebuild script...');
    execSync('npm run prebuild', { stdio: 'inherit' });
    
    console.log('🏗️  Running build...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('✅ Fallback build completed successfully!');
  } catch (fallbackError) {
    console.error('❌ Fallback build also failed:', fallbackError.message);
    process.exit(1);
  }
}
