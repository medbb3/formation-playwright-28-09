import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // allowedHosts : le navigateur des tests en Docker appelle le front par son nom de service (http://frontend:5173)
  server: { host: true, port: 5173, strictPort: true, allowedHosts: ['frontend', 'localhost'] },
});
