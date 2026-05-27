import { defineConfig } from 'astro/config';

// When deployed at occass.github.io/renata, Astro needs the /renata prefix.
// When moving to renata-fizika.ru at apex, delete the base line and the
// CNAME-based custom domain will serve everything from /.
export default defineConfig({
  site: 'https://occass.github.io',
  base: '/renata/',
  trailingSlash: 'ignore',
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
