/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/LaxyHub',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths()],

  // Configure entry point for React app
  build: {
    outDir: '../../dist/apps/LaxyHub',
    emptyOutDir: true,
    reportCompressedSize: true,
    rollupOptions: {
      input: resolve(__dirname, 'public/index.html'),
    },
  },

  // Define globals for compatibility
  define: {
    global: 'globalThis',
  },

  // Node.js polyfills for crypto compatibility
  optimizeDeps: {
    include: ['crypto-js'],
  },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/setupTests.js'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/LaxyHub',
      provider: 'v8',
    },
  },
});
