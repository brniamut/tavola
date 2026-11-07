import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const library = (path: string): string =>
  fileURLToPath(new URL(`../../packages/react/src/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Use the library source, so changes show up without a build.
  resolve: {
    alias: [
      { find: '@tavola/react/styles.css', replacement: library('styles/styles.css') },
      { find: '@tavola/react', replacement: library('index.ts') },
    ],
  },
});
