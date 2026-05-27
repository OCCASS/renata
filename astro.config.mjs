import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://renata-fizika.ru',
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
