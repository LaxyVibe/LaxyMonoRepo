# Netlify Monorepo Setup Guide

This guide explains how to deploy two separate apps (LaxyHub and LaxyGuide) from a monorepo to separate Netlify projects.

## Project Structure

```
LaxyMonoRepo/
├── apps/
│   ├── LaxyHub/
│   │   ├── netlify.toml          # App-specific config
│   │   ├── package.json
│   │   └── src/
│   └── LaxyGuide/
│       ├── netlify.toml          # App-specific config
│       ├── package.json
│       └── src/
├── packages/
│   └── LaxyComponents/           # Shared components
├── netlify.toml                  # Default config for LaxyHub
└── package.json                  # Root workspace config
```

## Netlify Configuration Strategy

**Recommended Approach (Following Netlify Best Practices):**

1. **Base Directory**: Root (`/`) - for dependency installation
2. **Package Directory**: App-specific (`apps/LaxyHub` or `apps/LaxyGuide`)
3. **Publish Directory**: Relative to package directory (`build`)
4. **Build Command**: Runs from root, builds specific app

## Setting Up LaxyHub (Primary Site)

### Option 1: Use Root Configuration (Recommended)
1. **Connect Repository**: Import from your Git repository
2. **Build Settings**:
   - **Base directory**: Leave empty (uses root `/`)
   - **Package directory**: `apps/LaxyHub`
   - **Build command**: `npm install --legacy-peer-deps --no-optional && npm install @rollup/rollup-linux-x64-gnu --save-dev && npm run build:hub`
   - **Publish directory**: `build`

### Option 2: Manual Configuration
If the automatic detection doesn't work:
1. **Build Settings** → **Configure**
2. Set the values above manually
3. The app will use `/apps/LaxyHub/netlify.toml` for additional config

## Setting Up LaxyGuide (Secondary Site)

### Steps:
1. **Add New Site**: In Netlify dashboard, click "Add new site"
2. **Import Repository**: Select the same repository
3. **Configure for LaxyGuide**:
   - **Base directory**: Leave empty (uses root `/`)
   - **Package directory**: `apps/LaxyGuide`
   - **Build command**: `npm install --legacy-peer-deps --no-optional && npm install @rollup/rollup-linux-x64-gnu --save-dev && npm run build:guide`
   - **Publish directory**: `build`

## How It Works

### Dependency Management
- **Root `package.json`**: Defines workspace and common dependencies
- **App `package.json`**: App-specific dependencies including shared components
- **Build Process**: Runs `npm install` from root, builds from app directory

### Shared Components
- Located in `packages/LaxyComponents`
- Referenced as `"@laxy/components": "file:../../packages/LaxyComponents"`
- Automatically linked during workspace installation

### Build Process
1. **Install**: Root-level `npm install` with legacy peer deps
2. **Rollup Fix**: Install Linux-compatible Rollup binary for Netlify
3. **Build**: Run app-specific build script (`build:hub` or `build:guide`)
4. **Output**: Generated in `apps/{AppName}/build/`

## Environment Variables

Set in Netlify UI under Site settings → Environment variables:
- `NODE_VERSION`: 22
- `NPM_CONFIG_LEGACY_PEER_DEPS`: true
- `NPM_CONFIG_FUND`: false
- `NPM_CONFIG_AUDIT`: false

## Build Optimization

### Conditional Builds
Each app only rebuilds when its files or shared components change:
```toml
[context.production]
  ignore = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF apps/LaxyHub/ packages/"
```

### Branch-Specific Builds
- **Production**: Full build with security flags
- **Development**: Faster build without optional deps
- **Deploy Preview**: Same as production for testing

## Troubleshooting

### "No config file was defined"
- Ensure `netlify.toml` exists in the package directory
- Check that package directory is set correctly in Netlify UI
- Verify build command runs from correct directory

### Rollup Build Errors
- The build includes `@rollup/rollup-linux-x64-gnu` installation
- This fixes compatibility issues on Netlify's Linux build environment

### Shared Component Issues
- Ensure `npm install` runs from root before building
- Check that `@laxy/components` dependency points to correct path
- Verify shared components are exported correctly

## File Locations

- **LaxyHub Config**: `/apps/LaxyHub/netlify.toml`
- **LaxyGuide Config**: `/apps/LaxyGuide/netlify.toml`
- **Root Config**: `/netlify.toml` (fallback for LaxyHub)
- **Shared Components**: `/packages/LaxyComponents/`

## Next Steps

1. Push changes to your Git repository
2. Set up LaxyHub site (should auto-detect or use manual config)
3. Set up LaxyGuide as a separate site with package directory `apps/LaxyGuide`
4. Test both deployments
5. Configure custom domains if needed

## Benefits of This Setup

- ✅ **Separate Deployments**: Each app deploys independently
- ✅ **Shared Code**: Components shared without duplication
- ✅ **Optimized Builds**: Only builds when relevant files change
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Scalable**: Easy to add more apps to the monorepo
