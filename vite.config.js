import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // LOCAL:  target: 'http://localhost/drithi-agro/backend',
        // RENDER: target: 'https://dhrithi-agro-backend-2.onrender.com',
        target: process.env.VITE_BACKEND_URL || 'http://localhost/drithi-agro/backend',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
