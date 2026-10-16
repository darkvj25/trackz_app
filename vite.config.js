import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/trackz_app/api': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://127.0.0.1/trackz_app',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
