import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward all /api requests to Express
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      // Forward Socket.IO traffic
      '/socket.io': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
