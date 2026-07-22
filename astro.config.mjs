import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://renchik-physics.ru',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  server: {
    port: 4321,
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
