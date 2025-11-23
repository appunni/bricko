import { defineConfig } from 'vite';

export default defineConfig({
  base: '/bricko/', // Base path for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});