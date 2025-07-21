#!/usr/bin/env node

/**
 * Netlify Build Script for LaxyStudio (Optimized Version)
 * 
 * This script handles the Rollup optional dependency issue that occurs
 * on Netlify's Linux build environment when using Vite.
 * Optimized to prevent build timeouts by avoiding redundant installations.
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
  } else {
    console.log(`⚠️  Unknown platform ${platform}-${arch}, skipping Rollup package installation`);
    return;
  }

  console.log(`🔄 Installing ${rollupPackage} for platform ${platform}-${arch}...`);
  
  try {
    // Try to install the platform-specific package
    runCommand(`npm install ${rollupPackage} --no-save --legacy-peer-deps`, {
      cwd: rootDir,
      timeout: 300000 // 5 minutes timeout for this step
    });
    console.log(`✅ Successfully installed ${rollupPackage}`);
  } catch (error) {
    console.warn(`⚠️  Failed to install ${rollupPackage}, but continuing with build...`);
    console.warn(error.message);
  }
}

// Main build process
function main() {
  try {
    const rootDir = path.resolve(__dirname, '../..');
    const appDir = path.resolve(__dirname, '..');
    
    console.log(`🏠 Root directory: ${rootDir}`);
    console.log(`📁 App directory: ${appDir}`);
    
    // Change to root directory for dependency management
    process.chdir(rootDir);
    
    // Check if we're already in a proper installation state
    const lockFileExists = fs.existsSync(path.join(rootDir, 'package-lock.json'));
    const nodeModulesExists = fs.existsSync(path.join(rootDir, 'node_modules'));
    
    if (!nodeModulesExists || !lockFileExists) {
      console.log('📦 Installing root dependencies...');
      runCommand('npm ci --legacy-peer-deps --no-optional --no-audit --prefer-offline', {
        cwd: rootDir,
        timeout: 900000 // 15 minutes for full install
      });
    } else {
      console.log('✅ Dependencies already installed, skipping npm ci');
    }
    
    // Install platform-specific Rollup dependencies
    installRollupDependencies(rootDir);
    
    // Change to app directory for build
    process.chdir(appDir);
    
    // Run any pre-build scripts if they exist
    console.log('🔄 Running pre-build scripts...');
    if (fs.existsSync(path.join(appDir, 'scripts/fetch-api-data.js'))) {
      try {
        runCommand('node scripts/fetch-api-data.js', {
          cwd: appDir,
          timeout: 300000 // 5 minutes timeout
        });
      } catch (error) {
        console.warn('⚠️  Pre-build script failed, but continuing...');
        console.warn(error.message);
      }
    }
    
    // Build the application
    console.log('🏗️  Building LaxyStudio application...');
    runCommand('npm run build', {
      cwd: appDir,
      timeout: 900000 // 15 minutes for build
    });
    
    // Verify build output
    const buildDir = path.join(appDir, 'build');
    if (fs.existsSync(buildDir)) {
      const buildFiles = fs.readdirSync(buildDir);
      console.log(`✅ Build completed successfully! Output files: ${buildFiles.length}`);
      console.log('📄 Build contents:', buildFiles.slice(0, 10).join(', '));
      if (buildFiles.length > 10) {
        console.log(`... and ${buildFiles.length - 10} more files`);
      }
    } else {
      throw new Error('Build directory not found after build completion');
    }
    
    console.log('🎉 LaxyStudio build process completed successfully!');
    
  } catch (error) {
    console.error('💥 Build process failed:', error.message);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⏹️  Build process interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Build process terminated');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error.message);
  process.exit(1);
});

// Run the main build process
main();
