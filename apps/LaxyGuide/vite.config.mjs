import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
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
      '@laxy/components': path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../packages/LaxyComponents/src'),
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src')
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
  // Disable esbuild to avoid version conflicts
  esbuild: false
})
