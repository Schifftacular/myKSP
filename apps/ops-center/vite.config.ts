import { defineConfig } from 'vite';

const bridge = process.env.MYKSP_BRIDGE ?? 'http://127.0.0.1:8787';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': bridge,
      '/ws': { target: bridge.replace(/^http/, 'ws'), ws: true },
    },
  },
  build: { target: 'es2022', chunkSizeWarningLimit: 900 },
});
