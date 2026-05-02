import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Stellar Reach Vite configuration.
// Builds a static, mobile-first PWA. The base path is set via the VITE_BASE
// environment variable so the same build can target a project Pages site
// (e.g. "/galactic-trader/") or a root host.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
  },
  server: {
    host: true,
    port: 5173,
  },
});
