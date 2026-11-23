import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works on GitHub Pages (/pdf-npm-package/) or any sub-path
export default defineConfig({
  base: './',
  plugins: [react()],
});
