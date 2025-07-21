import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4202,
    host: 'localhost'
  },
  preview: {
    port: 4302,
    host: 'localhost'
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          'react-admin': ['react-admin', 'ra-data-json-server'],
          'mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
