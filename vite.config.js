/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/scops/' : '/',
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_BFF_PROXY_TARGET || 'http://localhost:8787',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['react-is']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
}))
