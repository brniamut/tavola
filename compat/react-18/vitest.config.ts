import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);
const library = fileURLToPath(new URL('../../packages/react/', import.meta.url));

/**
 * The folder of a package in this workspace. Found from its main entry, since not every package
 * exports its package.json.
 * @param name The package name.
 * @returns The absolute path of the package folder.
 */
function packageRoot(name: string): string {
  const entry = require.resolve(name);
  const marker = `node_modules/${name}`;
  return entry.slice(0, entry.lastIndexOf(marker) + marker.length);
}

/**
 * Resolves a package and its subpaths to this workspace's copy, the one built against React 18.
 * @param name The package name.
 * @returns A Vite alias.
 */
function local(name: string): { find: RegExp; replacement: string } {
  return {
    find: new RegExp(`^${name.replace('/', '\\/')}(\\/.*)?$`),
    replacement: `${packageRoot(name)}$1`,
  };
}

/**
 * The library's own test files, run with React 18. The library source imports react, TanStack
 * and dnd-kit; the aliases make those imports resolve here, where React 18 is the only React.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      'react-dom',
      'react',
      '@tanstack/react-table',
      '@dnd-kit/react',
      '@testing-library/react',
      '@testing-library/user-event',
      '@testing-library/dom',
      '@tanstack/query-core',
    ].map(local),
  },
  test: {
    name: 'react-18',
    root: library,
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}', '../../compat/react-18/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    restoreMocks: true,
  },
});
