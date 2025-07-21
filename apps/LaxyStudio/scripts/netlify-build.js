#!/usr/bin/env node

/**
 * Netlify Build Script for LaxyStudio
 * 
 * This script handles the Rollup optional dependency issue that occurs
 * on Netlify's Linux build environment when using Vite.
 * Based on LaxyGuide optimized version to prevent build timeouts.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting LaxyStudio build process...');

// Function to run commands safely with timeout
function runCommand(command, options = {}) {
  console.log(`📝 Running: ${command}`);
  try {
    const timeout = options.timeout || 600000; // 10 minutes default timeout
    execSync(command, { 
      stdio: 'inherit', 
      cwd: options.cwd || process.cwd(),
      timeout: timeout,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      ...options 
    });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    if (error.code === 'ETIMEDOUT') {
      console.error('💀 Command timed out - this might indicate a network or dependency issue');
    }
    console.error(error.message);
    process.exit(1);
  }
}

// Function to install missing Rollup dependencies
function installRollupDependencies(rootDir) {
  console.log('🔧 Checking Rollup dependencies...');
  
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
  } else if (platform === 'win32' && arch === 'ia32') {
    rollupPackage = '@rollup/rollup-win32-ia32-msvc';
  } else {
    console.log(`⚠️  Platform ${platform}-${arch} not explicitly supported, will try generic installation`);
    return;
  }
  
  console.log(`🎯 Installing ${rollupPackage} for ${platform}-${arch}...`);
  
  try {
    // Check if already installed
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.devDependencies && packageJson.devDependencies[rollupPackage]) {
      console.log(`✅ ${rollupPackage} already in package.json`);
      return;
    }
    
    // Install the platform-specific Rollup package
    runCommand(`npm install ${rollupPackage} --save-dev --no-audit --no-fund`, {
      cwd: rootDir,
      timeout: 300000 // 5 minutes for package installation
    });
    
    console.log(`✅ Successfully installed ${rollupPackage}`);
  } catch (error) {
    console.warn(`⚠️  Failed to install ${rollupPackage}, continuing anyway...`);
    console.warn(error.message);
  }
}

// Main build process
function main() {
  const startTime = Date.now();
  
  try {
    // Get absolute paths
    const currentDir = process.cwd();
    const rootDir = path.resolve(currentDir, '../..');
    const appDir = currentDir;
    
    console.log(`📁 Root directory: ${rootDir}`);
    console.log(`📁 App directory: ${appDir}`);
    
    // Step 1: Install root dependencies if not already done
    console.log('\n🔧 Step 1: Installing root dependencies...');
    const nodeModulesExists = fs.existsSync(path.join(rootDir, 'node_modules'));
    
    if (!nodeModulesExists) {
      console.log('📦 Installing root dependencies from scratch...');
      runCommand('npm ci --legacy-peer-deps --no-optional --no-audit --no-fund --prefer-offline', {
        cwd: rootDir,
        timeout: 480000 // 8 minutes for initial install
      });
    } else {
      console.log('✅ Root node_modules already exists, skipping root install');
    }
    
    // Step 2: Install app-specific dependencies
    console.log('\n🔧 Step 2: Installing LaxyStudio dependencies...');
    const appNodeModulesExists = fs.existsSync(path.join(appDir, 'node_modules'));
    
    if (!appNodeModulesExists) {
      console.log('📦 Installing LaxyStudio dependencies...');
      runCommand('npm install --legacy-peer-deps --no-optional --no-audit --no-fund', {
        cwd: appDir,
        timeout: 300000 // 5 minutes for app install
      });
    } else {
      console.log('✅ LaxyStudio node_modules already exists');
    }
    
    // Step 3: Install platform-specific Rollup package if needed
    console.log('\n🔧 Step 3: Checking Rollup dependencies...');
    installRollupDependencies(appDir);
    
    // Step 4: Build the application
    console.log('\n🔧 Step 4: Building LaxyStudio...');
    runCommand('npm run build', {
      cwd: appDir,
      timeout: 600000 // 10 minutes for build
    });
    
    // Step 5: Verify build output
    console.log('\n🔍 Step 5: Verifying build...');
    const buildDir = path.join(appDir, 'build');
    const indexPath = path.join(buildDir, 'index.html');
    
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build directory not found');
    }
    
    if (!fs.existsSync(indexPath)) {
      throw new Error('index.html not found in build directory');
    }
    
    const buildStats = fs.statSync(buildDir);
    console.log(`✅ Build completed successfully at ${buildDir}`);
    console.log(`📊 Build directory created: ${buildStats.birthtime}`);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`\n🎉 LaxyStudio build completed in ${duration.toFixed(2)} seconds!`);
    
  } catch (error) {
    console.error('\n❌ Build failed!');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the build process
main();
