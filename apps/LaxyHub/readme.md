# LaxyHub

LaxyHub is a modern React-based travel companion application that provides local tourism information and recommendations.

## Overview

LaxyHub serves as the main hub for discovering local attractions, managing travel itineraries, and accessing personalized recommendations. Built with React and integrated into an Nx monorepo structure.

## Technology Stack

- **Frontend**: React 18, Material-UI (MUI)
- **Build Tool**: Vite
- **Testing**: Vitest, React Testing Library
- **Styling**: CSS, Material-UI theming
- **Monorepo**: Nx workspace
- **Package Manager**: npm

## Development

### Prerequisites

- Node.js 22+
- npm

### Getting Started

1. **Install dependencies** (from the monorepo root):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npx nx serve laxy-hub
   ```
   
   The application will be available at `http://localhost:3000`

### Available Commands

From the monorepo root, you can run:

- `npx nx serve laxy-hub` - Start development server
- `npx nx build laxy-hub` - Build for production
- `npx nx test laxy-hub` - Run tests
- `npx nx lint laxy-hub` - Run ESLint
- `npx nx fetch-api laxy-hub` - Fetch API data for development

### Project Structure

```
apps/LaxyHub/
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   ├── config/       # Configuration files
│   ├── context/      # React contexts
│   ├── hooks/        # Custom hooks
│   ├── mocks/        # Mock data for development
│   ├── utils/        # Utility functions
│   └── ...
├── scripts/          # Build and utility scripts
└── build/           # Production build output
```

## Features

- **Multi-language Support**: Supports English, Japanese, Korean, and Chinese
- **Local Tourism**: Discover nearby attractions and points of interest
- **Responsive Design**: Optimized for mobile and desktop
- **PWA Ready**: Progressive Web App capabilities
- **Analytics Integration**: Google Analytics tracking
- **QR Code Generation**: For sharing and quick access

## Environment

The application runs on port 3000 in development mode and supports hot reloading for efficient development.

## Build & Deployment

To create and validate a production build from the monorepo root:

```bash
npm run build:hub
```

The build artifacts will be stored in the `apps/LaxyHub/build/` directory.

The build runs two safeguards automatically:

- It uses the committed public GA fallback `G-102C698SDQ` when
  `VITE_GA_LAXY_HUB_MEASUREMENT_ID` is not set. The environment variable can
  still override the fallback.
- It fails if the compiled entry asset does not contain the expected GA ID or
  if any Japanese JSON source contains Unicode replacement characters (`�`).

Netlify Git-triggered builds are disabled for LaxyHub. Pushing or merging code
does not update production. To create a manual draft deploy:

```bash
cd apps/LaxyHub
npm run build
npx netlify deploy --no-build --dir "$(pwd)/build"
```

Check the draft URL before promoting that same deploy in Netlify. Always keep
`--no-build`: the uploaded files must be the exact bundle that passed the local
post-build checks.

## Contributing

This project is part of the LaxyVibe monorepo. Follow the established patterns and coding standards when contributing.
