#!/usr/bin/env node

/**
 * Netlify Build Script for LaxyGuide
 * 
 * This script handles the Rollup optional dependency issue that occurs
 * on Netlify's Linux build environment when using Vite.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting LaxyGuide build process...');

// Function to run commands safely
function runCommand(command, options = {}) {
  console.log(`📝 Running: ${command}`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: options.cwd || process.cwd(),
      ...options 
    });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Function to install missing Rollup dependencies
function installRollupDependencies() {
  console.log('🔧 Installing Rollup dependencies...');
  
  // Detect the platform-specific Rollup package
  const platform = process.platform;
  const arch = process.arch;
  
  let rollupPackage;
  if (platform === 'linux' && arch === 'x64') {
    rollupPackage = '@rollup/rollup-linux-x64-gnu';
  } else if (platform === 'linux' && arch === 'arm64') {
    rollupPackage = '@rollup/rollup-linux-arm64-gnu';
  } else if (platform === 'darwin' && arch === 'x64') {
    rollupPackage = '@rollup/rollup-darwin-x64';
  } else if (platform === 'darwin' && arch === 'arm64') {
    rollupPackage = '@rollup/rollup-darwin-arm64';
  } else if (platform === 'win32' && arch === 'x64') {
    rollupPackage = '@rollup/rollup-win32-x64-msvc';
  }
  
  if (rollupPackage) {
    console.log(`📦 Installing ${rollupPackage} for ${platform}-${arch}...`);
    try {
      runCommand(`npm install ${rollupPackage} --save-optional --legacy-peer-deps`, { 
        cwd: path.join(__dirname, '../../..') 
      });
    } catch (error) {
      console.warn(`⚠️  Could not install ${rollupPackage}, continuing anyway...`);
    }
  }
}

// Main build process
async function main() {
  try {
    const rootDir = path.join(__dirname, '../../..');
    
    console.log('📂 Working directory:', rootDir);
    
    // Step 1: Install dependencies
    console.log('📦 Installing dependencies...');
    runCommand('npm install --legacy-peer-deps', { cwd: rootDir });
    
    // Step 2: Install platform-specific Rollup dependencies
    installRollupDependencies();
    
    // Step 3: Run the pre-build script if it exists
    const appDir = path.join(__dirname, '..');
    const packageJsonPath = path.join(appDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.scripts && packageJson.scripts.prebuild) {
        console.log('🔄 Running pre-build script...');
        runCommand('npm run prebuild', { cwd: appDir });
      }
    }
    
    // Step 4: Build the application
    console.log('🏗️  Building LaxyGuide application...');
    runCommand('npm run build:guide', { cwd: rootDir });
    
    // Step 5: Ensure _redirects file is in the build directory
    const redirectsSource = path.join(appDir, 'public', '_redirects');
    const redirectsTarget = path.join(appDir, 'build', '_redirects');
    
    if (fs.existsSync(redirectsSource)) {
      console.log('📄 Copying _redirects file to build directory...');
      fs.copyFileSync(redirectsSource, redirectsTarget);
      console.log('✅ _redirects file copied successfully');
    } else {
      console.warn('⚠️  _redirects file not found in public directory');
    }
    
    console.log('✅ LaxyGuide build completed successfully!');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
main();
