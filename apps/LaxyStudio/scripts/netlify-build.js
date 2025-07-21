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
  
  // First check if any rollup packages are already installed
  const nodeModulesPath = path.join(rootDir, 'node_modules', '@rollup');
  if (fs.existsSync(nodeModulesPath)) {
    const rollupPackages = fs.readdirSync(nodeModulesPath);
    if (rollupPackages.length > 0) {
      console.log(`✅ Rollup dependencies already installed: ${rollupPackages.join(', ')}`);
      return;
    }
  }
  
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
      runCommand(`npm install ${rollupPackage} --save-optional --legacy-peer-deps --no-audit --no-fund --prefer-offline --timeout=300000`, { 
        cwd: rootDir,
        timeout: 300000 // 5 minute timeout for rollup install
      });
    } catch (error) {
      console.warn(`⚠️  Could not install ${rollupPackage}, continuing anyway...`);
      console.warn('This might be okay if Vite can use a fallback build method.');
    }
  } else {
    console.log('ℹ️  No platform-specific Rollup package needed for this platform');
  }
}

// Main build process
async function main() {
  try {
    // Detect if we're being run from the LaxyStudio app directory or the monorepo root
    const currentDir = process.cwd();
    const isRunFromAppDir = currentDir.includes('apps/LaxyStudio');
    
    let rootDir, appDir;
    if (isRunFromAppDir) {
      // Running from /build/repo/apps/LaxyStudio
      appDir = currentDir;
      rootDir = path.join(currentDir, '../..');
    } else {
      // Running from monorepo root
      rootDir = currentDir;
      appDir = path.join(currentDir, 'apps/LaxyStudio');
    }
    
    console.log('📂 Root directory:', rootDir);
    console.log('� App directory:', appDir);
    
    // Check if dependencies are already installed
    const nodeModulesExists = fs.existsSync(path.join(rootDir, 'node_modules'));
    console.log(`📦 Node modules exists: ${nodeModulesExists}`);
    
    if (!nodeModulesExists) {
      // Step 1: Install dependencies including optional packages (for rollup)
      console.log('📦 Installing dependencies with speed optimizations...');
      runCommand('npm ci --legacy-peer-deps --no-audit --no-fund --prefer-offline --progress=false', { cwd: rootDir });
    } else {
      console.log('✅ Dependencies already installed, skipping npm ci');
    }
    
    // Skip platform-specific Rollup dependencies - let Vite handle it
    console.log('🔧 Skipping Rollup dependencies - letting Vite use fallback build method...');
    
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
