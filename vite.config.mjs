import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  publicDir: command === 'build' || isPreview ? 'public-packaged' : 'public',
  server: {
    port: 3000,
    open: false,
  },
}));
