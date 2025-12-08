import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@generated': path.resolve(__dirname, './src/generated'),
      '@api': path.resolve(__dirname, './src/api'),
    },
  },
  server: {
    port: 5173,
    host: true, // iframeで使用するため外部アクセスを許可
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

