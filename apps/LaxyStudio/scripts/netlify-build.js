#!/usr/bin/env node

/**
 * Simple build script for LaxyStudio
 * This is kept for compatibility but LaxyStudio uses the direct command approach
 */

const { execSync } = require('child_process');

console.log('🚀 Building LaxyStudio...');

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ LaxyStudio build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}