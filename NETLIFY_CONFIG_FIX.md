# 🚨 Netlify Build Configuration Fix

## Problem
Netlify is not reading the `netlify.toml` configuration file and is instead using NX commands (`nx run laxy-hub:build`), which is causing the build to fail.

## Root Cause
The Netlify dashboard build settings are overriding the `netlify.toml` configuration file.

## Solution

### Step 1: Clear Netlify Dashboard Settings
Go to your LaxyHub Netlify project dashboard:

1. **Navigate to**: Site Settings → Build & Deploy → Build Settings
2. **Clear the following fields** (leave them empty):
   - Build command: `[LEAVE EMPTY]`
   - Publish directory: `[LEAVE EMPTY]`
   - Base directory: `[LEAVE EMPTY]`

### Step 2: Verify netlify.toml Location
Ensure the `netlify.toml` file is in the **root of your repository** (not in the apps/LaxyHub folder).

Current correct location: `/LaxyMonoRepo/netlify.toml`

### Step 3: Update netlify.toml (if needed)
The current `netlify.toml` should contain:

```toml
# Netlify Configuration for LaxyHub
[build]
  base = "apps/LaxyHub/"
  publish = "build"
  command = "cd ../../ && npm install --legacy-peer-deps --no-optional && npm install @rollup/rollup-linux-x64-gnu --save-dev && npm run build:hub"

[build.environment]
  NODE_VERSION = "22"
  NPM_CONFIG_LEGACY_PEER_DEPS = "true"
  NPM_CONFIG_FUND = "false"
  NPM_CONFIG_AUDIT = "false"

[context.production]
  ignore = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF apps/LaxyHub/ packages/"

[context.deploy-preview]
  ignore = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF apps/LaxyHub/ packages/"

[context.develop]
  command = "cd ../../ && npm install --legacy-peer-deps && npm run build:hub"
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 4: Alternative - Manual Settings (if clearing doesn't work)
If Netlify still doesn't read the config file, manually set these in the dashboard:

**Build Settings:**
- Base directory: `apps/LaxyHub`
- Build command: `cd ../../ && npm install --legacy-peer-deps --no-optional && npm install @rollup/rollup-linux-x64-gnu --save-dev && npm run build:hub`
- Publish directory: `apps/LaxyHub/build`

**Environment Variables:**
```
NODE_VERSION = 22
NPM_CONFIG_LEGACY_PEER_DEPS = true
NPM_CONFIG_FUND = false
NPM_CONFIG_AUDIT = false
```

### Step 5: Trigger New Deploy
After making changes:
1. Trigger a new deploy
2. Check that it reads the configuration correctly
3. Monitor the build logs for the correct commands

## What Should Happen

The build log should show:
```
10:34:20 PM: ❯ Config file
10:34:20 PM:   /build/repo/netlify.toml

10:34:20 PM: $ cd ../../ && npm install --legacy-peer-deps --no-optional && npm install @rollup/rollup-linux-x64-gnu --save-dev && npm run build:hub
```

NOT:
```
10:34:20 PM: ❯ Config file
10:34:20 PM:   No config file was defined: using default values.

10:34:20 PM: $ nx run laxy-hub:build
```

## Priority Actions

1. **IMMEDIATE**: Clear all build settings in Netlify dashboard
2. **VERIFY**: Ensure `netlify.toml` is in repository root
3. **DEPLOY**: Trigger new deployment
4. **MONITOR**: Check build logs for correct configuration

This should resolve the build configuration issue! 🚀
