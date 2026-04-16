import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Set base to your repo name for GitHub Pages deployment
  // e.g., if repo is "solar-system-simulator", use '/solar-system-simulator/'
  base: process.env.GITHUB_PAGES === 'true' ? '/solar/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
