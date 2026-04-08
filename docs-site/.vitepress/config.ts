import { defineConfig } from 'vitepress';
import { resolve } from 'path';

export default defineConfig({
  title: 'durate',
  description: 'Tiny millisecond conversion utility',
  vite: {
    resolve: {
      alias: {
        durate: resolve(__dirname, '../../src/index.ts'),
      },
    },
  },
  themeConfig: {
    nav: [
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'API', link: '/api/parse' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [{ text: 'Getting Started', link: '/getting-started' }],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'parse', link: '/api/parse' },
          { text: 'parseStrict', link: '/api/parse-strict' },
          { text: 'format', link: '/api/format' },
          { text: 'durate', link: '/api/durate' },
          { text: 'toUnit', link: '/api/toUnit' },
          { text: 'parseISO', link: '/api/parseISO' },
          { text: 'formatISO', link: '/api/formatISO' },
          { text: 'Arithmetic', link: '/api/arithmetic' },
          { text: 'Comparison', link: '/api/comparison' },
          { text: 'Types', link: '/api/types' },
        ],
      },
      {
        text: 'Migration',
        items: [{ text: 'From ms', link: '/migration' }],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/akoreh/durate' }],
  },
});
