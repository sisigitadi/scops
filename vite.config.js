import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'pwa-icon-512.png'],
      manifest: {
        name: 'SOCOps - Tactical Command Center',
        short_name: 'SOCOps',
        description: 'High-Density Clinical Forensic SOC Operations Center',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
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
