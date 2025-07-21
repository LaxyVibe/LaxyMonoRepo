# LaxyStudio

LaxyStudio is a modern admin dashboard built with React Admin framework, part of the LaxyMonoRepo.

## Features

- 🎨 Beautiful and modern UI with Material-UI
- 📊 Dashboard with overview and analytics
- 👥 User management (view, edit, create)
- 📝 Post management (view, edit, create, delete)
- 💬 Comment management
- 🔍 Search and filtering capabilities
- 📱 Responsive design
- 🚀 Built with Vite for fast development

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

From the project root:

```bash
cd apps/LaxyStudio
npm install
```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:4202`

## Building

To build for production:

```bash
npm run build
```

### Netlify Deployment

LaxyStudio is configured for Netlify deployment with:

- **netlify.toml** - Netlify configuration with optimized build settings
- **scripts/netlify-build.js** - Custom build script handling Rollup dependencies
- **_redirects** - SPA routing support

The build process includes:
- Automatic dependency installation with legacy peer deps support
- Platform-specific Rollup package installation for Linux environments
- Optimized chunk splitting for better performance
- Build verification and error handling

### Building

To build for production:

```bash
npm run build
```

### Testing

To run tests:

```bash
npm test
```

## Tech Stack

- **React** - UI library
- **React Admin** - Admin dashboard framework
- **Material-UI** - Component library
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework
- **TypeScript** - Type safety

## Data Source

The application uses JSONPlaceholder (https://jsonplaceholder.typicode.com) as a demo API to showcase the admin interface capabilities.

## Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx     # Main dashboard component
│   ├── users.jsx         # User management components
│   └── posts.jsx         # Post management components
├── App.jsx               # Main application component
├── index.jsx             # Application entry point
└── index.css             # Global styles
```

## Available Resources

- **Users** - Manage user accounts and profiles
- **Posts** - Create, edit, and view blog posts  
- **Comments** - View and moderate user comments

## Customization

The dashboard can be easily customized by:

1. Adding new resources in `App.jsx`
2. Creating custom components in the `components/` directory
3. Modifying the dashboard layout in `components/Dashboard.jsx`
4. Styling with Material-UI theme customization
