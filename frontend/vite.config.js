import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:5000',
      '/events': 'http://localhost:5000',
      '/tasks': 'http://localhost:5000',
      '/rsvps': 'http://localhost:5000'
    }
  }
})
