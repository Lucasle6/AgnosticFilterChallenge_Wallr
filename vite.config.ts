import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: './src/example',
  resolve: {
    alias: {
      '@agfilter/core': resolve(__dirname, './src/lib/index.ts'),
    },
  },
  build: {
    outDir: '../../dist-example',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: resolve(__dirname, './tests/setup.ts'),
    include: [resolve(__dirname, './tests/**/*.{test,spec}.{ts,tsx}')],
    root: resolve(__dirname, '.'),
  },
});