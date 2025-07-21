# LaxyStudio

A modern React application built with Vite and optimized for Netlify deployment.

## Features

- ⚡ Fast development with Vite
- 🎨 Modern React architecture
- 🌐 Netlify deployment ready
- 📱 Responsive design
- 🔄 Optimized build process

## Getting Started

### Development

```bash
# Start development server
npm run start

# Or using nx
nx serve laxy-studio
```

### Building

```bash
# Build for production
npm run build

# Or using nx
nx build laxy-studio
```

### Testing

```bash
# Run tests
npm run test

# Or using nx
nx test laxy-studio
```

## Deployment

This app is configured for seamless Netlify deployment with:

- Optimized build scripts
- Platform-specific dependency handling
- Proper redirects for SPA routing
- Performance optimizations

## Project Structure

```
apps/LaxyStudio/
├── public/           # Static assets
├── src/             # Source code
│   ├── App.jsx      # Main app component
│   ├── App.css      # App styles
│   ├── index.jsx    # Entry point
│   └── index.css    # Global styles
├── scripts/         # Build scripts
├── netlify.toml     # Netlify configuration
└── vite.config.mjs  # Vite configuration
```

## Configuration

- **Vite**: Modern build tool with fast HMR
- **React**: UI library with hooks
- **Netlify**: Deployment platform
- **NX**: Monorepo management
