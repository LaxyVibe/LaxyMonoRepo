#!/usr/bin/env node

/**
 * Simple Netlify Build Script for LaxyStudio
 * 
 * This script provides a fallback build process if needed.
 * The primary method should be using npm run build:studio directly in netlify.toml
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting LaxyStudio build process...');

try {
  // Change to workspace root
  const rootDir = path.join(__dirname, '../../..');
  process.chdir(rootDir);
  
  console.log('🏗️  Building LaxyStudio using workspace script...');
  execSync('npm run build:studio', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });
  
  console.log('✅ Build completed successfully!');
  
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