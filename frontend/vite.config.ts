import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite conexões externas no container
    port: 5173,
    watch: {
      usePolling: true, // Força o Docker no Windows a detectar mudanças de arquivo na hora!
    },
  },
});