import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/cp': {
        target: 'https://cp-rating-api.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cp/, '')
      }
    }
  }
})
