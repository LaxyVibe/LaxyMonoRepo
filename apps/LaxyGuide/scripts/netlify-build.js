#!/usr/bin/env node

/**
 * Netlify Build Script for LaxyGuide (Optimized Version)
 * 
 * This script handles the Rollup optional dependency issue that occurs
 * on Netlify's Linux build environment when using Vite.
 * Optimized to prevent build timeouts by avoiding redundant installations.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting LaxyGuide build process...');

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
      // Try a more aggressive approach to fix npm optional dependency issues
      runCommand(`npm install ${rollupPackage} --save-optional --legacy-peer-deps --no-audit --no-fund --prefer-offline --timeout=300000`, { 
        cwd: rootDir,
        timeout: 300000 // 5 minute timeout for rollup install
      });
      
      // Verify the installation worked
      const packagePath = path.join(rootDir, 'node_modules', rollupPackage);
      if (!fs.existsSync(packagePath)) {
        console.warn(`⚠️  ${rollupPackage} installation may have failed, trying alternative approach...`);
        // Try removing node_modules/@rollup and reinstalling
        const rollupDir = path.join(rootDir, 'node_modules', '@rollup');
        if (fs.existsSync(rollupDir)) {
          runCommand(`rm -rf ${rollupDir}`, { cwd: rootDir });
        }
        runCommand(`npm install ${rollupPackage} --force --legacy-peer-deps`, { 
          cwd: rootDir,
          timeout: 300000
        });
      }
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
    // Detect if we're being run from the LaxyGuide app directory or the monorepo root
    const currentDir = process.cwd();
    const isRunFromAppDir = currentDir.includes('apps/LaxyGuide');
    
    let rootDir, appDir;
    if (isRunFromAppDir) {
      // Running from /build/repo/apps/LaxyGuide
      appDir = currentDir;
      rootDir = path.join(currentDir, '../..');
    } else {
      // Running from monorepo root
      rootDir = currentDir;
      appDir = path.join(currentDir, 'apps/LaxyGuide');
    }
    
    console.log('📂 Root directory:', rootDir);
    console.log('📂 App directory:', appDir);
    
    // Check if dependencies are already installed
    const nodeModulesExists = fs.existsSync(path.join(rootDir, 'node_modules'));
    console.log(`📦 Node modules exists: ${nodeModulesExists}`);
    
    // Check if rollup packages are missing (common issue with Netlify cache)
    const rollupDir = path.join(rootDir, 'node_modules', '@rollup');
    const rollupPackagesExist = fs.existsSync(rollupDir);
    
    if (!nodeModulesExists || !rollupPackagesExist) {
      if (nodeModulesExists && !rollupPackagesExist) {
        console.log('🔧 Rollup packages missing from cache, forcing fresh install...');
        runCommand('rm -rf node_modules package-lock.json', { cwd: rootDir });
      }
      // Step 1: Install dependencies including optional packages (for rollup)
      console.log('📦 Installing dependencies with speed optimizations...');
      runCommand('npm ci --legacy-peer-deps --no-audit --no-fund --prefer-offline --progress=false', { cwd: rootDir });
    } else {
      console.log('📦 Dependencies already installed, skipping npm install');
    }
    
    // Step 2: Skip Rollup dependencies installation - let Vite handle it
    console.log('🔧 Skipping Rollup dependencies - letting Vite use fallback build method...');
    
    // Step 3: Run the pre-build script if it exists
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
