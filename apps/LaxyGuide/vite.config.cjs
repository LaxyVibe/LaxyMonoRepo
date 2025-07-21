const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const path = require('path')

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [
    react({
      // Include .js files for JSX processing
      include: '**/*.{jsx,tsx,js,ts}',
      babel: {
        plugins: [],
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }]
        ]
      }
    })
  ],
  base: '/', // Ensure base path is set to root for SPA routing
  resolve: {
    alias: {
      // Enable importing from shared packages
      '@laxy/components': path.resolve(__dirname, '../../packages/LaxyComponents/src'),
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    // Ensure assets are generated correctly for SPA
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Handle environment variables (change from REACT_APP_ to VITE_)
  envPrefix: 'VITE_',
  // Disable esbuild to avoid platform-specific issues
  esbuild: false
})
