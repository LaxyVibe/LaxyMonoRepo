# LaxyComponents

Shared components library for the Laxy ecosystem.

## Components

### Footer

A dynamic footer component that can be used across different Laxy apps with customizable configuration.

#### Usage

```javascript
import { Footer } from '@laxy/LaxyComponents/src/components';

// Basic usage with default "Powered by {{value}}" text
<Footer />

// With custom configuration
<Footer 
  config={{ 
    poweredByLabel: "Built with {{value}}" 
  }}
  logoStyle={{ height: '30px' }}
  containerStyle={{ backgroundColor: '#f0f0f0' }}
/>
```

#### Props

- `config` (Object): Configuration object
  - `poweredByLabel` (String): Template string with `{{value}}` placeholder for logo position
- `defaultText` (String): Default text when no config provided (default: "Powered by {{value}}")
- `logoStyle` (Object): Custom styles for the logo image
- `containerStyle` (Object): Custom styles for the footer container

#### App-Specific Wrappers

Each app can create its own wrapper component:

**LaxyHub**: Uses `HubFooter` which pulls configuration from hub-application-config
**LaxyGuide**: Can use `GuideFooter` for Guide-specific styling and configuration

## Assets

### Logo

The shared logo is available at:
```javascript
import { logo } from '@laxy/LaxyComponents/src/assets';
// or
import logo from '@laxy/LaxyComponents/src/assets/logos/logo.svg';
```

## Development

This package contains shared components and assets that can be used across the Laxy monorepo apps.

### Structure
```
src/
├── index.js              # Main entry point
├── components/
│   ├── index.js          # Component exports
│   └── common/
│       └── Footer.js     # Shared Footer component
└── assets/
    ├── index.js          # Asset exports
    └── logos/
        └── logo.svg      # Shared logo
```
