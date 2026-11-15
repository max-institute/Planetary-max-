import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5173,
    proxy: {
      // Root storefront/auth APIs are served by the root Worker.
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      // Portal-OS runs separately so its D1 binding stays isolated.
      '/v1': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
});
