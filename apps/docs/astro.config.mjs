// @ts-check
import { fileURLToPath } from 'node:url';

import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

/**
 * A path in the library source, so the docs show the current code without a build.
 * @param {string} path Path inside packages/react/src.
 * @returns {string} The absolute path.
 */
const library = (path) =>
  fileURLToPath(new URL(`../../packages/react/src/${path}`, import.meta.url));

export default defineConfig({
  // GitHub Pages serves the site at https://brniamut.github.io/tavola/.
  site: 'https://brniamut.github.io',
  base: '/tavola',
  integrations: [
    react(),
    starlight({
      title: 'Tavola',
      description: 'An admin data table for React, on TanStack Table.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/brniamut/tavola' }],
      logo: { light: './src/assets/logo-light.svg', dark: './src/assets/logo-dark.svg' },
      favicon: '/favicon.svg',
      customCss: ['@fontsource-variable/fraunces/full.css', './src/styles/docs.css'],
      sidebar: [
        { label: 'Getting started', slug: 'getting-started' },
        {
          label: 'Guides',
          items: [
            'guides/columns',
            'guides/server-mode',
            'guides/url-and-caching',
            'guides/selection',
            'guides/layout',
            'guides/styling',
            'guides/themes',
            'guides/texts-and-accessibility',
          ],
        },
        { label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
      ],
    }),
  ],
  vite: {
    resolve: {
      alias: [
        { find: '@tavola/react/styles.css', replacement: library('styles/styles.css') },
        { find: '@tavola/react', replacement: library('index.ts') },
      ],
    },
  },
});
