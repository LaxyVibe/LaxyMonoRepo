#!/usr/bin/env node

/**
 * Netlify Monorepo Configuration Validator
 * 
 * This script validates that the monorepo is properly configured for Netlify deployment
 * of both LaxyHub and LaxyGuide apps.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');

console.log('🔍 Validating Netlify Monorepo Configuration...\n');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(level, message) {
  const symbols = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  const color = {
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    info: colors.cyan
  };
  
  console.log(`${color[level]}${symbols[level]} ${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log('success', `${description}: ${path.relative(ROOT_DIR, filePath)}`);
    return true;
  } else {
    log('error', `Missing ${description}: ${path.relative(ROOT_DIR, filePath)}`);
    return false;
  }
}

function validateNetlifyConfig(configPath, appName) {
  if (!fs.existsSync(configPath)) {
    log('error', `Missing netlify.toml for ${appName}`);
    return false;
  }
  
  const content = fs.readFileSync(configPath, 'utf-8');
  
  // Check for required sections
  const checks = [
    { pattern: /\[build\]/, description: 'build section' },
    { pattern: /publish\s*=\s*["'][^"']*build["']/, description: 'publish directory' },
    { pattern: /command\s*=.*build:/, description: 'build command' },
    { pattern: /NODE_VERSION\s*=\s*["']22["']/, description: 'Node.js version' },
    { pattern: /rollup-linux-x64-gnu/, description: 'Rollup Linux binary' }
  ];
  
  log('info', `Validating ${appName} netlify.toml:`);
  
  let allValid = true;
  for (const check of checks) {
    if (check.pattern.test(content)) {
      log('success', `  ${check.description}`);
    } else {
      log('warning', `  Missing or incorrect ${check.description}`);
      allValid = false;
    }
  }
  
  return allValid;
}

function validatePackageJson(packagePath, appName) {
  if (!fs.existsSync(packagePath)) {
    log('error', `Missing package.json for ${appName}`);
    return false;
  }
  
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  log('info', `Validating ${appName} package.json:`);
  
  // Check for shared component dependency
  const hasSharedComponent = pkg.dependencies && 
    pkg.dependencies['@laxy/components'] && 
    pkg.dependencies['@laxy/components'].includes('file:../../packages/LaxyComponents');
  
  if (hasSharedComponent) {
    log('success', '  @laxy/components dependency');
  } else {
    log('error', '  Missing @laxy/components dependency');
    return false;
  }
  
  // Check for build script
  const hasBuildScript = pkg.scripts && pkg.scripts.build;
  if (hasBuildScript) {
    log('success', '  build script');
  } else {
    log('error', '  Missing build script');
    return false;
  }
  
  return true;
}

function validateRootPackageJson() {
  const packagePath = path.join(ROOT_DIR, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  log('info', 'Validating root package.json:');
  
  const checks = [
    { key: 'build:hub', description: 'Hub build script' },
    { key: 'build:guide', description: 'Guide build script' }
  ];
  
  let allValid = true;
  for (const check of checks) {
    if (pkg.scripts && pkg.scripts[check.key]) {
      log('success', `  ${check.description}`);
    } else {
      log('error', `  Missing ${check.description}`);
      allValid = false;
    }
  }
  
  return allValid;
}

// Main validation
let overallValid = true;

console.log(`${colors.cyan}📁 Project Structure${colors.reset}`);
overallValid &= checkFileExists(path.join(ROOT_DIR, 'package.json'), 'Root package.json');
overallValid &= checkFileExists(path.join(ROOT_DIR, 'netlify.toml'), 'Root netlify.toml');

console.log(`\n${colors.cyan}🏢 LaxyHub App${colors.reset}`);
overallValid &= checkFileExists(path.join(APPS_DIR, 'LaxyHub', 'package.json'), 'LaxyHub package.json');
overallValid &= checkFileExists(path.join(APPS_DIR, 'LaxyHub', 'netlify.toml'), 'LaxyHub netlify.toml');
overallValid &= checkFileExists(path.join(APPS_DIR, 'LaxyHub', 'src'), 'LaxyHub src directory');

console.log(`\n${colors.cyan}📱 LaxyGuide App${colors.reset}`);
overallValid &= checkFileExists(path.join(APPS_DIR, 'LaxyGuide', 'package.json'), 'LaxyGuide package.json');
overallValid &= checkFileExists(path.join(APPS_DIR, 'LaxyGuide', 'netlify.toml'), 'LaxyGuide netlify.toml');
overallValid &= checkFileExists(path.join(APPS_DIR, 'LaxyGuide', 'src'), 'LaxyGuide src directory');

console.log(`\n${colors.cyan}📦 Shared Components${colors.reset}`);
overallValid &= checkFileExists(path.join(PACKAGES_DIR, 'LaxyComponents', 'package.json'), 'LaxyComponents package.json');
overallValid &= checkFileExists(path.join(PACKAGES_DIR, 'LaxyComponents', 'src'), 'LaxyComponents src directory');

console.log(`\n${colors.cyan}⚙️  Configuration Validation${colors.reset}`);
overallValid &= validateRootPackageJson();
overallValid &= validateNetlifyConfig(path.join(ROOT_DIR, 'netlify.toml'), 'Root (LaxyHub)');
overallValid &= validateNetlifyConfig(path.join(APPS_DIR, 'LaxyHub', 'netlify.toml'), 'LaxyHub');
overallValid &= validateNetlifyConfig(path.join(APPS_DIR, 'LaxyGuide', 'netlify.toml'), 'LaxyGuide');

console.log(`\n${colors.cyan}📱 App Dependencies${colors.reset}`);
overallValid &= validatePackageJson(path.join(APPS_DIR, 'LaxyHub', 'package.json'), 'LaxyHub');
overallValid &= validatePackageJson(path.join(APPS_DIR, 'LaxyGuide', 'package.json'), 'LaxyGuide');

// Summary
console.log('\n' + '='.repeat(50));
if (overallValid) {
  log('success', 'All configurations are valid! ✨');
  console.log('\n📋 Next Steps:');
  console.log('1. Commit and push changes to your repository');
  console.log('2. Set up LaxyHub Netlify site with package directory: apps/LaxyHub');
  console.log('3. Set up LaxyGuide Netlify site with package directory: apps/LaxyGuide');
  console.log('4. Both sites will build from root and deploy separately');
} else {
  log('error', 'Configuration issues found. Please fix the errors above.');
  process.exit(1);
}

console.log('\n📖 For detailed setup instructions, see:');
console.log('   docs/netlify-setup-guide.md');
